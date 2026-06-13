import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, User, MapPin, Calendar, CreditCard } from "lucide-react";
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
      className="shadow-[var(--shadow-elevated)] border-border/60 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 motion-reduce:animate-none"
      aria-live="polite"
    >
      <div className="bg-primary p-4">
        <h3 className="text-lg font-bold text-primary-foreground text-center">
          গণপ্রজাতন্ত্রী বাংলাদেশ সরকার — জাতীয় পরিচয়পত্র
        </h3>
      </div>
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {data.photo ? (
            <img
              src={data.photo}
              alt={`${name_en} এর ছবি`}
              loading="lazy"
              decoding="async"
              className="w-24 h-28 object-cover rounded-lg border-2 border-border shadow-sm"
            />
          ) : (
            <div
              className="w-24 h-28 rounded-lg border-2 border-border bg-muted flex items-center justify-center"
              aria-hidden="true"
            >
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 space-y-3 w-full">
            <InfoRow icon={<User className="w-4 h-4" />} label="নাম (বাংলা)" value={name_bn} />
            <InfoRow
              icon={<User className="w-4 h-4" />}
              label="Name (English)"
              value={<span lang="en">{name_en}</span>}
            />
            <InfoRow icon={<User className="w-4 h-4" />} label="পিতার নাম" value={father_name} />
            <InfoRow icon={<User className="w-4 h-4" />} label="মাতার নাম" value={mother_name} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="জন্ম তারিখ" value={date_of_birth} />
            <InfoRow icon={<CreditCard className="w-4 h-4" />} label="NID নম্বর" value={nid_number} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="ঠিকানা" value={address} />
          </div>
        </div>

        <Button
          onClick={handleDownload}
          className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
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
