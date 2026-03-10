import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2, AlertCircle } from "lucide-react";
import NidResult from "./NidResult";

// TODO: আপনার API endpoint এখানে বসান
const API_ENDPOINT = "https://your-api-endpoint.com/nid-verify";

export interface NidData {
  name_bn: string;
  name_en: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  nid_number: string;
  address: string;
  photo?: string;
}

const NidForm = () => {
  const [nidNumber, setNidNumber] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<NidData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!nidNumber || !dob) {
      setError("অনুগ্রহ করে NID নম্বর এবং জন্ম তারিখ দিন।");
      return;
    }

    if (!/^\d{10,17}$/.test(nidNumber)) {
      setError("সঠিক NID নম্বর দিন (১০-১৭ সংখ্যা)।");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nid_number: nidNumber,
          date_of_birth: dob,
        }),
      });

      if (!response.ok) {
        throw new Error("সার্ভার থেকে তথ্য পাওয়া যায়নি।");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <Card className="shadow-[var(--shadow-card)] border-border/60">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
            NID তথ্য যাচাই করুন
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            আপনার জাতীয় পরিচয়পত্রের তথ্য দিন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nid" className="text-sm font-medium text-foreground">
                NID নম্বর
              </Label>
              <Input
                id="nid"
                type="text"
                placeholder="আপনার ১০ বা ১৭ সংখ্যার NID নম্বর"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ""))}
                maxLength={17}
                className="h-12 text-base bg-secondary/50 border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="text-sm font-medium text-foreground">
                জন্ম তারিখ
              </Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-12 text-base bg-secondary/50 border-border focus:border-primary"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  অনুসন্ধান করা হচ্ছে...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  অনুসন্ধান করুন
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && <NidResult data={result} />}
    </div>
  );
};

export default NidForm;
