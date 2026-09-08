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
  Shield,
  FileText,
  Printer,
  Smartphone,
  ExternalLink,
  History,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building2,
  Landmark,
  Globe,
  FileSignature,
  Wallet,
  Award,
  TrendingUp,
  Star,
  Quote,
  Menu,
  X,
  Download,
  Eye,
  BellRing,
  Timer,
  Cloud,
  Check,
  ChevronRight,
  Minus,
  Plus,
  Info,
  PhoneCall,
  MessageSquare,
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
    desc: "জাতীয় নির্বাচন কমিশনের সার্ভার আদলে আসল ও নির্ভুল ডাটা অবিলম্বে প্রদর্শিত হয়।",
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
    desc: "আপনার NID বা জন্মতারিখ আমাদের সিস্টেমে কোনো অবস্থাতেই স্থায়ীভাবে সংরক্ষিত হয় না।",
    badge: "গোপনীয়",
  },
];

const steps = [
  {
    n: "০১",
    title: "এনআইডি তথ্য প্রদান",
    desc: "আপনার ১০ বা ১৭ ডিজিটের NID নম্বর এবং জন্ম তারিখ (দিন-মাস-বছর) সঠিকভাবে প্রদান করুন।",
    icon: Search,
  },
  {
    n: "০২",
    title: "অটোমেটিক সার্ভার সার্চ",
    desc: "এক ক্লিকে ক্লাউড সার্ভার থেকে নাম, ছবি, ঠিকানা ও স্মার্ট বারকোড তথ্য স্বয়ংক্রিয়ভাবে লোড হবে।",
    icon: Layers,
  },
  {
    n: "০৩",
    title: "প্রিভিউ ও সংরক্ষণ",
    desc: "পূর্ণাঙ্গ সার্ভার কপি স্ক্রিনে দেখে এক ক্লিকে হাই-কোয়ালিটি কালার কপি ডাউনলোড বা প্রিন্ট করুন।",
    icon: FileDown,
  },
];

const samplePerks = [
  "স্মার্ট কিউআর (QR) কোড ভেরিফিকেশন সংবলিত",
  "অফিসিয়াল লেআউট ও হাই-রেজোলিউশন বাংলাদেশ মনোগ্রাম",
  "বাংলা ও ইংরেজি উভয় ফরম্যাটে বিস্তারিত তথ্য",
  "A4 পেপারে সরাসরি কালার ও ব্ল্যাক/হোয়াইট প্রিন্ট সুবিধা",
  "ব্যাংক, সিম রেজিস্ট্রেশন ও অফিসিয়াল কাজের জন্য উপযোগী",
];

const faqs = [
  {
    q: "সার্ভার কপি কি সকল অফিশিয়াল কাজে ব্যবহারযোগ্য?",
    a: "হ্যাঁ, এই অনলাইন সার্ভার কপি প্রাথমিক তথ্য যাচাই, ব্যাংক অ্যাকাউন্ট খোলা, সিম কার্ড রেজিস্ট্রেশন এবং বিভিন্ন দাপ্তরিক প্রয়োজনে ব্যাপকভাবে ব্যবহৃত হয়।",
  },
  {
    q: "১০ ডিজিট স্মার্ট কার্ড নাকি ১৭ ডিজিট কোনটা দিব?",
    a: "আপনি যেকোনো একটি ব্যবহার করতে পারেন। ১০ ডিজিটের স্মার্ট এনআইডি অথবা ১৩/১৭ ডিজিটের সাধারণ এনআইডি নম্বর উভয়টিই সাপোর্ট করে। ১৩ ডিজিট হলে জন্মসাল যুক্ত করে ১৭ ডিজিট প্রদান করুন।",
  },
  {
    q: "আমার কোনো তথ্য কি আপনাদের সিস্টেমে জমা থাকে?",
    a: "না। আমাদের প্ল্যাটফর্ম কঠোর জিরো-লগ নীতি অনুসরণ করে। ভেরিফিকেশনের পর কোনো এনআইডি নম্বর বা ছবি সার্ভারে স্থায়ীভাবে সংরক্ষিত হয় না।",
  },
  {
    q: "মোবাইল থেকে কি সরাসরি PDF সেভ বা প্রিন্ট করা যাবে?",
    a: "হ্যাঁ, আপনার মোবাইলের যেকোনো ব্রাউজার থেকেই এক ক্লিকে 'Print / Save as PDF' বাটনে ক্লিক করে হাই-কোয়ালিটি কপি সেভ করে নিতে পারবেন।",
  },
];

