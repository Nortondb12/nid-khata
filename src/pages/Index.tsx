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
  Layers,
  Shield,
  FileText,
  Mail,
  Phone,
  MapPin,
  Building2,
  Landmark,
  Globe,
  FileSignature,
  Wallet,
  Star,
  Quote,
  Menu,
  X,
  BellRing,
  Check,
  ChevronRight,
  Minus,
  Plus,
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
    a: "না। আমাদের প্ল্যাটফর্ম কঠোর জিরো-লগ নীতি অনুসরণ করে। ভেরিফিকেশনের পর কোনো এনআইডি নম্বর বা ছবি সার্ভারে স্থায়ীভাবে সংরক্ষিত হয় না।",
  },
  {
    q: "মোবাইল থেকে কি সরাসরি PDF সেভ বা প্রিন্ট করা যাবে?",
    a: "হ্যাঁ, আপনার মোবাইলের যেকোনো ব্রাউজার থেকেই এক ক্লিকে 'Print / Save as PDF' বাটনে ক্লিক করে হাই-কোয়ালিটি কপি সেভ করে নিতে পারবেন।",
  },
];

const skippedQuestions = [
  {
    q: "সার্ভার কপি কি সরকারিভাবে স্বীকৃত?",
    note: "এই কপিটি তথ্য যাচাইয়ের জন্য প্রস্তুতকৃত অনলাইন সার্ভার কপি; এটি জাতীয় নির্বাচন কমিশন কর্তৃক ইস্যুকৃত মূল স্মার্ট কার্ড নয়।",
  },
  {
    q: "কপিতে থাকা QR কোড কোথায় স্ক্যান করে যাচাই করা যায়?",
    note: "QR কোডটি কপির তথ্য দ্রুত শেয়ার ও যাচাইয়ের সুবিধার জন্য সংযুক্ত; নির্দিষ্ট যাচাই পোর্টালের ঠিকানা এখনো চূড়ান্ত করা হয়নি।",
  },
  {
    q: "প্রিন্ট করা কপি রঙিন না হলে কী করব?",
    note: "প্রিন্টারের কালার সেটিং ও কাগজের মানের উপর কপির রঙ নির্ভর করে; সেরা ফলাফলের জন্য কালার প্রিন্টার ব্যবহার করুন।",
  },
  {
    q: "তথ্য ভুল দেখালে সংশোধনের আবেদন কোথায় করব?",
    note: "সার্ভার থেকে আসা তথ্য সংশোধনের জন্য সংশ্লিষ্ট সরকারি অফিসে আবেদন করতে হয়; এই প্ল্যাটফর্ম থেকে সরাসরি সংশোধন সম্ভব নয়।",
  },
  {
    q: "একটি কপি কতবার ডাউনলোড করা যাবে?",
    note: "ডাউনলোডের সংখ্যার কোনো নির্দিষ্ট সীমা এখনো নির্ধারিত হয়নি; প্রয়োজনে যেকোনো সময় নতুন করে যাচাই করে কপি নেওয়া যাবে।",
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
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="মেনু বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                href="#united-air"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors font-medium"
              >
                United Air সার্ভিস
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
                href="#skipped-questions"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors font-medium"
              >
                অসম্পূর্ণ প্রশ্ন
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
      <header className="sticky top-0 z-40 w-full glass-header border-b border-border/60 bg-background/85 backdrop-blur-xl transition-all no-print shadow-sm shadow-black/[0.02]">
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
              href="#united-air"
              className="px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              United Air সার্ভিস
            </a>
            <a
              href="#faq"
              className="px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              প্রশ্নোত্তর
            </a>
            <a
              href="#skipped-questions"
              className="px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              অসম্পূর্ণ প্রশ্ন
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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

        {/* United Air Service Banner */}
        <section id="united-air" className="relative scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
            <div className="relative overflow-hidden rounded-3xl border border-[#006a4e]/25 shadow-lg">
              <img
                src="/generated/3da202e7-23d-united-air-service-banner.jpg"
                alt="United Air সার্ভিস — NID Service BD এর সাথে বিমান টিকিট ও ভ্রমণ সেবা"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#006a4e]/90 via-[#006a4e]/70 to-[#f42a41]/60" />
              <div className="relative px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  United Air সার্ভিস
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-3 leading-tight">
                  United Air-এর সাথে ঘরে বসেই বিমান টিকিট বুকিং
                </h2>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed mt-3">
                  NID Service BD-এর গ্রাহকদের জন্য United Air-এর বিশেষ ভ্রমণ সেবা — অভ্যন্তরীণ ও আন্তর্জাতিক রুটে টিকিট বুকিং, রি-শিডিউল ও যাত্রী সহায়তা একই প্ল্যাটফর্মে।
                </p>
                <div className="flex flex-wrap gap-3 pt-5">
                  <a
                    href="#form-section"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#006a4e] font-bold text-sm hover:bg-white/90 shadow-md transition-all active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    টিকিট বুক করুন
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/30 text-white font-bold text-sm hover:bg-white/20 transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    সহায়তা নিন
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats Strip */}
        <section className="glass-surface border-y border-border/80 bg-muted/30 py-6 sm:py-8 backdrop-blur-sm">
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
                    className="relative group glass-card bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-lg hover:border-[#006a4e]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
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
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="hidden md:flex absolute top-1/2 -right-5 lg:-right-6 -translate-y-1/2 z-10">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-card border-2 border-[#006a4e]/30 text-[#006a4e] flex items-center justify-center shadow-md">
                          <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 sm:py-20 lg:py-24 scroll-mt-16 bg-muted/20 border-y border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
              <span className="px-3 py-1 rounded-full bg-[#f42a41]/10 text-[#f42a41] text-xs font-bold uppercase tracking-wider">
                কেন আমরা
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-3">
                আমাদের সেবার বিশেষত্বসমূহ
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2">
                নিরাপত্তা, নির্ভুলতা ও গতির সমন্বয়ে গড়ে তোলা একটি আধুনিক প্ল্যাটফর্ম
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group relative glass-card bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-[#006a4e]/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#006a4e] via-[#f42a41] to-[#006a4e] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#006a4e]/10 to-[#f42a41]/10 text-[#006a4e] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-xs">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[#006a4e]/10 text-[#006a4e] border border-[#006a4e]/20">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="py-12 sm:py-20 lg:py-24 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
              <span className="px-3 py-1 rounded-full bg-[#006a4e]/10 text-[#006a4e] text-xs font-bold uppercase tracking-wider">
                ব্যবহারের ক্ষেত্র
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-3">
                কোথায় কাজে লাগবে সার্ভার কপি?
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2">
                দৈনন্দিন জীবনের প্রায় প্রতিটি অফিসিয়াল কাজে NID সার্ভার কপি প্রয়োজন হয়
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {useCases.map((item, idx) => (
                <div
                  key={idx}
                  className="group flex items-start gap-4 glass-card bg-card border border-border/80 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:border-[#006a4e]/40 transition-all duration-300"
                >
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-[#006a4e]/10 to-[#f42a41]/10 text-[#006a4e] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Perks Section */}
        <section id="perks" className="py-12 sm:py-20 lg:py-24 scroll-mt-16 bg-muted/20 border-y border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
              <div className="space-y-4 sm:space-y-6">
                <span className="px-3 py-1 rounded-full bg-[#f42a41]/10 text-[#f42a41] text-xs font-bold uppercase tracking-wider">
                  সুবিধাসমূহ
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground leading-tight">
                  একটি কপিতেই যা যা পাবেন
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  আমাদের প্রতিটি সার্ভার কপি অফিসিয়াল ফরম্যাট অনুসরণ করে তৈরি, যাতে যেকোনো দাপ্তরিক কাজে সরাসরি ব্যবহার করা যায়।
                </p>
                <ul className="space-y-3 pt-2">
                  {samplePerks.map((perk, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-foreground/90">
                      <span className="w-5 h-5 shrink-0 rounded-full bg-[#006a4e]/10 text-[#006a4e] flex items-center justify-center mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="leading-relaxed">{perk}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-3">
                  <a
                    href="#form-section"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    এখনই কপি সংগ্রহ করুন
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#006a4e]/25 via-[#f42a41]/15 to-teal-500/20 blur-xl opacity-70 -z-10" />
                <div className="glass-card bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-lg space-y-5">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#006a4e] to-teal-600 text-white flex items-center justify-center shadow-md">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">নমুনা সার্ভার কপি</p>
                      <p className="text-xs text-muted-foreground">অফিসিয়াল ফরম্যাট প্রিভিউ</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "নাম (বাংলা)", value: "মোঃ রহিম উদ্দিন" },
                      { label: "নাম (English)", value: "Md. Rahim Uddin" },
                      { label: "NID নম্বর", value: "১৯৯০ •••••••• ৫৬৭৮" },
                      { label: "জন্ম তারিখ", value: "০১ জানুয়ারি ১৯৯০" },
                      { label: "ঠিকানা", value: "ঢাকা, বাংলাদেশ" },
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 text-xs sm:text-sm py-2 border-b border-dashed border-border/50 last:border-0">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-semibold text-foreground text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground">
                    <QrCode className="w-4 h-4 text-[#006a4e] shrink-0" />
                    <span>প্রতিটি কপিতে যাচাইযোগ্য QR কোড সংযুক্ত থাকে</span>
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
                ব্যবহারকারীদের মতামত
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-3">
                যারা সেবা নিয়েছেন তাদের অভিজ্ঞতা
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2">
                সারা দেশ ও প্রবাস থেকে হাজারো ব্যবহারকারীর আস্থার প্রতিদান
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="group glass-card bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-lg hover:border-[#006a4e]/40 transition-all duration-300 flex flex-col"
                >
                  <Quote className="w-7 h-7 text-[#006a4e]/30 mb-3" />
                  <p className="text-sm text-foreground/90 leading-relaxed flex-1">{t.text}</p>
                  <div className="flex items-center gap-1 mt-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#f42a41] text-[#f42a41]" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/60">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#006a4e]/20 to-[#f42a41]/20 flex items-center justify-center text-sm font-bold text-[#006a4e]">
                      {t.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-12 sm:py-20 lg:py-24 scroll-mt-16 bg-muted/20 border-y border-border/60">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <span className="px-3 py-1 rounded-full bg-[#f42a41]/10 text-[#f42a41] text-xs font-bold uppercase tracking-wider">
                প্রশ্নোত্তর
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-3">
                সাধারণ জিজ্ঞাসা
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2">
                আপনার প্রশ্নের উত্তর এখানেই পেয়ে যেতে পারেন
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="glass-card bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 sm:px-6 sm:py-5 hover:bg-muted/40 transition-colors"
                    >
                      <span className="flex items-center gap-3 text-sm sm:text-base font-bold text-foreground">
                        <HelpCircle className="w-5 h-5 text-[#006a4e] shrink-0" />
                        {faq.q}
                      </span>
                      <span className="shrink-0 w-7 h-7 rounded-full bg-[#006a4e]/10 text-[#006a4e] flex items-center justify-center">
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 -mt-1">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-8">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Skipped Questions Section */}
        <section id="skipped-questions" className="py-12 sm:py-20 lg:py-24 scroll-mt-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <span className="px-3 py-1 rounded-full bg-[#006a4e]/10 text-[#006a4e] text-xs font-bold uppercase tracking-wider">
                অসম্পূর্ণ প্রশ্ন
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-3">
                যেসব প্রশ্ন এখনো উত্তর পায়নি
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2">
                ব্যবহারকারীরা যেসব বিষয়ে জানতে চেয়েছেন কিন্তু এখনো নিশ্চিত উত্তর দেওয়া হয়নি — সেগুলো এখানে খোলাখুলি তালিকাভুক্ত করা হয়েছে।
              </p>
            </div>

            <div className="space-y-3">
              {skippedQuestions.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#f42a41]/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#f42a41]/10 text-[#f42a41] flex items-center justify-center mt-0.5">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">{item.q}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1.5">{item.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                আপনার প্রশ্নের উত্তর না পেলে সরাসরি যোগাযোগ করুন — আমরা যত দ্রুত সম্ভব উত্তর দেওয়ার চেষ্টা করব।
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                যোগাযোগ করুন
              </a>
            </div>
          </div>
        </section>

        {/* Contact / CTA Section */}
        <section id="contact" className="py-12 sm:py-20 lg:py-24 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-[#006a4e]/25 bg-gradient-to-br from-[#006a4e]/10 via-card to-[#f42a41]/10 p-6 sm:p-10 lg:p-14 shadow-lg">
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#006a4e]/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#f42a41]/10 blur-3xl pointer-events-none" />

              <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-4 sm:space-y-5">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#006a4e]/10 text-[#006a4e] text-xs font-bold uppercase tracking-wider">
                    <BellRing className="w-3.5 h-3.5" />
                    সহায়তা কেন্দ্র
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground leading-tight">
                    যেকোনো সমস্যায় আমরা পাশে আছি
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    সার্ভার কপি ডাউনলোড, যাচাই বা যেকোনো কারিগরি সহায়তার জন্য আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন। আমরা দ্রুততম সময়ে সমাধান দিতে প্রস্তুত।
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href="#form-section"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95"
                    >
                      <Search className="w-4 h-4" />
                      কপি খুঁজুন
                    </a>
                    <a
                      href="mailto:support@nidservicebd.com"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground font-bold text-sm hover:border-[#006a4e]/40 hover:shadow-md transition-all"
                    >
                      <Mail className="w-4 h-4 text-[#006a4e]" />
                      ইমেইল করুন
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: PhoneCall, title: "হটলাইন", value: "১৬২৪৭", note: "সকাল ৯টা - রাত ৯টা" },
                    { icon: MessageSquare, title: "লাইভ চ্যাট", value: "২৪/৭ সাপোর্ট", note: "তাৎক্ষণিক উত্তর" },
                    { icon: Mail, title: "ইমেইল", value: "support@nidservicebd.com", note: "২৪ ঘণ্টার মধ্যে রিপ্লাই" },
                    { icon: MapPin, title: "অফিস", value: "ঢাকা, বাংলাদেশ", note: "শনিবার - বৃহস্পতিবার" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="glass-card bg-card/80 border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#006a4e]/40 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006a4e]/10 to-[#f42a41]/10 text-[#006a4e] flex items-center justify-center mb-3">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{item.title}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5 break-words">{item.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60 bg-muted/30 backdrop-blur-sm no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img src={logo} alt="NID Service BD লোগো" className="w-10 h-10 rounded-2xl object-contain" />
                <div className="leading-tight">
                  <p className="text-sm font-black text-foreground">NID Service BD</p>
                  <p className="text-[11px] text-muted-foreground">জাতীয় পরিচয়পত্র অনলাইন পোর্টাল</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                দ্রুত, নিরাপদ ও নির্ভুলভাবে জাতীয় পরিচয়পত্রের সার্ভার কপি সংগ্রহ ও যাচাইয়ের আধুনিক প্ল্যাটফর্ম।
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">দ্রুত লিংক</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#form-section" className="text-muted-foreground hover:text-primary transition-colors">যাচাই ফর্ম</a></li>
                <li><a href="#steps" className="text-muted-foreground hover:text-primary transition-colors">কার্যপদ্ধতি</a></li>
                <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">বিশেষত্বসমূহ</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">প্রশ্নোত্তর</a></li>
                <li><a href="#skipped-questions" className="text-muted-foreground hover:text-primary transition-colors">অসম্পূর্ণ প্রশ্ন</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">সেবাসমূহ</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#use-cases" className="text-muted-foreground hover:text-primary transition-colors">ব্যাংক ও KYC</a></li>
                <li><a href="#use-cases" className="text-muted-foreground hover:text-primary transition-colors">সিম রেজিস্ট্রেশন</a></li>
                <li><a href="#use-cases" className="text-muted-foreground hover:text-primary transition-colors">সরকারি সেবা</a></li>
                <li><a href="#united-air" className="text-muted-foreground hover:text-primary transition-colors">United Air টিকিট</a></li>
                <li><a href="#perks" className="text-muted-foreground hover:text-primary transition-colors">সার্ভার কপি সুবিধা</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">যোগাযোগ</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#006a4e] shrink-0" />
                  <span>হটলাইন: ১৬২৪৭</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#006a4e] shrink-0" />
                  <a href="mailto:support@nidservicebd.com" className="hover:text-primary transition-colors break-all">support@nidservicebd.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#006a4e] shrink-0" />
                  <span>ঢাকা, বাংলাদেশ</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} NID Service BD — সর্বস্বত্ব সংরক্ষিত।</p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006a4e]" />
              নিরাপদ ও এনক্রিপ্টেড সংযোগ
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
