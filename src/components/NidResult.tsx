import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, User, MapPin, Calendar, CreditCard } from "lucide-react";
import type { NidData } from "./NidForm";

interface NidResultProps {
  data: NidData;
}

const NidResult = ({ data }: NidResultProps) => {
  const handleDownload = () => {
    // TODO: Implement actual download logic from your API
    window.print();
  };

  return (
    <Card className="shadow-[var(--shadow-elevated)] border-border/60 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              alt="NID Photo"
              className="w-24 h-28 object-cover rounded-lg border-2 border-border shadow-sm"
            />
          ) : (
            <div className="w-24 h-28 rounded-lg border-2 border-border bg-muted flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 space-y-3 w-full">
            <InfoRow icon={<User className="w-4 h-4" />} label="নাম (বাংলা)" value={data.name_bn} />
            <InfoRow icon={<User className="w-4 h-4" />} label="Name (English)" value={data.name_en} />
            <InfoRow icon={<User className="w-4 h-4" />} label="পিতার নাম" value={data.father_name} />
            <InfoRow icon={<User className="w-4 h-4" />} label="মাতার নাম" value={data.mother_name} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="জন্ম তারিখ" value={data.date_of_birth} />
            <InfoRow icon={<CreditCard className="w-4 h-4" />} label="NID নম্বর" value={data.nid_number} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="ঠিকানা" value={data.address} />
          </div>
        </div>

        <Button
          onClick={handleDownload}
          className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
        >
          <Download className="w-5 h-5 mr-2" />
          সার্ভার কপি ডাউনলোড করুন
        </Button>
      </CardContent>
    </Card>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-2">
    <span className="text-primary mt-0.5 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground break-words">{value}</p>
    </div>
  </div>
);

export default NidResult;
