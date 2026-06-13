import { ShieldCheck, BadgeCheck, Clock, Lock } from "lucide-react";
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

const Index = () => {
  return (
    <div className="min-h-dvh w-full bg-background flex flex-col items-center px-4 py-10 sm:py-14">
      {/* Header */}
      <header className="flex flex-col items-center text-center mb-10 sm:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div
          className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-[var(--shadow-primary)]"
          aria-hidden="true"
        >
          <ShieldCheck className="w-8 h-8 text-primary-foreground" strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          NID সার্ভার কপি সেবা
        </h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          জাতীয় পরিচয়পত্র যাচাই ও ডাউনলোড
        </p>
      </header>

      <main className="w-full flex flex-col items-center">
        {/* Hero */}
        <section className="text-center max-w-2xl mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            আপনার NID কার্ডের{" "}
            <span className="text-primary">সার্ভার কপি</span>
            <br className="hidden md:block" />
            ডাউনলোড করুন
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            NID নম্বর এবং জন্ম তারিখ দিয়ে সহজেই আপনার জাতীয় পরিচয়পত্রের সার্ভার কপি সংগ্রহ করুন।
          </p>
        </section>

        {/* Form */}
        <section aria-labelledby="form-heading" className="w-full flex justify-center mb-14 sm:mb-16">
          <NidForm />
        </section>

        {/* Features */}
        <section
          aria-label="পরিষেবার বৈশিষ্ট্য"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-6xl"
        >
          {features.map((f) => (
            <article
              key={f.title}
              className="bg-card/60 backdrop-blur-sm p-6 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 text-primary group-hover:scale-110 transition-transform"
                aria-hidden="true"
              >
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </article>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 sm:mt-20 py-8 border-t border-border w-full max-w-6xl text-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="text-primary font-semibold">NID সার্ভার কপি সেবা</span>। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </div>
  );
};

export default Index;
