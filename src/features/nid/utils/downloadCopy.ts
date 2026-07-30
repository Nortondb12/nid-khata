import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type DownloadFormat = "pdf" | "png";

export type DownloadStage = "preparing" | "rendering" | "encoding" | "saving" | "done";

export interface DownloadProgress {
  stage: DownloadStage;
  percent: number;
  message: string;
}

export type DownloadProgressHandler = (p: DownloadProgress) => void;

export class DownloadCancelledError extends Error {
  constructor() {
    super("ডাউনলোড বাতিল করা হয়েছে।");
    this.name = "DownloadCancelledError";
  }
}

const STAGE_MESSAGES: Record<DownloadStage, string> = {
  preparing: "প্রস্তুত করা হচ্ছে...",
  rendering: "সার্ভারে তৈরি করা হচ্ছে...",
  encoding: "ফাইল এনকোড করা হচ্ছে...",
  saving: "ফাইল সংরক্ষণ করা হচ্ছে...",
  done: "সম্পন্ন হয়েছে",
};

const emit = (cb: DownloadProgressHandler | undefined, stage: DownloadStage, percent: number) => {
  cb?.({ stage, percent, message: STAGE_MESSAGES[stage] });
};

const checkAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) throw new DownloadCancelledError();
};

const sanitizeFilename = (input: string) =>
  input.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "nid";

export interface NidCopyPayload {
  name_bn: string;
  name_en: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  nid_number: string;
  address: string;
}

export interface GeneratedCopy {
  checksum: string;
  issuedAt: string;
}

/**
 * Requests a server-generated, watermarked copy and saves it locally.
 * All rendering (watermark, provenance line, verification code) happens
 * in the edge function so it cannot be bypassed by client-side re-rendering.
 */
export async function downloadNidCopy(
  data: NidCopyPayload,
  format: DownloadFormat,
  onProgress?: DownloadProgressHandler,
  signal?: AbortSignal,
): Promise<GeneratedCopy> {
  const filename = `nid-server-copy-${sanitizeFilename(data.nid_number.slice(-4))}`;

  try {
    checkAborted(signal);
    emit(onProgress, "preparing", 8);

    emit(onProgress, "rendering", 30);
    const { data: result, error } = await supabase.functions.invoke("generate-nid-copy", {
      body: { format, data },
    });
    checkAborted(signal);

    if (error || !result?.base64) {
      throw new Error(result?.error ?? "ডাউনলোড তৈরি করা যায়নি। আবার চেষ্টা করুন।");
    }

    emit(onProgress, "encoding", 75);
    const blob = base64ToBlob(result.base64 as string, result.mimeType as string);
    checkAborted(signal);

    emit(onProgress, "saving", 92);
    triggerDownload(blob, `${filename}.${format}`);
    emit(onProgress, "done", 100);

    return { checksum: result.checksum as string, issuedAt: result.issuedAt as string };
  } catch (err) {
    if (err instanceof DownloadCancelledError) throw err;
    logger.error("Failed to generate NID copy download", err);
    throw new Error(
      err instanceof Error && err.message ? err.message : "ডাউনলোড তৈরি করা যায়নি। আবার চেষ্টা করুন।",
    );
  }
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
