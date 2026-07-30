// HarfBuzz-based text shaping: converts strings (Bengali + Latin) into SVG glyph
// outlines so rendering never depends on the rasterizer's own text engine.
import hbjs from "npm:harfbuzzjs@0.3.6/hbjs.js";

const HB_WASM_URL = "https://unpkg.com/harfbuzzjs@0.3.6/hb.wasm";

const FONT_URLS: Record<string, string> = {
  "bn-regular":
    "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansBengali/full/ttf/NotoSansBengali-Regular.ttf",
  "bn-bold":
    "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSansBengali/full/ttf/NotoSansBengali-Bold.ttf",
  "lat-regular":
    "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/hinted/ttf/NotoSans-Regular.ttf",
  "lat-bold":
    "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/hinted/ttf/NotoSans-Bold.ttf",
};

export type Weight = "regular" | "bold";

// deno-lint-ignore no-explicit-any
type Hb = any;

interface ShaperState {
  hb: Hb;
  fonts: Record<string, { font: Hb; upem: number }>;
  cache: Map<string, string>;
}

let statePromise: Promise<ShaperState> | null = null;

const loadState = async (): Promise<ShaperState> => {
  const [wasmBytes, ...fontBytes] = await Promise.all([
    fetch(HB_WASM_URL).then((r) => r.arrayBuffer()),
    ...Object.values(FONT_URLS).map((u) => fetch(u).then((r) => r.arrayBuffer())),
  ]);

  const { instance } = await WebAssembly.instantiate(wasmBytes, {});
  const hb = hbjs(instance);

  const fonts: ShaperState["fonts"] = {};
  Object.keys(FONT_URLS).forEach((key, i) => {
    const blob = hb.createBlob(new Uint8Array(fontBytes[i]));
    const face = hb.createFace(blob, 0);
    const font = hb.createFont(face);
    const upem = face.upem || 1000;
    font.setScale(upem, upem);
    fonts[key] = { font, upem };
  });

  return { hb, fonts, cache: new Map() };
};

export const initShaper = () => {
  if (!statePromise) statePromise = loadState();
  return statePromise;
};

const isBengaliChar = (cp: number) =>
  (cp >= 0x0980 && cp <= 0x09ff) || cp === 0x200c || cp === 0x200d;

const isNeutral = (cp: number) =>
  cp === 0x20 || cp === 0x09 || cp === 0x2e || cp === 0x2c || cp === 0x3a;

interface Run {
  text: string;
  bengali: boolean;
}

const splitRuns = (input: string): Run[] => {
  const runs: Run[] = [];
  let current: Run | null = null;
  for (const ch of input) {
    const cp = ch.codePointAt(0)!;
    if (isNeutral(cp) && current) {
      current.text += ch;
      continue;
    }
    const bengali = isBengaliChar(cp);
    if (!current || current.bengali !== bengali) {
      current = { text: ch, bengali };
      runs.push(current);
    } else {
      current.text += ch;
    }
  }
  return runs;
};

const glyphPath = (state: ShaperState, key: string, gid: number) => {
  const cacheKey = `${key}:${gid}`;
  const hit = state.cache.get(cacheKey);
  if (hit !== undefined) return hit;
  const d: string = state.fonts[key].font.glyphToPath(gid) ?? "";
  state.cache.set(cacheKey, d);
  return d;
};

export interface TextOptions {
  x: number;
  y: number;
  size: number;
  weight?: Weight;
  fill?: string;
  opacity?: number;
  /** Additional transform applied around the text group (e.g. rotate). */
  transform?: string;
}

export interface ShapedText {
  svg: string;
  width: number;
}

/**
 * Shapes `input` with HarfBuzz and returns SVG glyph outlines positioned at (x, y).
 * The baseline sits at `y`, matching SVG <text> semantics.
 */
export const shapeText = (
  state: ShaperState,
  input: string,
  opts: TextOptions,
): ShapedText => {
  const { x, y, size, weight = "regular", fill = "#000000", opacity = 1, transform } = opts;
  const runs = splitRuns(input);
  if (!runs.length) return { svg: "", width: 0 };

  // All runs use the same upem in practice (Noto = 1000); normalise per run anyway.
  const baseUpem = state.fonts[`bn-${weight}`].upem;
  const scale = size / baseUpem;

  let pen = 0;
  const paths: string[] = [];

  for (const run of runs) {
    const key = `${run.bengali ? "bn" : "lat"}-${weight}`;
    const { font, upem } = state.fonts[key];
    const unitFix = baseUpem / upem;

    const buffer = state.hb.createBuffer();
    buffer.addText(run.text);
    buffer.guessSegmentProperties();
    state.hb.shape(font, buffer);
    const glyphs = buffer.json();

    for (const g of glyphs) {
      const d = glyphPath(state, key, g.g);
      if (d) {
        const px = (pen + (g.dx ?? 0) * unitFix).toFixed(1);
        const py = ((g.dy ?? 0) * unitFix).toFixed(1);
        paths.push(
          unitFix === 1
            ? `<path transform="translate(${px},${py})" d="${d}"/>`
            : `<path transform="translate(${px},${py}) scale(${unitFix.toFixed(4)})" d="${d}"/>`,
        );
      }
      pen += (g.ax ?? 0) * unitFix;
    }

    buffer.destroy?.();
  }

  const inner =
    `<g transform="translate(${x},${y}) scale(${scale.toFixed(5)},${(-scale).toFixed(5)})" ` +
    `fill="${fill}"${opacity !== 1 ? ` opacity="${opacity}"` : ""}>${paths.join("")}</g>`;

  return {
    svg: transform ? `<g transform="${transform}">${inner}</g>` : inner,
    width: pen * scale,
  };
};

/** Measures the rendered width of a string without emitting markup. */
export const measureText = (
  state: ShaperState,
  input: string,
  size: number,
  weight: Weight = "regular",
) => shapeText(state, input, { x: 0, y: 0, size, weight }).width;