const useCases = [
  {
    icon: Building2,
    title: "ব্যাংক ও আর্থিক প্রতিষ্ঠান",
    desc: "অ্যাকাউন্ট খোলা, লোন আবেদন ও KYC ভেরিফিকেশনে",
  },
  {
    icon: Landmark,
    title: "সরকারি সেবা",
    desc: "পাসপোর্ট, ড্রাইভিং লাইসেন্স ও নানা সরকারি সুবিধা পেতে",
  },
  {
    icon: Phone,
    title: "মোবাইল অপারেটর",
    desc: "সিম কার্ড রেজিস্ট্রেশন ও নম্বর পোর্টেবিলিটির জন্য",
  },
  {
    icon: Globe,
    title: "অনলাইন সেবা",
    desc: "ফ্রিল্যান্সিং, ই-কমার্স ও ডিজিটাল প্ল্যাটফর্মে যাচাইয়ে",
  },
  {
    icon: Wallet,
    title: "মাইক্রোফাইন্যান্স",
    desc: "ক্ষুদ্র ঋণ ও এজেন্ট ব্যাংকিং সেবা গ্রহণে",
  },
  {
    icon: FileSignature,
    title: "চুক্তি ও নোটারি",
    desc: "দলিল, চুক্তিপত্র ও জমি সংক্রান্ত কাজে পরিচয় নিশ্চিতে",
  },
];

