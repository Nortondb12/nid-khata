import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { logger } from "@/lib/logger";

export type DownloadFormat = "pdf" | "png";

const sanitizeFilename = (input: string) =>
  input.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "nid";

/**
 * Renders the given element to a canvas and downloads it as PDF or PNG.
 * The element must already be mounted and visible (or at least in the layout).
 */
export async function downloadNidCopy(
  element: HTMLElement,
  format: DownloadFormat,
  nidNumber: string,
): Promise<void> {
  const safe = sanitizeFilename(nidNumber);
  const filename = `nid-server-copy-${safe}`;

  try {
    const canvas = await html2canvas(element, {
      scale: Math.min(window.devicePixelRatio || 1, 2) * 1.5,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });

    if (format === "png") {
      const url = canvas.toDataURL("image/png");
      triggerDownload(url, `${filename}.png`);
      return;
    }

    // PDF — A4 portrait, fit width preserving aspect ratio
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
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
    pdf.save(`${filename}.pdf`);
  } catch (err) {
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
