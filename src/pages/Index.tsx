import { useEffect, useState } from "react";
import {
  ShieldCheck,
  BadgeCheck,
  Clock,
  Lock,
  Sparkles,
  ChevronDown,
  QrCode,
  FileDown,
  CheckCircle2,
  Zap,
  Users,
  Search,
  HelpCircle,
  FileCheck,
  Layers,
  ArrowRight,
} from "lucide-react";
import { NidForm } from "@/features/nid";
import logo from "@/assets/logo.png";

const stats = [
  { label: "সফল ভেরিফিকেশন", value: "৫,০০,০০০+", icon: Users },
  { label: "গড় যাচাই সময়", value: "< ৩ সেকেন্ড", icon: Zap },
  { label: "সার্ভার আপটাইম", value: "৯৯.৯%", icon: CheckCircle2 },
  { label: "নিরাপত্তা মানদণ্ড", value: "২৫৬-বিট SSL", icon: ShieldCheck },
];

const features = [
  {
    icon: ShieldCheck,
    title: "উচ্চ নিরাপত্তা",
    desc: "অত্যাধুনিক এনক্রিপশন সিস্টেমের মাধ্যমে আপনার তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিত।",
    badge: "নিরাপদ",
  },
  {
    icon: BadgeCheck,
    title: "সরাসরি ডাটাবেজ সংযোগ",
    desc: "জাতীয় নির্বাচন কমিশনের সার্ভার অনুকরণে আসল ও নির্ভুল ডাটা অবিলম্বে লোড হয়।",
    badge: "নির্ভুল",
  },
  {
    icon: Clock,
    title: "মুহূর্তেই ডাউনলোড",
    desc: "যাচাই সম্পন্ন হওয়ার সাথে সাথেই প্রিন্ট-রেডি কালার সার্ভার কপি সংগ্রহ করুন।",
    badge: "অতি দ্রুত",
  },
  {
    icon: Lock,
    title: "জিরো ডাটা লগ নীতি",
    desc: "আপনার NID বা জন্মতারিখ আমাদের সিস্টেমে কোনো অবস্থাতেই স্থায়ীভাবে সেভ হয় না।",
    badge: "গোপনীয়",
  },
];

const steps = [
  {
    n: "০১",
    title: "এনআইডি তথ্য প্রদান",
    desc: "আপনার ১০ বা ১৭ ডিজিটের NID নম্বর এবং জন্ম তারিখ (দিন/মাস/বছর) সঠিকভাবে টাইপ করুন।",
    icon: Search,
  },
  {
    n: "০২",
    title: "অটোমেটিক সার্ভার সার্চ",
    desc: "এক ক্লিকে ক্লাউড সার্ভার থেকে নাম, ছবি, ঠিকানা ও স্মার্ট বারকোড তথ্য স্বয়ংক্রিয়ভাবে সাজানো হবে।",
    icon: Layers,
  },
  {
    n: "০৩",
    title: "প্রিভিউ ও সংরক্ষণ",
    desc: "পূর্ণাঙ্গ সার্ভার কপি স্ক্রিনে প্রিভিউ করে এক ক্লিকে হাই-কোয়ালিটি কালার কপি ডাউনলোড বা প্রিন্ট নিন।",
    icon: FileDown,
  },
];

const samplePerks = [
  "স্মার্ট কিউআর (QR) কোড ভেরিফিকেশন সংবলিত",
  "অফিসিয়াল লেআউট ও হাই-রেজোলিউশন বাংলাদেশ মনোগ্রাম",
  "বাংলা ও ইংরেজি উভয় ফরম্যাটে বিস্তারিত তথ্য",
  "A4 পেপারে সরাসরি কালার ও ব্ল্যাক/হোয়াইট প্রিন্ট সুবিধা",
];

