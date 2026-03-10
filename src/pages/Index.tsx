import { Shield, CheckCircle, Clock, Lock } from "lucide-react";
import NidForm from "@/components/NidForm";

const features = [
  { icon: Shield, title: "নিরাপদ", desc: "সম্পূর্ণ এনক্রিপ্টেড সংযোগ" },
  { icon: CheckCircle, title: "সঠিক তথ্য", desc: "সরাসরি সার্ভার থেকে" },
  { icon: Clock, title: "দ্রুত সেবা", desc: "মাত্র কয়েক সেকেন্ডে" },
  { icon: Lock, title: "গোপনীয়তা", desc: "তথ্য সংরক্ষিত হয় না" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
              NID সার্ভার কপি সেবা
            </h1>
            <p className="text-xs text-muted-foreground">
              জাতীয় পরিচয়পত্র যাচাই ও ডাউনলোড
            </p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-8 sm:py-12 px-4" style={{ background: "var(--gradient-hero)" }}>
        <div className="container max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            আপনার NID কার্ডের সার্ভার কপি
            <br />
            <span className="text-primary">ডাউনলোড করুন</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            NID নম্বর এবং জন্ম তারিখ দিয়ে সহজেই আপনার জাতীয় পরিচয়পত্রের সার্ভার কপি পান
          </p>
        </div>

        <NidForm />
      </section>

      {/* Features */}
      <section className="py-10 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="text-center p-4 rounded-xl bg-card border border-border/60 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} NID সার্ভার কপি সেবা। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </div>
  );
};

export default Index;
