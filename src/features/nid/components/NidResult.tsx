import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileImage,
  User,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  ShieldCheck,
  Share2,
  Check,
  Fingerprint,
} from "lucide-react";
import type { NidData } from "../types";
import InfoRow from "./InfoRow";
import { safeText } from "@/lib/safeText";
import { downloadNidCopy, DownloadCancelledError, type DownloadFormat, type DownloadProgress } from "../utils/downloadCopy";

interface NidResultProps {
  data: NidData;
}

const NidResult = ({ data }: NidResultProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState<DownloadFormat | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [provenance, setProvenance] = useState<{ checksum: string; issuedAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = async (format: DownloadFormat) => {
    if (busy) return;
    setDownloadError(null);
    setCancelled(false);
    setProgress({ stage: "preparing", percent: 0, message: "শুরু হচ্ছে..." });
    setBusy(format);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await downloadNidCopy(
        {
          name_bn: data.name_bn,
          name_en: data.name_en,
          father_name: data.father_name,
          mother_name: data.mother_name,
          date_of_birth: data.date_of_birth,
          nid_number: data.nid_number,
          address: data.address,
        },
        format,
        (p) => {
          if (!controller.signal.aborted) setProgress(p);
        },
        controller.signal,
      );
      setProvenance(result);
      setTimeout(() => setProgress(null), 1200);
    } catch (err) {
      if (err instanceof DownloadCancelledError) {
        setCancelled(true);
        setProgress(null);
        setTimeout(() => setCancelled(false), 2500);
      } else {
        setDownloadError(err instanceof Error ? err.message : "ডাউনলোড ব্যর্থ হয়েছে।");
        setProgress(null);
      }
    } finally {
      abortRef.current = null;
      setBusy(null);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  const handleCopySummary = async () => {
    try {
      const text = `নাম: ${data.name_bn} (${data.name_en})\nNID: ${data.nid_number}\nজন্ম তারিখ: ${data.date_of_birth}\nপিতা: ${data.father_name}\nমাতা: ${data.mother_name}\nঠিকানা: ${data.address}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const name_bn = safeText(data.name_bn);
  const name_en = safeText(data.name_en);
  const father_name = safeText(data.father_name);
  const mother_name = safeText(data.mother_name);
  const date_of_birth = safeText(data.date_of_birth, 32);
  const nid_number = safeText(data.nid_number, 32);
  const address = safeText(data.address);

  return (
    <div className="space-y-4">
      {/* NID Card Surface */}
      <Card
        ref={cardRef}
        data-print-area
        className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-card via-card to-card/95 shadow-2xl backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        aria-live="polite"
      >
        {/* Top Decorative Banner */}
        <div className="relative bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-5 text-white shadow-inner">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/25">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-100 ring-1 ring-emerald-300/30">
                  <CheckCircle2 className="h-3 w-3" /> যাচাইকৃত সার্ভার রেকর্ড
                </span>
                <h3 className="text-base sm:text-lg font-bold leading-tight tracking-tight text-white drop-shadow-sm mt-0.5">
                  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                </h3>
              </div>
            </div>
            
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[11px] font-medium text-emerald-100/90">জাতীয় পরিচয়পত্র</span>
              <span className="text-[10px] text-emerald-200/70">নির্বাচন কমিশন বাংলাদেশ</span>
            </div>
          </div>
        </div>

        <CardContent className="p-6 sm:p-7 space-y-6">
          {/* Identity Info Primary Section */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            {data.photo ? (
              <div className="relative group shrink-0">
                <img
                  src={data.photo}
                  alt={`${name_en} এর ছবি`}
                  loading="lazy"
                  decoding="async"
                  crossOrigin="anonymous"
                  className="w-28 h-32 sm:w-28 sm:h-32 object-cover rounded-2xl border-2 border-emerald-500/30 shadow-md ring-4 ring-background"
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full shadow-md">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <div
                className="w-28 h-32 sm:w-28 sm:h-32 rounded-2xl border-2 border-dashed border-border/80 bg-muted/40 flex flex-col items-center justify-center shadow-inner text-muted-foreground"
                aria-hidden="true"
              >
                <User className="w-10 h-10 stroke-[1.5]" />
                <span className="text-[10px] mt-1 font-medium">ছবি পাওয়া যায়নি</span>
              </div>
            )}

            <div className="flex-1 w-full space-y-2">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">পূর্ণ নাম / Full Name</p>
                <h4 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
                  {name_bn}
                </h4>
                <p lang="en" className="text-sm sm:text-base font-semibold text-muted-foreground/90 font-mono tracking-wide">
                  {name_en}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <Fingerprint className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold font-mono tracking-wider">
                  NID: {nid_number}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                বিস্তারিত বিবরণ
              </span>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <InfoRow icon={<User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />} label="পিতার নাম" value={father_name} />
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <InfoRow icon={<User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />} label="মাতার নাম" value={mother_name} />
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <InfoRow icon={<Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />} label="জন্ম তারিখ" value={date_of_birth} />
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <InfoRow icon={<CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />} label="NID নম্বর" value={nid_number} />
            </div>
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
              <InfoRow icon={<MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />} label="বর্তমান/স্থায়ী ঠিকানা" value={address} />
            </div>
          </dl>

          {/* Quick Copy summary helper */}
          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopySummary}
              className="text-xs text-muted-foreground hover:text-foreground h-8 gap-1.5 rounded-lg"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>কপি করা হয়েছে!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>তথ্য কপি করুন</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error notification */}
      {downloadError && (
        <div
          role="alert"
          className="no-print flex items-start gap-3 text-destructive text-sm bg-destructive/10 border border-destructive/25 p-4 rounded-2xl shadow-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="font-medium">{downloadError}</span>
        </div>
      )}

      {/* Download Progress Bar */}
      {progress && (
        <div
          role="status"
          aria-live="polite"
          className="no-print rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3 shadow-md backdrop-blur-sm"
        >
          <div className="flex items-center gap-2.5">
            {progress.stage === "done" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin shrink-0" aria-hidden="true" />
            )}
            <p className="text-sm font-semibold text-foreground flex-1">{progress.message}</p>
            <Badge variant="secondary" className="font-mono text-xs tabular-nums">
              {Math.round(progress.percent)}%
            </Badge>
          </div>
          <Progress value={progress.percent} className="h-2 rounded-full" aria-label="ডাউনলোড অগ্রগতি" />
          {progress.stage !== "done" && (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                aria-label="ডাউনলোড বাতিল করুন"
              >
                <X className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                বাতিল করুন
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Cancelled message */}
      {cancelled && (
        <div
          role="status"
          aria-live="polite"
          className="no-print flex items-center gap-2 text-sm bg-muted/80 border border-border p-3.5 rounded-2xl text-muted-foreground"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>ডাউনলোড প্রক্রিয়া বাতিল করা হয়েছে।</span>
        </div>
      )}

      {/* Provenance details */}
      {provenance && (
        <div
          role="status"
          aria-live="polite"
          className="no-print rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 text-xs text-muted-foreground space-y-1"
        >
          <p className="flex items-center justify-between">
            <span>সার্ভারে তৈরি:</span>
            <span className="font-medium text-foreground">{provenance.issuedAt}</span>
          </p>
          <p className="flex items-center justify-between">
            <span>যাচাই কোড:</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">
              {provenance.checksum}
            </span>
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <Button
          onClick={() => handleDownload("pdf")}
          disabled={busy !== null}
          size="lg"
          className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.99]"
          aria-label="সার্ভার কপি PDF হিসেবে ডাউনলোড করুন"
        >
          {busy === "pdf" ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="w-5 h-5 mr-2" aria-hidden="true" />
          )}
          PDF ডাউনলোড করুন
        </Button>
        <Button
          onClick={() => handleDownload("png")}
          disabled={busy !== null}
          variant="outline"
          size="lg"
          className="h-12 font-bold rounded-2xl border-emerald-600/30 hover:bg-emerald-500/10 hover:border-emerald-600/50 text-foreground transition-all active:scale-[0.99]"
          aria-label="সার্ভার কপি ছবি হিসেবে ডাউনলোড করুন"
        >
          {busy === "png" ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
          ) : (
            <FileImage className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          )}
          ছবি (PNG) ডাউনলোড
        </Button>
      </div>
    </div>
  );
};

export default NidResult;