const testimonials = [
  {
    name: "রাফিন ইসলাম",
    role: "ব্যাংক কর্মকর্তা, ঢাকা",
    text: "অসাধারণ একটি সেবা! আগে যেখানে গ্রাহকের তথ্য যাচাই করতে ঘণ্টার পর ঘণ্টা লেগে যেত, এখন মাত্র কয়েক সেকেন্ডেই নির্ভুলভাবে সব তথ্য পেয়ে যাচ্ছি। সময় ও শ্রম দুটোই বেঁচে যায়।",
    rating: 5,
  },
  {
    name: "নুসরাত জাহান",
    role: "ফ্রিল্যান্সার, চট্টগ্রাম",
    text: "বিদেশি ক্লায়েন্টদের সাথে কাজ করার সময় পরিচয় যাচাইয়ের জন্য অনেক সময় NID সার্ভার কপির প্রয়োজন হয়। এই প্ল্যাটফর্ম থেকে খুব সহজেই এবং দ্রুত আমি প্রয়োজনীয় কপি ডাউনলোড করতে পারি।",
    rating: 5,
  },
  {
    name: "মাহমুদুল হাসান",
    role: "প্রবাসী, সৌদি আরব",
    text: "বাংলাদেশে না থেকে বিদেশ থেকেই আমার পরিবারের সদস্যদের NID সার্ভার কপি ডাউনলোড করে দিতে পারছি। ওয়েবসাইটটি খুবই ইউজার-ফ্রেন্ডলি এবং মোবাইল থেকে ব্যবহার করা অত্যন্ত সহজ।",
    rating: 5,
  },
];

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "NID Service BD — আধুনিক জাতীয় পরিচয়পত্র যাচাই পোর্টাল";
  }, []);

  return (
    <div className="min-h-dvh w-full bg-background text-foreground selection:bg-primary/20 selection:text-primary antialiased relative overflow-x-hidden">
      {/* Subtle Bangladesh Flag Inspired Background - Fixed */}
      <div className="fixed inset-0 -z-20 pointer-events-none">
        {/* Deep Green Base Gradient (Flag Green) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#006a4e]/10 via-background to-background" />
        
        {/* Radial Green Glows (Flag Green Inspiration) */}
        <div className="absolute -top-40 -right-40 w-[35rem] h-[35rem] rounded-full bg-[#006a4e]/15 blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -left-52 w-[30rem] h-[30rem] rounded-full bg-emerald-500/10 blur-3xl animate-float-slower" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] rounded-full bg-teal-500/10 blur-3xl" />

        {/* Red Sun Radial (Red Circle from Flag) - Very Subtle */}
        <div className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] rounded-full bg-[#f42a41]/5 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/3 left-1/3 w-[32rem] h-[32rem] rounded-full bg-[#f42a41]/5 blur-3xl animate-pulse-slower" />

        {/* Small Accent Dots Inspired by Flag Elements */}
        <div className="absolute top-20 left-1/4 w-2 h-2 rounded-full bg-[#006a4e]/20 animate-float" />
        <div className="absolute top-32 right-1/4 w-1.5 h-1.5 rounded-full bg-[#f42a41]/20 animate-float-slow" />
        <div className="absolute bottom-32 left-1/3 w-2 h-2 rounded-full bg-emerald-500/20 animate-float-slower" />
        <div className="absolute bottom-40 right-1/3 w-1.5 h-1.5 rounded-full bg-[#006a4e]/20 animate-float" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid opacity-25" />
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-sm md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="w-8 h-8 rounded-xl object-contain" />
                <span className="font-bold">NID Service BD</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="মেনু বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
              <a
                href="#form-section"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors font-medium"
              >
                যাচাই ফর্ম
              </a>
              <a
                href="#steps"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors font-medium"
              >
                কার্যপদ্ধতি
              </a>
              <a
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors font-medium"
              >
                বিশেষত্বসমূহ
              </a>
              <a
                href="#use-cases"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors font-medium"
              >
                ব্যবহারের ক্ষেত্র
              </a>
              <a
                href="#testimonials"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors font-medium"
              >
                ব্যবহারকারীদের মতামত
              </a>
              <a
                href="#perks"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors font-medium"
              >
                সুবিধাসমূহ
              </a>
              <a
                href="#faq"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors font-medium"
              >
                প্রশ্নোত্তর
              </a>
              <a
                href="#contact"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors font-medium"
              >
                যোগাযোগ
              </a>
            </nav>
            <div className="p-4 border-t border-border">
              <a
                href="#form-section"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                <Search className="w-4 h-4 inline mr-2" />
                কপি খুঁজুন
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Skip link */}
      <a
        href="#form-section"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        সরাসরি ফর্মে যান
      </a>

      {/* Modern Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl transition-all no-print shadow-sm shadow-black/[0.02]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="relative shrink-0">
              <img
                src={logo}
                alt="NID Service Logo"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl object-contain shadow-xs group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#006a4e] border-2 border-background rounded-full animate-pulse" />
            </div>
            <div className="leading-tight truncate">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-sm sm:text-lg font-black tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent truncate">
                  NID Service BD
                </span>
                <span className="shrink-0 text-[9px] sm:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  ভেরিফাইড
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
                জাতীয় পরিচয়পত্র অনলাইন পোর্টাল
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav aria-label="প্রধান মেন্যু" className="hidden lg:flex items-center gap-1 text-sm font-medium">
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
              href="#features"
              className="px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              বিশেষত্বসমূহ
            </a>
            <a
              href="#use-cases"
              className="px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              ব্যবহারের ক্ষেত্র
            </a>
            <a
              href="#faq"
              className="px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              প্রশ্নোত্তর
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#006a4e]/10 border border-[#006a4e]/20 text-[#006a4e] dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#f42a41] animate-ping" />
              সার্ভার সক্রিয়
            </div>
            <a
              href="#form-section"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95"
            >
              <Search className="w-4 h-4" />
              কপি খুঁজুন
            </a>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              aria-label="মেনু খুলুন"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-6 sm:pt-14 pb-12 sm:pb-16 lg:pb-24">
          {/* Ambient Glows with Flag Colors */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-tr from-[#006a4e]/20 via-[#f42a41]/10 to-teal-500/10 blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-0 inset-x-0 h-96 bg-grid opacity-20 pointer-events-none -z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Hero Text */}
              <div className="lg:col-span-6 text-center lg:text-left space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#006a4e]/10 border border-[#006a4e]/20 text-[#006a4e] text-xs sm:text-sm font-semibold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f42a41]" />
                  <span>স্মার্ট বাংলাদেশ — দ্রুত ও নির্ভরযোগ্য সেবা</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-black tracking-tight text-foreground leading-[1.2]">
                  জাতীয় পরিচয়পত্রের{" "}
                  <span className="bg-gradient-to-r from-[#006a4e] via-[#f42a41] to-[#006a4e] bg-clip-text text-transparent">
                    অফিসিয়াল সার্ভার কপি
                  </span>{" "}
                  সংগ্রহ করুন
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  আপনার NID নম্বর ও জন্ম তারিখ দিয়ে মাত্র কয়েক সেকেন্ডে মূল সার্ভার ডাটা ও প্রিন্টযোগ্য অফিসিয়াল কালার কপি তৈরি ও ডাউনলোড করুন।
                </p>

                {/* Live Users Counter */}
                <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-xs text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#006a4e]/20 to-[#f42a41]/20 border-2 border-background flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-[#006a4e]"
                      >
                        {["আ", "র", "স", "ম"][i - 1]}
                      </div>
                    ))}
                  </div>
                  <span>
                    <span className="font-bold text-foreground">২,৪৫০+</span> জন এখন অনলাইনে
                  </span>
                </div>

                {/* Trust Badges */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-foreground/85 font-medium">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-card border border-[#006a4e]/20 shadow-xs">
                    <BadgeCheck className="w-4 h-4 text-[#006a4e]" />
                    <span>১০০% আসল ফরম্যাট</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-card border border-[#f42a41]/20 shadow-xs">
                    <QrCode className="w-4 h-4 text-[#f42a41]" />
                    <span>স্মার্ট কিউআর কোড</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-card border border-teal-500/20 shadow-xs">
                    <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>নিরাপদ ও তাৎক্ষণিক</span>
                  </div>
                </div>

                {/* Quick Action Link */}
                <div className="pt-2">
                  <a
                    href="#steps"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                  >
                    সার্ভার কপি ডাউনলোড পদ্ধতি বিস্তারিত দেখুন
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </a>
                </div>
              </div>

              {/* Right Column: Search Form Card */}
              <div id="form-section" className="lg:col-span-6 w-full max-w-xl mx-auto lg:max-w-none scroll-mt-20">
                <div className="relative">
                  {/* Decorative backdrop for form with Flag Colors */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#006a4e]/30 via-[#f42a41]/20 to-teal-500/25 blur-xl opacity-70 -z-10" />
                  <NidForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats Strip */}
        <section className="border-y border-border/80 bg-muted/30 py-6 sm:py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              {stats.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-2 group">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#006a4e]/10 to-[#f42a41]/10 text-[#006a4e] flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">{item.value}</p>
                  <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground font-medium mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3 Step Process */}
        <section id="steps" className="py-12 sm:py-20 lg:py-24 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
              <span className="px-3 py-1 rounded-full bg-[#006a4e]/10 text-[#006a4e] text-xs font-bold uppercase tracking-wider">
                সহজ ৩ ধাপ
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-3">
                কীভাবে আপনার সার্ভার কপি পাবেন?
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2">
                কোনো ঝামেলা ছাড়াই ঘরে বসেই নির্ভুল ও দ্রুত NID কার্ড কপি যাচাই সম্পন্ন করুন
              </p>
            </div>

            <div className="relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#006a4e]/20 via-[#f42a41]/20 to-[#006a4e]/20 -z-10" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="relative group bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-lg hover:border-[#006a4e]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Subtle flag color accent on hover */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#006a4e] via-[#f42a41] to-[#006a4e] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#006a4e]/10 to-[#f42a41]/10 text-[#006a4e] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-xs">
                          <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-2xl sm:text-3xl font-black text-muted-foreground/20 group-hover:text-[#f42a41]/30 transition-colors">
                          {step.n}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-[#006a4e] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-20 lg:py-24 bg-muted/20 border-y border-border/60 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
              <span className="px-3 py-1 rounded-full bg-[#006a4e]/10 text-[#006a4e] text-xs font-bold uppercase tracking-wider">
                আমাদের বৈশিষ্ট্য
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-3">
                কেন আমাদের সেবা বেছে নেবেন?
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2">
                সবচেয়ে উন্নত প্রযুক্তি ও দ্রুততম ইন্টারফেসের সমন্বয়ে নির্মিত
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border/70 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="py-12 sm:py-20 lg:py-24 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
              <span className="px-3 py-1 rounded-full bg-[#f42a41]/10 text-[#f42a41] text-xs font-bold uppercase tracking-wider">
                প্রয়োগক্ষেত্র
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-3">
                যেসব ক্ষেত্রে সার্ভার কপি প্রয়োজন
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2">
                দৈনন্দিন অফিশিয়াল ও ব্যক্তিগত নানা গুরুত্বপূর্ণ কাজে এই সার্ভার কপি ব্যবহৃত হয়
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {useCases.map((uc, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-all"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted text-primary flex items-center justify-center shrink-0">
                    <uc.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">{uc.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample / Perks Section */}
        <section id="perks" className="py-12 sm:py-20 lg:py-24 bg-gradient-to-b from-muted/30 to-background border-y border-border/60 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="px-3 py-1 rounded-full bg-[#006a4e]/10 text-[#006a4e] text-xs font-bold uppercase tracking-wider">
                  প্রিন্ট-রেডি লেআউট
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground">
                  আসল জাতীয় নির্বাচন কমিশনের মতো নির্ভুল ডিজাইন
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed">
                  আমাদের প্রস্তুতকৃত সার্ভার কপি জাতীয় নির্বাচন কমিশনের অফিশিয়াল ডাটা ফরম্যাটের সাথে সম্পূর্ণ সামঞ্জস্যপূর্ণ।
                </p>

                <ul className="space-y-2.5 pt-2">
                  {samplePerks.map((perk, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 font-medium">
                      <div className="w-5 h-5 rounded-full bg-[#006a4e]/10 text-[#006a4e] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <a
                    href="#form-section"
                    className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                  >
                    <Search className="w-4 h-4" />
                    এখনই নিজের কপি দেখুন
                  </a>
                </div>
              </div>

              {/* Sample Visual Card */}
              <div className="lg:col-span-6">
                <div className="relative mx-auto max-w-md bg-card border-2 border-primary/20 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3.5 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#006a4e]/10 text-[#006a4e] flex items-center justify-center font-bold text-xs">
                        BD
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground leading-tight">জাতীয় পরিচয়পত্র সার্ভার কপি</p>
                        <p className="text-[10px] text-muted-foreground">National Identity Card Summary</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      ভেরিফাইড
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center mb-4">
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-muted/70 border border-border flex items-center justify-center text-muted-foreground text-xs font-semibold">
                      ছবি নমুনা
                    </div>
                    <div className="col-span-2 space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">জাতীয় পরিচয়পত্র নম্বর</span>
                        <span className="font-mono font-bold text-foreground text-xs sm:text-sm">১৯৯*****৭৮৯০</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">নাম (বাংলা)</span>
                        <span className="font-bold text-foreground">মোহাম্মদ আব্দুল্লাহ</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Name (English)</span>
                        <span className="font-medium text-foreground">MD ABDULLAH</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/80 pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>বারকোড ও কিউআর সমৃদ্ধ</span>
                    <span className="text-primary font-semibold">প্রিন্ট-রেডি ফরম্যাট</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-12 sm:py-20 lg:py-24 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
              <span className="px-3 py-1 rounded-full bg-[#006a4e]/10 text-[#006a4e] text-xs font-bold uppercase tracking-wider">
                গ্রাহক প্রতিক্রিয়া
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-3">
                ব্যবহারকারীরা কী বলছেন?
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2">
                হাজারো সন্তুষ্ট ব্যবহারকারীর মূল্যবান মতামত
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-3">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-4 italic">
                      "{t.text}"
                    </p>
                  </div>
                  <div className="border-t border-border/60 pt-3">
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-12 sm:py-20 lg:py-24 bg-muted/20 border-y border-border/60 scroll-mt-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <span className="px-3 py-1 rounded-full bg-[#006a4e]/10 text-[#006a4e] text-xs font-bold uppercase tracking-wider">
                সাধারণ জিজ্ঞাসা
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-3">
                সচরাচর জিজ্ঞাসিত প্রশ্নাবলী
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2">
                আপনার মনে থাকা সাধারণ প্রশ্নগুলোর সহজ উত্তর
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border/80 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-foreground hover:bg-muted/30 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground shrink-0 ml-3 transition-transform duration-200 ${
                        openFaq === idx ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA / Contact Strip */}
        <section id="contact" className="py-12 sm:py-16 bg-gradient-to-r from-[#006a4e] to-emerald-800 text-white scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black">
              আপনার NID সার্ভার কপি এখুনি সংগ্রহ করুন
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm md:text-base max-w-xl mx-auto">
              কোনো দীর্ঘ প্রক্রিয়ার ঝামেলা নেই — মাত্র ৩ সেকেন্ডে আসল ডাটা ও কালার কপি রেডি।
            </p>
            <div className="pt-2">
              <a
                href="#form-section"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#006a4e] font-black text-sm hover:bg-emerald-50 transition-all shadow-lg active:scale-95"
              >
                <Search className="w-4 h-4" />
                তথ্য যাচাই শুরু করুন
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-background py-10 sm:py-12 no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="w-8 h-8 rounded-xl object-contain" />
                <span className="font-bold text-base">NID Service BD</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                অনলাইনে দ্রুত, নির্ভরযোগ্য ও সুরক্ষিত জাতীয় পরিচয়পত্র যাচাইয়ের আধুনিক ডিজিটাল প্ল্যাটফর্ম।
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">দ্রুত লিঙ্ক</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#form-section" className="hover:text-primary transition-colors">যাচাই ফর্ম</a></li>
                <li><a href="#steps" className="hover:text-primary transition-colors">কার্যপদ্ধতি</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">বিশেষত্বসমূহ</a></li>
                <li><a href="#faq" className="hover:text-primary transition-colors">প্রশ্নোত্তর</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">ব্যবহারের ক্ষেত্র</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><span>ব্যাংক ও ফাইন্যান্স</span></li>
                <li><span>সরকারি দাপ্তরিক কাজ</span></li>
                <li><span>সিম বায়োমেট্রিক ও নোটারি</span></li>
                <li><span>অনলাইন ফ্রিল্যান্সিং</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">নিরাপত্তা ও গোপনীয়তা</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                আমরা আপনার ব্যক্তিগত গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ। ভেরিফিকেশনের পর কোনো তথ্য স্থায়ীভাবে জমা রাখা হয় না।
              </p>
            </div>
          </div>

          <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
            <p>© {new Date().getFullYear()} NID Service BD — সর্বস্বত্ব সংরক্ষিত।</p>
            <p>ডিজিটাল বাংলাদেশ এর অংশীদারিত্বে পরিচালিত</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
