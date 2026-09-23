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
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";
import type { NidData } from "../types";
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

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

  const copyField = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 1500);
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

  const fieldData = [
    { icon: <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />, label: "পিতার নাম", value: father_name, accent: "from-teal-500/10 to-teal-500/5 border-teal-500/20" },
    { icon: <User className="w-5 h-5 text-rose-600 dark:text-rose-400" />, label: "মাতার নাম", value: mother_name, accent: "from-rose-500/10 to-rose-500/5 border-rose-500/20" },
    { icon: <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />, label: "জন্ম তারিখ", value: date_of_birth, accent: "from-sky-500/10 to-sky-500/5 border-sky-500/20" },
    { icon: <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, label: "NID নম্বর", value: nid_number, accent: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" },
    { icon: <MapPin className="w-5 h-5 text-violet-600 dark:text-violet-400" />, label: "ঠিকানা", value: address, accent: "from-violet-500/10 to-violet-500/5 border-violet-500/20 sm:col-span-2" },
  ];

  const visibleFields = showAll ? fieldData : fieldData.slice(0, 4);
  const hiddenCount = fieldData.length - 4;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Animated gradient border wrapper */}
      <div className="relative p-[2px] rounded-[20px] sm:rounded-[26px] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-2xl shadow-emerald-900/20 animate-gradient-x">
        <div className="absolute inset-0 rounded-[20px] sm:rounded-[26px] bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-600/20 blur-xl" aria-hidden="true" />
        
        {/* NID Card Surface */}
        <Card
          ref={cardRef}
          data-print-area
          className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-card via-card to-card/98 backdrop-blur-xl"
          aria-live="polite"
        >
          {/* Top Decorative Banner */}
          <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 px-4 py-5 sm:px-6 sm:py-6 text-white overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10" aria-hidden="true">
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute right-32 -top-2 w-24 h-24 bg-cyan-400 rounded-full blur-2xl" />
              <div className="absolute bottom-0 right-60 w-40 h-32 bg-emerald-400 rounded-full blur-3xl" />
            </div>
            
            {/* Bangladesh watermark */}
            <div className="hidden sm:block absolute right-14 -bottom-6 opacity-10 select-none" aria-hidden="true">
              <div className="w-[120px] h-[90px] border-4 border-yellow-200 rounded-full rotate-12 flex items-center justify-center">
                <svg viewBox="0 0 10 6" className="w-12 h-8">
                  <rect width="10" height="6" fill="transparent"/>
                  <circle cx="6" cy="3" r="1.8" fill="#fbbf24"/>
                </svg>
              </div>
            </div>

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0">
                <div className="relative shrink-0 mt-0.5 sm:mt-0">
                  <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-xl ring-1 ring-white/30 shadow-inner">
                    <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-teal-400 ring-2 ring-emerald-900" />
                </div>
                
                <div className="space-y-1 sm:space-y-1.5 min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-emerald-100 ring-1 ring-white/20 backdrop-blur-md">
                    <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-teal-300 shrink-0" /> 
                    যাচাইকৃত সার্ভার রেকর্ড
                  </span>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                  </h3>
                  <p className="text-[10px] sm:text-xs font-medium text-emerald-100/80 tracking-wide">
                    জাতীয় পরিচয়পত্র নিবন্ধন সেবা
                  </p>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                <div className="text-right space-y-0.5">
                  <span className="text-xs font-semibold text-white tracking-wide">জাতীয় পরিচয়পত্র</span>
                  <span className="block text-[10px] text-emerald-100/70">নির্বাচন কমিশন বাংলাদেশ</span>
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                  <Fingerprint className="h-4 w-4 text-emerald-200 inline mr-1" />
                  <span className="text-[9px] font-semibold font-mono text-white/70 tracking-widest">
                    {nid_number.slice(0, 4)}••••••••
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-4 sm:p-6 lg:p-7 space-y-5 sm:space-y-6 bg-card">
            {/* Profile Grid */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-start text-center sm:text-left">
              {/* Photo Section with watermark */}
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[18px] opacity-20 group-hover:opacity-40 blur-md transition-opacity duration-300" aria-hidden="true" />
                {data.photo ? (
                  <>
                    <img
                      src={data.photo}
                      alt={`${name_en} এর ছবি`}
                      loading="lazy"
                      decoding="async"
                      crossOrigin="anonymous"
                      className="relative w-28 h-32 sm:w-32 sm:h-36 object-cover rounded-2xl border-2 border-white shadow-lg ring-4 ring-emerald-900/10 mx-auto sm:mx-0"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-emerald-900/20 via-transparent to-transparent" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap">
                      <CheckCircle2 className="w-3 h-3" />
                      যাচাইকৃত
                    </div>
                  </>
                ) : (
                  <div className="relative w-28 h-32 sm:w-32 sm:h-36 rounded-2xl border-2 border-dashed border-emerald-500/50 bg-gradient-to-br from-muted to-emerald-500/10 flex flex-col items-center justify-center shadow-inner mx-auto sm:mx-0">
                    <User className="w-12 h-12 stroke-[1.2] text-emerald-600/60 dark:text-emerald-400/60" />
                    <span className="text-[10px] mt-2 font-semibold text-emerald-800/70 dark:text-emerald-200/70">প্রোফাইল ছবি</span>
                  </div>
                )}
              </div>

              {/* Identity badges */}
              <div className="flex-1 w-full space-y-3 sm:space-y-3.5">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300 bg-teal-500/10 dark:bg-teal-500/20 px-3 py-1 rounded-lg border border-teal-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    পরিচয় নিশ্চিত
                  </div>
                  <div className="break-words">
                    <h4 className="text-xl sm:text-2xl lg:text-3xl font-black text-primary leading-tight tracking-tight">
                      {name_bn}
                    </h4>
                    <p lang="en" className="text-sm sm:text-base font-semibold text-muted-foreground font-mono tracking-wider mt-0.5 break-all">
                      {name_en}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 shadow-sm max-w-full">
                    <Fingerprint className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-bold font-mono tracking-widest break-all">
                      NID: {nid_number}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Watermark strip */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5">
              <div className="flex items-center justify-center gap-3 py-2 px-4 opacity-40 text-muted-foreground pointer-events-none select-none" aria-hidden="true">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] sm:tracking-[0.35em] whitespace-nowrap overflow-hidden">
                  Bangladesh Election Commission
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>

            {/* Separator with icon */}
            <div className="relative pt-1" aria-hidden="true">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-emerald-500/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 rounded-full border border-emerald-500/20 shadow-lg">
                  <CreditCard className="w-4 h-4 text-emerald-500 mt-0.5" />
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <dl id="nid-extra-fields" className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {visibleFields.map((field) => (
                <div 
                  key={field.label}
                  className={`group relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br ${field.accent} border shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${field.label === "ঠিকানা" ? "sm:col-span-2" : ""}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-background/0 via-background/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start gap-2.5 sm:gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/50 dark:bg-white/10 border border-border/50 shadow-sm transition-transform duration-300 group-hover:scale-110 shrink-0">
                      {field.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                        {field.label}
                      </dt>
                      <dd className="text-sm font-semibold text-primary leading-snug break-words">
                        {field.value}
                      </dd>
                    </div>
                    <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyField(field.label, field.value)}
                        className="h-8 w-8 p-0 rounded-full hover:bg-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                        aria-label={`${field.label} কপি করুন`}
                      >
                        {copiedField === field.label ? (
                          <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </dl>

            {/* Show more / less toggle */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
                aria-controls="nid-extra-fields"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-emerald-500/10 h-9 gap-1.5 rounded-xl px-4"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4 shrink-0" aria-hidden="true" />
                    কম দেখান
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
                    সম্পূর্ণ ঠিকানা দেখুন
                    {hiddenCount > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        {hiddenCount}
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>

            {/* Security & Actions Line */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 sm:pt-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="uppercase tracking-wider font-medium">নিরাপদ ডিজিটাল সার্ভার</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopySummary}
                className="text-xs text-muted-foreground hover:text-foreground hover:bg-emerald-500/10 h-9 gap-2 rounded-xl px-4 w-full sm:w-auto justify-center"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">কপি সম্পন্ন!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" aria-hidden="true" />
                    <span className="font-semibold">সব তথ্য কপি করুন</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>

          {/* Bottom gradient strip */}
          <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600" />
        </Card>
      </div>

      {/* Error notification */}
      {downloadError && (
        <div
          role="alert"
          className="no-print flex items-start gap-3 text-destructive text-sm bg-destructive/10 border border-destructive/25 p-4 sm:p-5 rounded-2xl shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 duration-300"
        >
          <div className="shrink-0 bg-destructive/20 rounded-xl p-1.5">
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="font-bold">ডাউনলোড ব্যর্থ হয়েছে</p>
            <p className="text-destructive/90 break-words">{downloadError}</p>
          </div>
        </div>
      )}

      {/* Download Progress Bar */}
      {progress && (
        <div
          role="status"
          aria-live="polite"
          className="no-print rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-3">
            {progress.stage === "done" ? (
              <div className="shrink-0 bg-emerald-500/15 rounded-full p-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
            ) : (
              <div className="shrink-0 bg-emerald-500/15 rounded-full p-2">
                <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" aria-hidden="true" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{progress.message}</p>
                <Badge variant="secondary" className="font-mono text-xs tabular-nums rounded-lg shrink-0">
                  {Math.round(progress.percent)}%
                </Badge>
              </div>
            </div>
          </div>
          <Progress value={progress.percent} className="h-2 rounded-full bg-emerald-500/10" aria-label="ডাউনলোড অগ্রগতি" />
          {progress.stage !== "done" && (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl px-3"
                aria-label="ডাউনলোড বাতিল করুন"
              >
                <X className="w-4 h-4 mr-1.5" aria-hidden="true" />
                বাতিল করুন
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Cancelled notification */}
      {cancelled && (
        <div
          role="status"
          aria-live="polite"
          className="no-print flex items-center gap-3 text-sm bg-orange-500/10 border border-orange-500/25 p-4 rounded-2xl text-orange-700 dark:text-orange-300 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 duration-300"
        >
          <div className="shrink-0 bg-orange-500/15 rounded-full p-1.5">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="font-semibold">ডাউনলোড প্রক্রিয়া বাতিল করা হয়েছে।</span>
        </div>
      )}

      {/* Provenance details */}
      {provenance && (
        <div
          role="status"
          aria-live="polite"
          className="no-print rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 p-4 sm:p-5 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <h5 className="text-sm font-bold text-foreground">সফলভাবে ডাউনলোড সম্পন্ন</h5>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 p-3 rounded-xl bg-background/70 border border-border/50">
              <span className="text-muted-foreground">সার্ভারে তৈরি:</span>
              <span className="font-semibold text-foreground break-words">{provenance.issuedAt}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 p-3 rounded-xl bg-background/70 border border-border/50">
              <span className="text-muted-foreground">যাচাই কোড:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider break-all">
                {provenance.checksum}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground/70 px-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>এই কোডটি যাচাই করে নথির সত্যতা নিশ্চিত করা যাবে</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
        <Button
          onClick={() => handleDownload("pdf")}
          disabled={busy !== null}
          size="lg"
          className="relative h-12 sm:h-13 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 transition-all active:scale-[0.98] hover:shadow-2xl hover:shadow-emerald-600/40 group overflow-hidden w-full"
          aria-label="সার্ভার কপি PDF হিসেবে ডাউনলোড করুন"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 motion-reduce:hidden" aria-hidden="true" />
          {busy === "pdf" ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin shrink-0" aria-hidden="true" />
              <span>তৈরি হচ্ছে...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2 shrink-0" aria-hidden="true" />
              <span className="relative z-10">PDF ডাউনলোড করুন</span>
            </>
          )}
        </Button>
        
        <Button
          onClick={() => handleDownload("png")}
          disabled={busy !== null}
          variant="outline"
          size="lg"
          className="relative h-12 sm:h-13 py-3.5 font-bold rounded-2xl bg-gradient-to-r from-emerald-600/5 to-teal-600/5 hover:from-emerald-600/10 hover:to-teal-600/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 w-full overflow-hidden group"
          aria-label="সার্ভার কপি PNG ছবি হিসেবে ডাউনলোড করুন"
        >
          {busy === "png" ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin shrink-0" aria-hidden="true" />
              <span>তৈরি হচ্ছে...</span>
            </>
          ) : (
            <>
              <FileImage className="w-5 h-5 mr-2 shrink-0" aria-hidden="true" />
              <span>PNG ছবি ডাউনলোড করুন</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NidResult;
