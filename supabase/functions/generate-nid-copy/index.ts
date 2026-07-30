import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { initWasm, Resvg } from "npm:@resvg/resvg-wasm@2.6.2";
import { jsPDF } from "npm:jspdf@2.5.2";

const WASM_URL = "https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm";
const FONT_URLS = [
  "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansBengali/full/ttf/NotoSansBengali-Regular.ttf",
  "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansBengali/full/ttf/NotoSansBengali-Bold.ttf",
  "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/hinted/ttf/NotoSans-Regular.ttf",
  "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/hinted/ttf/NotoSans-Bold.ttf",
];


let wasmReady: Promise<void> | null = null;
let fontsPromise: Promise<Uint8Array[]> | null = null;

const ensureWasm = () => {
  if (!wasmReady) {
    wasmReady = (async () => {
      const res = await fetch(WASM_URL);
      await initWasm(new Uint8Array(await res.arrayBuffer()));
    })();
  }
  return wasmReady;
};

const ensureFonts = () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      FONT_URLS.map(async (url) => {
        const res = await fetch(url);
        return new Uint8Array(await res.arrayBuffer());
      }),
    );
  }
  return fontsPromise;
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

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const maskNid = (nid: string) => `${"•".repeat(Math.max(nid.length - 4, 0))}${nid.slice(-4)}`;

const sha256Hex = async (input: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const wrap = (value: string, perLine: number) => {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > perLine) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.length ? lines : [""];
};

const W = 1000;
const H = 1400;

const buildSvg = (
  d: z.infer<typeof BodySchema>["data"],
  issuedAt: string,
  checksum: string,
) => {
  const masked = maskNid(d.nid_number);
  const addressLines = wrap(d.address, 52).slice(0, 4);

  const rows: Array<[string, string]> = [
    ["পিতার নাম", d.father_name],
    ["মাতার নাম", d.mother_name],
    ["জন্ম তারিখ", d.date_of_birth],
    ["NID নম্বর", masked],
  ];

  const rowsSvg = rows
    .map(
      ([label, value], i) => `
    <text x="70" y="${520 + i * 92}" class="label">${esc(label)}</text>
    <text x="70" y="${552 + i * 92}" class="value">${esc(value)}</text>`,
    )
    .join("");

  const addressSvg = addressLines
    .map((line, i) => `<text x="70" y="${920 + i * 36}" class="value">${esc(line)}</text>`)
    .join("");

  const watermarkText = `${masked} • ${issuedAt}`;
  const tiles: string[] = [];
  for (let y = 120; y < H; y += 190) {
    for (let x = -140; x < W; x += 430) {
      tiles.push(
        `<text x="${x}" y="${y}" class="wm" transform="rotate(-28 ${x} ${y})">${esc(watermarkText)}</text>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <style>
    text { font-family: 'Noto Sans Bengali', 'Noto Sans'; }
    .label { font-size: 22px; fill: #6b7280; }
    .value { font-size: 30px; fill: #0f172a; font-weight: bold; }
    .wm { font-size: 30px; fill: #0f766e; opacity: 0.10; font-weight: bold; }
    .hdr { fill: #ffffff; font-weight: bold; }
    .foot { font-size: 20px; fill: #64748b; }
    .mono { font-size: 22px; fill: #0f766e; font-weight: bold; }
  </style>
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <rect x="0" y="0" width="${W}" height="200" fill="#0f766e"/>
  <text x="70" y="90" class="hdr" font-size="38">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</text>
  <text x="70" y="145" class="hdr" font-size="26">জাতীয় পরিচয়পত্র — সার্ভার কপি</text>
  <g>${tiles.join("")}</g>
  <text x="70" y="290" class="label">নাম</text>
  <text x="70" y="340" class="value" font-size="44">${esc(d.name_bn)}</text>
  <text x="70" y="386" class="label" font-size="26">${esc(d.name_en)}</text>
  <line x1="70" y1="430" x2="${W - 70}" y2="430" stroke="#e2e8f0" stroke-width="2"/>
  ${rowsSvg}
  <text x="70" y="888" class="label">ঠিকানা</text>
  ${addressSvg}
  <line x1="70" y1="${H - 150}" x2="${W - 70}" y2="${H - 150}" stroke="#e2e8f0" stroke-width="2"/>
  <text x="70" y="${H - 108}" class="foot">তৈরি হয়েছে: ${esc(issuedAt)} • NID: ${esc(masked)}</text>
  <text x="70" y="${H - 70}" class="mono">যাচাই কোড: ${esc(checksum)}</text>
  <text x="70" y="${H - 34}" class="foot">এই কপিটি সার্ভারে জেনারেট করা হয়েছে; ওয়াটারমার্ক ও যাচাই কোড পরিবর্তন করা যাবে না।</text>
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

    await ensureWasm();
    const fonts = await ensureFonts();

    const svg = buildSvg(data, issuedAt, checksum);
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: W },
      font: { fontBuffers: fonts, defaultFontFamily: "Noto Sans Bengali", loadSystemFonts: false },
    });
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