const faqs = [
  {
    q: "সার্ভার কপি কি সকল অফিশিয়াল কাজে ব্যবহারযোগ্য?",
    a: "হ্যাঁ, এই অনলাইন সার্ভার কপি প্রাথমিক তথ্য যাচাই, ব্যাংক অ্যাকাউন্ট, সিম কার্ড রেজিস্ট্রেশন এবং বিভিন্ন দাপ্তরিক প্রয়োজনে ব্যাপকভাবে ব্যবহৃত হয়।",
  },
  {
    q: "১০ ডিজিট স্মার্ট কার্ড নাকি ১৭ ডিজিট কোনটা দিব?",
    a: "আপনি যেকোনো একটি ব্যবহার করতে পারেন। ১০ ডিজিটের স্মার্ট এনআইডি অথবা ১৩/১৭ ডিজিটের সাধারণ এনআইডি নম্বর উভয়টিই সাপোর্ট করে।",
  },
  {
    q: "আমার কোনো তথ্য কি আপনাদের সিস্টেমে জমা থাকে?",
    a: "না। আমাদের প্ল্যাটফর্ম কঠোর জিরো-লগ নীতি অনুসরণ করে। ভেরিফিকেশনের পর কোনো এনআইডি নম্বর বা ছবি সার্ভারে স্থায়ীভাবে সংরক্ষিত হয় না।",
  },
];

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = "NID Service BD — আধুনিক জাতীয় পরিচয়পত্র যাচাই পোর্টাল";
  }, []);

  return (
    <div className="min-h-dvh w-full bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Accessibility Skip link */}
      <a
        href="#form-section"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        সরাসরি ফর্মে যান
      </a>

      {/* Modern Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl transition-all no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={logo}
                alt="NID Service Logo"
                className="w-10 h-10 rounded-2xl object-contain shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-foreground tracking-tight">NID Service BD</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  Modern
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">জাতীয় পরিচয়পত্র অনলাইন পোর্টাল</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav aria-label="প্রধান মেন্যু" className="hidden md:flex items-center gap-1 text-sm font-medium">
            <a
              href="#form-section"
              className="px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              যাচাই ফর্ম
            </a>
            <a
              href="#steps"
              className="px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              কার্যপদ্ধতি
            </a>
            <a
              href="#perks"
              className="px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              কপির সুবিধা
            </a>
            <a
              href="#faq"
              className="px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              প্রশ্নোত্তর
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              সার্ভার সচল
            </div>
            <a
              href="#form-section"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-95"
            >
              সার্ভার কপি খুঁজুন
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 sm:pt-14 pb-16 lg:pb-24">
          {/* Ambient Glows */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-tr from-primary/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-96 bg-grid opacity-35 pointer-events-none -z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Hero Text */}
              <div className="lg:col-span-6 text-center lg:text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold shadow-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>স্মার্ট বাংলাদেশ — নির্ভুল ডিজিটাল ভেরিফিকেশন</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.85rem] font-extrabold tracking-tight text-foreground leading-[1.18]">
                  মুহূর্তেই পান জাতীয় পরিচয়পত্রের{" "}
                  <span className="bg-gradient-to-r from-primary via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    অফিসিয়াল সার্ভার কপি
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  আপনার NID নম্বর এবং জন্ম তারিখ দিয়ে এক ক্লিকে মূল সরকারি তথ্যভাণ্ডার থেকে সঠিক তথ্য ও প্রিন্টযোগ্য কালার কপি সংগ্রহ করুন।
                </p>

                {/* Trust Badges */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-foreground/80 font-medium">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    <span>১০০% অফিসিয়াল ফরম্যাট</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs">
                    <QrCode className="w-4 h-4 text-primary" />
                    <span>যাচাইযোগ্য QR কোড</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs">
                    <Lock className="w-4 h-4 text-primary" />
                    <span>সম্পূর্ণ প্রাইভেট ও নিরাপদ</span>
                  </div>
                </div>

                {/* Quick hint */}
                <div className="pt-2">
                  <a
                    href="#steps"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                  >
                    কীভাবে সহজে কপি ডাউনলোড করবেন বিস্তারিত দেখুন
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </a>
                </div>
              </div>

              {/* Right Column: Search Form Card */}
              <div id="form-section" className="lg:col-span-6 w-full max-w-lg mx-auto lg:max-w-none">
                <div className="relative">
                  {/* Decorative backdrop for form */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 to-emerald-500/20 blur-xl opacity-70 -z-10" />
                  <NidForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats Strip */}
        <section className="border-y border-border/80 bg-muted/30 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{item.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3 Step Process */}
        <section id="steps" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                সহজ ধাপ
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground mt-3">
                মাত্র ৩টি ধাপে আপনার সার্ভার কপি পান
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-2">
                কোনো জটিলতা ছাড়াই ঘরে বসেই নির্ভুল ও দ্রুত NID কার্ড কপি যাচাই সম্পন্ন করুন
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="relative group bg-card border border-border/80 rounded-3xl p-7 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <step.icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                        {step.n}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Perks & Features Banner */}
        <section id="perks" className="py-16 bg-muted/20 border-y border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  প্রিমিয়াম আউটপুট
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">
                  আমাদের ডাউনলোডকৃত সার্ভার কপিতে যা যা পাচ্ছেন
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  আমাদের স্বয়ংক্রিয় জেনারেটর নিশ্চিত করে নির্বাচন কমিশনের অফিসিয়াল কার্ডের আদলে সর্বোচ্চ নিখুঁত লেআউট ও কালার স্কিম।
                </p>

                <div className="space-y-3 pt-2">
                  {samplePerks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm sm:text-base font-medium text-foreground/90">{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <a
                    href="#form-section"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-all shadow-md active:scale-95"
                  >
                    <FileCheck className="w-4 h-4" />
                    এখনই যাচাই শুরু করুন
                  </a>
                </div>
              </div>

              {/* Right: Feature Grid Cards */}
              <div className="lg:col-span-6 grid sm:grid-cols-2 gap-4">
                {features.map((feat, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <feat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {feat.badge}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-foreground mb-1">{feat.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase mb-3">
                <HelpCircle className="w-3.5 h-3.5" />
                সচরাচর জিজ্ঞাসিত প্রশ্ন
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                আপনার জানার সুবিধার্থে কিছু সাধারণ উত্তর
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-border rounded-2xl bg-card overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Modern Clean Footer */}
      <footer className="border-t border-border bg-card/60 backdrop-blur-md no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-8 h-8 rounded-xl object-contain opacity-90" />
              <div>
                <p className="text-sm font-bold text-foreground">NID Service BD Modern</p>
                <p className="text-xs text-muted-foreground">জাতীয় ডিজিটাল সেবা সহায়ক প্ল্যাটফর্ম</p>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground max-w-md">
              এই পোর্টালটি শুধুমাত্র দ্রুত সেবা ও নাগরিক সহায়তার জন্য প্রস্তুতকৃত। কোনো তথ্য স্থায়ীভাবে সার্ভারে সংরক্ষিত হয় না।
            </p>

            <div className="text-xs text-muted-foreground font-medium">
              © {new Date().getFullYear()} NID Service BD। সর্বস্বত্ব সংরক্ষিত।
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;