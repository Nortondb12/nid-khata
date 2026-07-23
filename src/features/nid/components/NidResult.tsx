import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, FileImage, User, MapPin, Calendar, CreditCard, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import type { NidData } from "../types";
import InfoRow from "./InfoRow";
import { safeText } from "@/lib/safeText";
import { downloadNidCopy, type DownloadFormat, type DownloadProgress } from "../utils/downloadCopy";

interface NidResultProps {
  data: NidData;
}

const NidResult = ({ data }: NidResultProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<DownloadFormat | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const handleDownload = async (format: DownloadFormat) => {
    if (!cardRef.current || busy) return;
    setDownloadError(null);
    setProgress({ stage: "preparing", percent: 0, message: "শুরু হচ্ছে..." });
    setBusy(format);
    try {
      await downloadNidCopy(cardRef.current, format, data.nid_number, (p) => setProgress(p));
      setTimeout(() => setProgress(null), 1200);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "ডাউনলোড ব্যর্থ হয়েছে।");
      setProgress(null);
    } finally {
      setBusy(null);
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
    <div className="space-y-3">
      <Card
        ref={cardRef}
        data-print-area
        className="shadow-[var(--shadow-elevated)] border-border/60 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 motion-reduce:animate-none bg-card"
        aria-live="polite"
      >
        {/* Header banner */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-[hsl(var(--primary-glow))] px-5 py-4 text-primary-foreground">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-90">যাচাইকৃত</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold leading-snug">
            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
          </h3>
          <p className="text-xs opacity-90">জাতীয় পরিচয়পত্র — সার্ভার কপি</p>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {data.photo ? (
              <img
                src={data.photo}
                alt={`${name_en} এর ছবি`}
                loading="lazy"
                decoding="async"
                crossOrigin="anonymous"
                className="w-28 h-32 sm:w-24 sm:h-28 object-cover rounded-xl border-2 border-primary/20 shadow-sm mx-auto sm:mx-0"
              />
            ) : (
              <div
                className="w-28 h-32 sm:w-24 sm:h-28 rounded-xl border-2 border-border bg-muted flex items-center justify-center mx-auto sm:mx-0"
                aria-hidden="true"
              >
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 w-full">
              <p className="text-xs text-muted-foreground">নাম</p>
              <p className="text-lg sm:text-xl font-bold text-foreground leading-tight">{name_bn}</p>
              <p lang="en" className="text-sm text-muted-foreground">{name_en}</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <InfoRow icon={<User className="w-4 h-4" />} label="পিতার নাম" value={father_name} />
            <InfoRow icon={<User className="w-4 h-4" />} label="মাতার নাম" value={mother_name} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="জন্ম তারিখ" value={date_of_birth} />
            <InfoRow icon={<CreditCard className="w-4 h-4" />} label="NID নম্বর" value={nid_number} />
            <div className="sm:col-span-2">
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="ঠিকানা" value={address} />
            </div>
          </dl>
        </CardContent>
      </Card>

      {downloadError && (
        <div
          role="alert"
          className="no-print flex items-start gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 p-3 rounded-xl"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{downloadError}</span>
        </div>
      )}

      {progress && (
        <div
          role="status"
          aria-live="polite"
          className="no-print rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            {progress.stage === "done" ? (
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            ) : (
              <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" aria-hidden="true" />
            )}
            <p className="text-sm font-semibold text-foreground flex-1">{progress.message}</p>
            <span className="text-xs font-medium text-muted-foreground tabular-nums" aria-hidden="true">
              {Math.round(progress.percent)}%
            </span>
          </div>
          <Progress value={progress.percent} className="h-2" aria-label="ডাউনলোড অগ্রগতি" />
        </div>
      )}



      <div className="no-print grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={() => handleDownload("pdf")}
          disabled={busy !== null}
          className="h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
          aria-label="সার্ভার কপি PDF হিসেবে ডাউনলোড করুন"
        >
          {busy === "pdf" ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="w-5 h-5 mr-2" aria-hidden="true" />
          )}
          PDF ডাউনলোড
        </Button>
        <Button
          onClick={() => handleDownload("png")}
          disabled={busy !== null}
          variant="outline"
          className="h-12 font-semibold rounded-xl border-primary/30 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          aria-label="সার্ভার কপি ছবি হিসেবে ডাউনলোড করুন"
        >
          {busy === "png" ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
          ) : (
            <FileImage className="w-5 h-5 mr-2" aria-hidden="true" />
          )}
          ছবি (PNG) ডাউনলোড
        </Button>
      </div>
    </div>
  );
};

export default NidResult;
