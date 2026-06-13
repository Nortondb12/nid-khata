import { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";
import NidResult from "./NidResult";

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
        body: JSON.stringify({ nid_number: nidNumber, date_of_birth: dob }),
      });

      if (!response.ok) throw new Error("সার্ভার থেকে তথ্য পাওয়া যায়নি।");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="w-full bg-card rounded-3xl shadow-[var(--shadow-elevated)] border border-border p-6 sm:p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" aria-hidden="true" />

        <div className="text-center mb-7">
          <h2 id="form-heading" className="text-2xl font-bold text-foreground">
            NID তথ্য যাচাই করুন
          </h2>
          <p className="text-muted-foreground mt-1">
            আপনার জাতীয় পরিচয়পত্রের সঠিক তথ্য প্রদান করুন
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="nid" className="text-sm font-semibold text-foreground ml-1 block">
              NID নম্বর
            </label>
            <input
              id="nid"
              name="nid"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="আপনার ১০ বা ১৭ সংখ্যার NID নম্বর"
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value.replace(/\D/g, ""))}
              maxLength={17}
              aria-invalid={!!error}
              aria-describedby={error ? "form-error" : undefined}
              className="w-full px-5 py-4 bg-muted/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dob" className="text-sm font-semibold text-foreground ml-1 block">
              জন্ম তারিখ
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              aria-invalid={!!error}
              className="w-full px-5 py-4 bg-muted/60 border border-border rounded-xl text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {error && (
            <div
              id="form-error"
              role="alert"
              className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-[var(--shadow-primary)] transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>অনুসন্ধান করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Search
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                />
                <span>অনুসন্ধান করুন</span>
              </>
            )}
          </button>
        </form>
      </div>

      {result && <NidResult data={result} />}
    </div>
  );
};

export default NidForm;
