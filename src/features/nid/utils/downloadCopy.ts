import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { logger } from "@/lib/logger";

export type DownloadFormat = "pdf" | "png";

const sanitizeFilename = (input: string) =>
  input.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "nid";

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
  rendering: "কার্ড রেন্ডার করা হচ্ছে...",
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

/**
 * Renders the given element to a canvas and downloads it as PDF or PNG.
 */
export async function downloadNidCopy(
  element: HTMLElement,
  format: DownloadFormat,
  nidNumber: string,
  onProgress?: DownloadProgressHandler,
  signal?: AbortSignal,
): Promise<void> {
  const safe = sanitizeFilename(nidNumber);
  const filename = `nid-server-copy-${safe}`;

  try {
    checkAborted(signal);
    emit(onProgress, "preparing", 5);
    await new Promise((r) => setTimeout(r, 50));
    checkAborted(signal);

    emit(onProgress, "rendering", 20);
    const canvas = await html2canvas(element, {
      scale: Math.min(window.devicePixelRatio || 1, 2) * 1.5,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    checkAborted(signal);
    emit(onProgress, "rendering", 60);

    if (format === "png") {
      emit(onProgress, "encoding", 75);
      const url = canvas.toDataURL("image/png");
      checkAborted(signal);
      emit(onProgress, "saving", 92);
      triggerDownload(url, `${filename}.png`);
      emit(onProgress, "done", 100);
      return;
    }

    emit(onProgress, "encoding", 75);
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    checkAborted(signal);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const ratio = canvas.width / canvas.height;
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    const x = (pageW - w) / 2;
    const y = margin;
    pdf.addImage(imgData, "JPEG", x, y, w, h, undefined, "FAST");
    checkAborted(signal);
    emit(onProgress, "saving", 92);
    pdf.save(`${filename}.pdf`);
    emit(onProgress, "done", 100);
  } catch (err) {
    if (err instanceof DownloadCancelledError) throw err;
    logger.error("Failed to generate NID copy download", err);
    throw new Error("ডাউনলোড তৈরি করা যায়নি। আবার চেষ্টা করুন।");
  }
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
