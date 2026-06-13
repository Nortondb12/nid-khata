import type { NidData, NidLookupRequest } from "../types";
import { nidDataSchema } from "../schema";

const API_ENDPOINT =
  (import.meta.env.VITE_NID_API_URL as string | undefined) ??
  "https://your-api-endpoint.com/nid-verify";

const TIMEOUT_MS = 15_000;

export class NidLookupError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "NidLookupError";
  }
}

const mapStatusToMessage = (status: number): string => {
  if (status === 400) return "প্রদত্ত তথ্য সঠিক নয়। অনুগ্রহ করে যাচাই করুন।";
  if (status === 401 || status === 403) return "অনুমতি নেই। পরে আবার চেষ্টা করুন।";
  if (status === 404) return "এই তথ্যের সাথে কোনো NID খুঁজে পাওয়া যায়নি।";
  if (status === 429) return "অনেক বেশি অনুরোধ। কিছু সময় পর আবার চেষ্টা করুন।";
  if (status >= 500) return "সার্ভারে সমস্যা হয়েছে। কিছু সময় পর আবার চেষ্টা করুন।";
  return "তথ্য আনতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";
};

export async function lookupNid(
  payload: NidLookupRequest,
  signal?: AbortSignal,
): Promise<NidData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => controller.abort());

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new NidLookupError(mapStatusToMessage(response.status));
    }

    const json = await response.json();
    const parsed = nidDataSchema.safeParse(json);
    if (!parsed.success) {
      throw new NidLookupError("সার্ভারের উত্তর প্রক্রিয়া করা যায়নি।", parsed.error);
    }
    return parsed.data;
  } catch (err) {
    if (err instanceof NidLookupError) throw err;
    if ((err as Error)?.name === "AbortError") {
      throw new NidLookupError("সময় শেষ হয়েছে। আবার চেষ্টা করুন।", err);
    }
    throw new NidLookupError("নেটওয়ার্ক সমস্যা। ইন্টারনেট সংযোগ যাচাই করুন।", err);
  } finally {
    clearTimeout(timeout);
  }
}
