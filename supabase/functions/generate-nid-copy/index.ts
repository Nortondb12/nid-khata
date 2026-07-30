import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { initWasm, Resvg } from "npm:@resvg/resvg-wasm@2.6.2";
import { jsPDF } from "npm:jspdf@2.5.2";
import { initShaper, measureText, shapeText, type Weight } from "./shaper.ts";

const WASM_URL = "https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm";

let wasmReady: Promise<void> | null = null;

const ensureWasm = () => {
  if (!wasmReady) {
    wasmReady = (async () => {
      const res = await fetch(WASM_URL);
      await initWasm(new Uint8Array(await res.arrayBuffer()));
    })();
  }
  return wasmReady;
};

const text = (max: number) => z.string().trim().max(max);

const BodySchema = z.object({
  format: z.enum(["pdf", "png"]),
  data: z.object({
    name_bn: text(120),
    name_en: text(120),
    father_name: text(120),
    mother_name: text(120),
    date_of_birth: text(32),
    nid_number: z.string().trim().regex(/^\d{10}$|^\d{13}$|^\d{17}$/, {
      message: "NID নম্বর ১০, ১৩ অথবা ১৭ সংখ্যার হতে হবে।",
    }),
    address: text(400),
  }),
});

const maskNid = (nid: string) => `${"•".repeat(Math.max(nid.length - 4, 0))}${nid.slice(-4)}`;

const sha256Hex = async (input: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const W = 1000;
const H = 1400;
const CONTENT_W = W - 140;

// deno-lint-ignore no-explicit-any
type Shaper = any;

/** Greedy word wrap based on real shaped widths. */
const wrapByWidth = (
  shaper: Shaper,
  value: string,
  size: number,
  weight: Weight,
  maxWidth: number,
) => {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measureText(shaper, candidate, size, weight) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
};

const buildSvg = (
  shaper: Shaper,
  d: z.infer<typeof BodySchema>["data"],
  issuedAt: string,
  checksum: string,
) => {
  const masked = maskNid(d.nid_number);
  const out: string[] = [];
  const push = (
    value: string,
    x: number,
    y: number,
    size: number,
    fill: string,
    weight: Weight = "regular",
    opacity = 1,
    transform?: string,
  ) => {
    if (!value) return;
    out.push(shapeText(shaper, value, { x, y, size, weight, fill, opacity, transform }).svg);
  };

  const LABEL = "#6b7280";
  const VALUE = "#0f172a";
  const BRAND = "#0f766e";

  // Header
  push("গণপ্রজাতন্ত্রী বাংলাদেশ সরকার", 70, 90, 38, "#ffffff", "bold");
  push("জাতীয় পরিচয়পত্র — সার্ভার কপি", 70, 145, 26, "#ffffff", "regular");

  // Watermark tiles
  const watermarkText = `${masked} • ${issuedAt}`;
  const tiles: string[] = [];
  for (let y = 120; y < H; y += 190) {
    for (let x = -140; x < W; x += 430) {
      tiles.push(
        shapeText(shaper, watermarkText, {
          x,
          y,
          size: 30,
          weight: "bold",
          fill: BRAND,
          opacity: 0.1,
          transform: `rotate(-28 ${x} ${y})`,
        }).svg,
      );
    }
  }

  // Name block
  push("নাম", 70, 290, 22, LABEL);
  push(d.name_bn, 70, 340, 44, VALUE, "bold");
  push(d.name_en, 70, 386, 26, LABEL);

  // Rows
  const rows: Array<[string, string]> = [
    ["পিতার নাম", d.father_name],
    ["মাতার নাম", d.mother_name],
    ["জন্ম তারিখ", d.date_of_birth],
    ["NID নম্বর", masked],
  ];
  rows.forEach(([label, value], i) => {
    push(label, 70, 520 + i * 92, 22, LABEL);
    push(value, 70, 556 + i * 92, 30, VALUE, "bold");
  });

  // Address
  push("ঠিকানা", 70, 888, 22, LABEL);
  wrapByWidth(shaper, d.address, 30, "bold", CONTENT_W)
    .slice(0, 4)
    .forEach((line, i) => push(line, 70, 926 + i * 42, 30, VALUE, "bold"));

  // Footer
  push(`তৈরি হয়েছে: ${issuedAt} • NID: ${masked}`, 70, H - 108, 20, "#64748b");
  push(`যাচাই কোড: ${checksum}`, 70, H - 70, 22, BRAND, "bold");
  push(
    "এই কপিটি সার্ভারে জেনারেট করা হয়েছে; ওয়াটারমার্ক ও যাচাই কোড পরিবর্তন করা যাবে না।",
    70,
    H - 32,
    20,
    "#64748b",
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <rect x="0" y="0" width="${W}" height="200" fill="${BRAND}"/>
  <g>${tiles.join("")}</g>
  <line x1="70" y1="430" x2="${W - 70}" y2="430" stroke="#e2e8f0" stroke-width="2"/>
  <line x1="70" y1="${H - 150}" x2="${W - 70}" y2="${H - 150}" stroke="#e2e8f0" stroke-width="2"/>
  ${out.join("\n  ")}
</svg>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "POST") return json({ error: "অনুমোদিত নয়।" }, 405);

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json(
        { error: "প্রদত্ত তথ্য সঠিক নয়।", details: parsed.error.flatten().fieldErrors },
        400,
      );
    }

    const { format, data } = parsed.data;
    const issuedAt = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
    const digest = await sha256Hex(
      `${data.nid_number}|${data.date_of_birth}|${issuedAt}|nid-server-copy`,
    );
    const checksum = digest.slice(0, 12).toUpperCase().replace(/(.{4})(?=.)/g, "$1-");

    const [, shaper] = await Promise.all([ensureWasm(), initShaper()]);

    const svg = buildSvg(shaper, data, issuedAt, checksum);
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: W } });
    const png = resvg.render().asPng();

    if (format === "png") {
      return json({
        format: "png",
        mimeType: "image/png",
        checksum,
        issuedAt,
        base64: encodeBase64(png),
      });
    }

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const ratio = W / H;
    let w = pageW - margin * 2;
    let h = w / ratio;
    if (h > pageH - margin * 2) {
      h = pageH - margin * 2;
      w = h * ratio;
    }
    pdf.addImage(
      `data:image/png;base64,${encodeBase64(png)}`,
      "PNG",
      (pageW - w) / 2,
      margin,
      w,
      h,
      undefined,
      "FAST",
    );
    const pdfBytes = new Uint8Array(pdf.output("arraybuffer") as ArrayBuffer);

    return json({
      format: "pdf",
      mimeType: "application/pdf",
      checksum,
      issuedAt,
      base64: encodeBase64(pdfBytes),
    });
  } catch (_err) {
    return json({ error: "ফাইল তৈরি করা যায়নি। আবার চেষ্টা করুন।" }, 500);
  }
});

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
