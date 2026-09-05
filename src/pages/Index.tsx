import { useEffect } from "react";
import { ShieldCheck, BadgeCheck, Clock, Lock, Sparkles, ChevronDown } from "lucide-react";
import { NidForm } from "@/features/nid";

const features = [
  {
    icon: ShieldCheck,
    title: "নিরাপদ",
    desc: "সম্পূর্ণ এনক্রিপ্টেড সংযোগ এবং উন্নত সুরক্ষা ব্যবস্থা",
  },
  {
    icon: BadgeCheck,
    title: "সঠিক তথ্য",
    desc: "সরাসরি সরকারি সার্ভার থেকে নির্ভুল তথ্য প্রাপ্তি",
  },
  {
    icon: Clock,
    title: "দ্রুত সেবা",
    desc: "মাত্র কয়েক সেকেন্ডের মধ্যে কপি ডাউনলোড সম্ভব",
  },
  {
    icon: Lock,
    title: "গোপনীয়তা",
    desc: "ব্যক্তিগত তথ্য কোনোভাবেই কোথাও সংরক্ষিত হয় না",
  },
];

const steps = [
  { n: "১", title: "তথ্য দিন", desc: "NID নম্বর ও জন্ম তারিখ লিখুন" },
  { n: "২", title: "যাচাই করুন", desc: "সার্ভার থেকে তথ্য আনা হবে" },
  { n: "৩", title: "ডাউনলোড", desc: "সার্ভার কপি সংরক্ষণ করুন" },
];

const Index = () => {
  useEffect(() => {
    document.title = "NID Service BD — জাতীয় পরিচয়পত্র যাচাই";
  }, []);

  return (
    <div className="min-h-dvh w-full bg-hero">
      {/* Skip link */}
      <a
        href="#form-heading"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-[var(--shadow-primary)]"
      >
        ফর্মে যান
      </a>

      {/* Sticky header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl no-print">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl animated-gradient flex items-center justify-center shadow-[var(--shadow-primary)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">NID Service BD</p>
              <p className="text-[11px] text-muted-foreground -mt-0.5">সরকারি সেবা পোর্টাল</p>
            </div>
          </a>
          <nav aria-label="প্রধান নেভিগেশন" className="hidden sm:flex items-center gap-1 text-sm">
            <a href="#features" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">বৈশিষ্ট্য</a>
            <a href="#steps" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">কীভাবে কাজ করে</a>
            <a href="/status" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">আমার স্ট্যাটাস</a>
            <a
              href="#form-heading"
              className="ml-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              শুরু করুন
            </a>
          </nav>
        </div>
      </header>

      <main className="relative">
        {/* Decorative grid */}
        <div className="absolute inset-x-0 top-0 h-[520px] bg-grid pointer-events-none" aria-hidden="true" />

        {/* Hero + form */}
        <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12 lg:pt-16 pb-14 sm:pb-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
            {/* Hero copy */}
            <div className="text-center md:text-left animate-fade-in-up">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 animate-pulse-glow">
                <Sparkles className="w-3.5 h-3.5 animate-float" aria-hidden="true" />
                ডেমো মোড সক্রিয় — পরীক্ষার জন্য
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-[1.15] tracking-tight">
                আপনার NID কার্ডের{" "}
                <span className="text-gradient-primary shimmer-text">সার্ভার কপি</span>{" "}
                মুহূর্তেই
              </h1>
              <p className="mt-4 sm:mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto md:mx-0">
                NID নম্বর এবং জন্ম তারিখ দিয়ে সরাসরি সরকারি সার্ভার থেকে আপনার জাতীয় পরিচয়পত্রের অফিসিয়াল কপি সংগ্রহ করুন।
              </p>

              {/* Trust badges */}
              <ul className="mt-5 sm:mt-6 flex flex-wrap gap-x-5 gap-y-2 justify-center md:justify-start text-sm text-muted-foreground stagger">
                <li className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-primary" aria-hidden="true" /> সরকারি যাচাই</li>
                <li className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-primary" aria-hidden="true" /> SSL এনক্রিপ্টেড</li>
                <li className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" aria-hidden="true" /> ২৪/৭ সেবা</li>
              </ul>

              <a
                href="#steps"
                className="mt-8 hidden lg:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                কীভাবে কাজ করে দেখুন <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
              </a>
            </div>

            {/* Form column */}
            <div id="form" className="w-full flex justify-center md:justify-end animate-scale-in [animation-delay:150ms]">
              <NidForm />
            </div>
          </div>
        </section>

        {/* Steps */}
        <section
          id="steps"
          aria-label="কীভাবে কাজ করে"
          className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">কীভাবে কাজ করে</h2>
            <p className="text-muted-foreground mt-2">মাত্র ৩টি সহজ ধাপে আপনার কপি পান</p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 stagger">
            {steps.map((s, i) => (
              <li
                key={s.n}
                className="relative bg-card border border-border rounded-2xl p-6 shadow-[var(--shadow-card)] hover-lift"
              >
                <div className="absolute -top-4 left-6 w-9 h-9 rounded-xl animated-gradient text-primary-foreground font-bold flex items-center justify-center shadow-[var(--shadow-primary)]">
                  {s.n}
                </div>
                <h3 className="mt-3 text-lg font-bold text-foreground">{s.title}</h3>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-border" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section
          id="features"
          aria-label="পরিষেবার বৈশিষ্ট্য"
          className="mx-auto max-w-6xl px-4 sm:px-6 pb-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">কেন আমাদের সেবা</h2>
            <p className="text-muted-foreground mt-2">নিরাপদ, দ্রুত এবং নির্ভরযোগ্য</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger">
            {features.map((f) => (
              <article
                key={f.title}
                className="group relative bg-card p-6 rounded-2xl border border-border hover:border-primary/40 hover-lift shadow-[var(--shadow-card)]"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300"
                  aria-hidden="true"
                >
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-primary font-semibold">NID Service BD</span>। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="text-xs">তথ্য সংরক্ষিত হয় না • শুধু পরীক্ষার জন্য</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;