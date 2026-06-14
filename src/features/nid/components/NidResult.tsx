import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, User, MapPin, Calendar, CreditCard, CheckCircle2 } from "lucide-react";
import type { NidData } from "../types";
import InfoRow from "./InfoRow";
import { safeText } from "@/lib/safeText";

interface NidResultProps {
  data: NidData;
}

const NidResult = ({ data }: NidResultProps) => {
  const handleDownload = () => {
    window.print();
  };

  const name_bn = safeText(data.name_bn);
  const name_en = safeText(data.name_en);
  const father_name = safeText(data.father_name);
  const mother_name = safeText(data.mother_name);
  const date_of_birth = safeText(data.date_of_birth, 32);
  const nid_number = safeText(data.nid_number, 32);
  const address = safeText(data.address);

  return (
    <Card
      data-print-area
      className="shadow-[var(--shadow-elevated)] border-border/60 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 motion-reduce:animate-none"
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

        <Button
          onClick={handleDownload}
          className="no-print w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
          aria-label="সার্ভার কপি ডাউনলোড করুন"
        >
          <Download className="w-5 h-5 mr-2" aria-hidden="true" />
          সার্ভার কপি ডাউনলোড করুন
        </Button>
      </CardContent>
    </Card>
  );
};

export default NidResult;
