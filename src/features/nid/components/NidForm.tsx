import { lazy, Suspense, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  Loader2,
  AlertCircle,
  CreditCard,
  Calendar,
  ShieldCheck,
  X,
  Mail,
  CheckCircle2,
  Sparkles,
  Lock,
  Fingerprint,
  FileCheck2,
  Database,
  Download,
  FileImage,
  FileDown,
  Check,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { nidRequestFormSchema, type NidRequestFormInput } from "../schema";
import { useNidLookup } from "../hooks/useNidLookup";
import { NidLookupError } from "../api/nidClient";
import {
  downloadNidCopy,
  DownloadCancelledError,
  type DownloadFormat,
  type DownloadProgress,
} from "../utils/downloadCopy";

const NidResult = lazy(() => import("./NidResult"));

const ResultSkeleton = () => (
  <div className="space-y-5 pt-3">
    {/* Loading Status Card */}
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 shadow-lg shadow-primary/5 backdrop-blur-sm"
    >
      {/* Animated progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5">
        <div className="h-full bg-gradient-to-r from-primary via-emerald-500 to-teal-500 animate-progress" />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-400" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground flex items-center gap-2">
            যাচাই করা হচ্ছে নিবন্ধিত তথ্য...
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" aria-hidden="true" />
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            সুরক্ষিত চ্যানেলের মাধ্যমে সরকারি সার্ভারে সংযোগ স্থাপন হচ্ছে — অনুগ্রহ করে অপেক্ষা করুন
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <div className="flex items-center gap-1 text-primary">
          <ShieldCheck className="w-3.5 h-3.5" />
          এনক্রিপশন
        </div>
        <span className="w-1.5 h-px bg-foreground/30" />
        <span className="flex items-center gap-1">
          <Search className="w-3 h-3" />
          সার্ভার যাচাই
        </span>
        <span className="w-1.5 h-px bg-foreground/30" />
        <span className="flex items-center gap-1">
          <FileCheck2 className="w-3 h-3" />
          ফলাফল প্রস্তুত
        </span>
      </div>
    </div>

    {/* Skeleton cards */}
    <div aria-hidden="true" className="space-y-4">
      <div className="rounded-3xl border border-border/60 bg-card/80 overflow-hidden shadow-sm">
        <div className="h-2.5 w-full bg-gradient-to-r from-primary/20 via-emerald-400/30 to-teal-500/20" />
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <Skeleton className="h-11 w-full rounded-2xl" />
    </div>
  </div>
);

const NidForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NidRequestFormInput>({
    resolver: zodResolver(nidRequestFormSchema),
    defaultValues: { nid_number: "", date_of_birth: "", email: "" },
    mode: "onTouched",
  });

  const { mutate, data, isPending, error, reset } = useNidLookup();
  const nidValue = watch("nid_number") ?? "";
  const dobValue = watch("date_of_birth");

  // Server-copy download state
  const abortRef = useRef<AbortController | null>(null);
  const [downloadBusy, setDownloadBusy] = useState<DownloadFormat | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadDone, setDownloadDone] = useState<{ checksum: string; issuedAt: string } | null>(null);
  const [downloadCancelled, setDownloadCancelled] = useState(false);

  const onSubmit = (values: NidRequestFormInput) => {
    mutate(values as Required<NidRequestFormInput>);
  };

  const handleDownloadCopy = async (format: DownloadFormat) => {
    if (downloadBusy) return;
    setDownloadError(null);
    setDownloadCancelled(false);
    setDownloadDone(null);
    setDownloadProgress({ stage: "preparing", percent: 0, message: "শুরু হচ্ছে..." });
    setDownloadBusy(format);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await downloadNidCopy(
        {
          name_bn: "",
          name_en: "",
          father_name: "",
          mother_name: "",
          date_of_birth: dobValue ?? "",
          nid_number: nidValue,
          address: "",
        },
        format,
        (p) => {
          if (!controller.signal.aborted) setDownloadProgress(p);
        },
        controller.signal,
      );
      setDownloadDone(result);
      setTimeout(() => setDownloadProgress(null), 1200);
    } catch (err) {
      if (err instanceof DownloadCancelledError) {
        setDownloadCancelled(true);
        setDownloadProgress(null);
        setTimeout(() => setDownloadCancelled(false), 2500);
      } else {
        setDownloadError(err instanceof Error ? err.message : "ডাউনলোড ব্যর্থ হয়েছে।");
        setDownloadProgress(null);
      }
    } finally {
      abortRef.current = null;
      setDownloadBusy(null);
    }
  };

  const handleCancelDownload = () => {
    abortRef.current?.abort();
  };

  // Derived state for form visual feedback
  const isNidValid =
    nidValue.length === 10 || nidValue.length === 13 || nidValue.length === 17;
  const hasDob = Boolean(dobValue);
  const fieldsCompleted = isNidValid && hasDob;
  const formProgress = [0, isNidValid ? 1 : 0, hasDob ? 1 : 0].filter(Boolean).length;

  const fieldIdMap: Record<keyof NidRequestFormInput, string> = {
    nid_number: "nid",
    date_of_birth: "dob",
    email: "email",
  };
  const fieldOrder: (keyof NidRequestFormInput)[] = ["nid_number", "date_of_birth", "email"];

  const onInvalid = (errs: typeof errors) => {
    const first = fieldOrder.find((f) => errs[f]);
    if (!first) return;
    const el = document.getElementById(fieldIdMap[first]);
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    setTimeout(() => (el as HTMLElement).focus({ preventScroll: true }), prefersReduced ? 0 : 300);
  };

  const apiErrorMessage =
    error instanceof NidLookupError ? error.message : error ? "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।" : null;

  const handleNidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\D/g, "").slice(0, 17);
    setValue("nid_number", sanitized, { shouldValidate: true });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Form Card */}
      <div className="relative w-full bg-card/95 backdrop-blur-2xl rounded-3xl border border-border/80 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.5)] p-4 sm:p-6 md:p-8 lg:p-10 overflow-hidden transition-all duration-500 hover:shadow-[0_30px_90px_-15px_rgba(0,0,0,0.15)]">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-teal-500" aria-hidden="true" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/3 -right-24 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" aria-hidden="true" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden="true"
        />

        <div className="relative">
          {/* Header with refined layout */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-border/60">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-lg opacity-50" aria-hidden="true" />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-primary to-teal-600 text-white flex items-center justify-center shadow-lg shadow-primary/30 border border-white/10 backdrop-blur-sm">
                  <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                  <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" aria-hidden="true" />
                </span>
              </div>
              <div className="min-w-0">
                <h2 id="form-heading" className="text-base sm:text-lg lg:text-2xl font-black text-foreground tracking-tight flex items-center gap-2 flex-wrap">
                  <span className="truncate">NID তথ্য অনুসন্ধান</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20 shrink-0">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    বিনামূল্যে
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                  সঠিক তথ্য দিন — ফলাফল তাৎক্ষণিক ও নির্ভুল
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-bold shadow-sm shrink-0">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>256-bit SSL সুরক্ষা</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-6 sm:mb-8" aria-hidden="true">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">ফর্ম পূরণ অগ্রগতি</span>
              <span className="text-xs font-bold text-primary">
                {fieldsCompleted ? "সম্পন্ন ✓" : `${formProgress} প্রস্তুত`}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    idx < formProgress + (fieldsCompleted ? 1 : 0)
                      ? "bg-gradient-to-r from-primary to-teal-500"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5 sm:space-y-6 md:space-y-7" noValidate>
            {/* Validation summary */}
            {Object.keys(errors).length > 0 && (
              <div
                role="alert"
                aria-live="assertive"
                className="relative overflow-hidden rounded-2xl border border-destructive/25 bg-destructive/5 backdrop-blur-sm p-4 sm:p-5 animate-in fade-in slide-in-from-top-3 duration-300"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-destructive/60" />
                <div className="flex items-start gap-2.5 sm:gap-3.5">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-destructive mb-2">
                      নিচের তথ্যগুলো পরীক্ষা করুন:
                    </p>
                    <ul className="space-y-1.5">
                      {(Object.entries(errors) as [keyof NidRequestFormInput, { message?: string }][]).map(
                        ([field, err]) => {
                          const idMap: Record<keyof NidRequestFormInput, string> = {
                            nid_number: "nid",
                            date_of_birth: "dob",
                            email: "email",
                          };
                          const labelMap: Record<keyof NidRequestFormInput, string> = {
                            nid_number: "NID নম্বর",
                            date_of_birth: "জন্ম তারিখ",
                            email: "ইমেইল",
                          };
                          const iconMap: Record<keyof NidRequestFormInput, React.ReactNode> = {
                            nid_number: null,
                            date_of_birth: null,
                            email: null,
                          };

                          return (
                            <li key={field} className="flex items-start sm:items-center gap-2 text-xs sm:text-sm text-destructive font-medium">
                              <span className="text-destructive/60 shrink-0">{iconMap[field] ?? "•"}</span>
                              <a
                                href={`#${idMap[field]}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const el = document.getElementById(idMap[field]);
                                  el?.focus();
                                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                                }}
                                className="hover:underline underline-offset-4 transition-colors"
                              >
                                <span className="font-semibold">{labelMap[field]}</span> — {err?.message}
                              </a>
                            </li>
                          );
                        },
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* NID Number Field */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                <Label htmlFor="nid" className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0">1</span>
                  <span className="truncate">জাতীয় পরিচয়পত্র নম্বর (NID)</span>
                  <span className="text-destructive text-base leading-none shrink-0">*</span>
                </Label>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-full transition-all duration-300 ${
                      isNidValid
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold"
                        : nidValue
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-medium"
                          : "bg-muted text-muted-foreground border border-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    {isNidValid ? (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        সঠিক
                      </>
                    ) : nidValue ? (
                      "অসম্পূর্ণ"
                    ) : (
                      "প্রয়োজনীয়"
                    )}
                  </span>
                  <span className="font-mono text-[10px] sm:text-xs text-muted-foreground bg-muted px-1.5 sm:px-2 py-0.5 rounded-md">
                    {nidValue.length || 0}/17
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-muted to-muted/50 group-focus-within:from-primary/15 group-focus-within:to-primary/5 border border-border/50 group-focus-within:border-primary/30 flex items-center justify-center transition-all duration-300 pointer-events-none">
                  <CreditCard
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300"
                    aria-hidden="true"
                  />
                </div>
                <Input
                  id="nid"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="১০, ১৩ অথবা ১৭ সংখ্যার আইডি নম্বর লিখুন"
                  maxLength={17}
                  aria-invalid={!!errors.nid_number}
                  aria-describedby={errors.nid_number ? "nid-error" : "nid-hint"}
                  className={`h-12 sm:h-14 bg-muted/30 hover:bg-muted/40 rounded-2xl pl-12 sm:pl-16 pr-5 border-2 focus-visible:bg-card transition-all duration-300 text-sm sm:text-base font-medium w-full ${
                    isNidValid && !errors.nid_number
                      ? "border-emerald-500/50 focus-visible:border-emerald-500"
                      : errors.nid_number
                        ? "border-destructive/60 focus-visible:border-destructive"
                        : "border-border/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                  }`}
                  {...register("nid_number", { onChange: handleNidChange })}
                />
                {isNidValid && (
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  </div>
                )}
              </div>
              {errors.nid_number ? (
                <p id="nid-error" role="alert" className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse shrink-0" aria-hidden="true" />
                  {errors.nid_number.message}
                </p>
              ) : (
                <p id="nid-hint" className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1.5">
                  <Database className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">স্মার্ট কার্ড: ১০ সংখ্যা | সাধারণ কার্ড: ১৩ অথবা ১৭ সংখ্যা</span>
                </p>
              )}
            </div>

            {/* DOB + Email Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {/* DOB Field */}
              <div className="space-y-2.5 min-w-0">
                <Label htmlFor="dob" className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0">2</span>
                  <span>জন্ম তারিখ</span>
                  <span className="text-destructive text-base leading-none shrink-0">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-muted to-muted/50 group-focus-within:from-primary/15 group-focus-within:to-primary/5 border border-border/50 group-focus-within:border-primary/30 flex items-center justify-center transition-all duration-300 pointer-events-none">
                    <Calendar
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300"
                      aria-hidden="true"
                    />
                  </div>
                  <Input
                    id="dob"
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    min="1900-01-01"
                    aria-invalid={!!errors.date_of_birth}
                    aria-describedby={errors.date_of_birth ? "dob-error" : undefined}
                    className={`h-12 sm:h-14 bg-muted/30 hover:bg-muted/40 rounded-2xl pl-12 sm:pl-16 pr-3 sm:pr-4 border-2 focus-visible:bg-card transition-all duration-300 text-sm sm:text-base font-medium w-full ${
                      hasDob && !errors.date_of_birth
                        ? "border-emerald-500/50 focus-visible:border-emerald-500"
                        : errors.date_of_birth
                          ? "border-destructive/60 focus-visible:border-destructive"
                          : "border-border/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                    }`}
                    {...register("date_of_birth")}
                  />
                </div>
                {errors.date_of_birth && (
                  <p id="dob-error" role="alert" className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse shrink-0" aria-hidden="true" />
                    {errors.date_of_birth.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0">3</span>
                    <span>ইমেইল ঠিকানা</span>
                    <span className="text-destructive text-base leading-none shrink-0">*</span>
                  </Label>
                  <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground font-medium shrink-0">
                    <Mail className="w-3 h-3" />
                    ফলাফল কপি পেতে
                  </span>
                </div>
                <div className="relative group">
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-muted to-muted/50 group-focus-within:from-primary/15 group-focus-within:to-primary/5 border border-border/50 group-focus-within:border-primary/30 flex items-center justify-center transition-all duration-300 pointer-events-none">
                    <Mail
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300"
                      aria-hidden="true"
                    />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="আপনার ইমেইল লিখুন"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : "email-hint"}
                    className={`h-12 sm:h-14 bg-muted/30 hover:bg-muted/40 rounded-2xl pl-12 sm:pl-16 pr-3 sm:pr-4 border-2 focus-visible:bg-card transition-all duration-300 text-sm sm:text-base font-medium w-full ${
                      errors.email
                        ? "border-destructive/60 focus-visible:border-destructive"
                        : "border-border/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                    }`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" role="alert" className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse shrink-0" aria-hidden="true" />
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* API Error */}
            {apiErrorMessage && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-3 p-4 sm:p-5 rounded-2xl border border-destructive/25 bg-destructive/5 text-destructive animate-in fade-in duration-300"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 cursor-pointer hover:opacity-70 transition-opacity" onClick={reset} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{apiErrorMessage}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="relative w-full overflow-hidden rounded-2xl h-12 sm:h-14 bg-gradient-to-r from-primary to-teal-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 group"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" aria-hidden="true" />
                  অনুসন্ধান হচ্ছে...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  যাচাই করুন
                </span>
              )}
            </button>

            {/* Processing note */}
            <p className="text-[11px] sm:text-xs text-muted-foreground text-center leading-relaxed flex items-center justify-center gap-1.5">
              <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
              অনুরোধ প্রক্রিয়া হতে কয়েক সেকেন্ড সময় লাগতে পারে — অনুগ্রহ করে অপেক্ষা করুন।
            </p>

            {/* Server Copy Download */}
            <div className="pt-1 sm:pt-2 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border/70" aria-hidden="true" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileDown className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                  সার্ভার কপি ডাউনলোড
                </span>
                <div className="h-px flex-1 bg-border/70" aria-hidden="true" />
              </div>

              <p className="text-[11px] sm:text-xs text-muted-foreground text-center leading-relaxed">
                উপরের তথ্য দিয়ে সরাসরি সার্ভার-জেনারেটেড ওয়াটারমার্কযুক্ত কপি ডাউনলোড করুন
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Button
                  type="button"
                  onClick={() => handleDownloadCopy("pdf")}
                  disabled={downloadBusy !== null || !fieldsCompleted}
                  size="lg"
                  className="relative h-12 sm:h-13 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  aria-label="সার্ভার কপি PDF হিসেবে ডাউনলোড করুন"
                >
                  {downloadBusy === "pdf" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin shrink-0" aria-hidden="true" />
                      <span>তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2 shrink-0" aria-hidden="true" />
                      <span>PDF ডাউনলোড</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={() => handleDownloadCopy("png")}
                  disabled={downloadBusy !== null || !fieldsCompleted}
                  variant="outline"
                  size="lg"
                  className="relative h-12 sm:h-13 py-3.5 font-bold rounded-2xl bg-gradient-to-r from-emerald-600/5 to-teal-600/5 hover:from-emerald-600/10 hover:to-teal-600/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 w-full"
                  aria-label="সার্ভার কপি PNG ছবি হিসেবে ডাউনলোড করুন"
                >
                  {downloadBusy === "png" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin shrink-0" aria-hidden="true" />
                      <span>তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <FileImage className="w-5 h-5 mr-2 shrink-0" aria-hidden="true" />
                      <span>PNG ডাউনলোড</span>
                    </>
                  )}
                </Button>
              </div>

              {!fieldsCompleted && (
                <p className="text-[11px] sm:text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                  ডাউনলোড করতে NID নম্বর ও জন্ম তারিখ পূরণ করুন
                </p>
              )}

              {downloadProgress && (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {downloadProgress.stage === "done" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin shrink-0" aria-hidden="true" />
                    )}
                    <p className="text-sm font-semibold text-foreground flex-1 min-w-0 truncate">
                      {downloadProgress.message}
                    </p>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground shrink-0">
                      {Math.round(downloadProgress.percent)}%
                    </span>
                  </div>
                  <Progress value={downloadProgress.percent} className="h-2 rounded-full bg-emerald-500/10" aria-label="ডাউনলোড অগ্রগতি" />
                  {downloadProgress.stage !== "done" && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleCancelDownload}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl px-3"
                        aria-label="ডাউনলোড বাতিল করুন"
                      >
                        <X className="w-4 h-4 mr-1.5" aria-hidden="true" />
                        বাতিল করুন
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {downloadError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 text-destructive text-sm bg-destructive/10 border border-destructive/25 p-4 rounded-2xl"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-1 min-w-0">
                    <p className="font-bold">ডাউনলোড ব্যর্থ হয়েছে</p>
                    <p className="text-destructive/90 break-words">{downloadError}</p>
                  </div>
                </div>
              )}

              {downloadCancelled && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-3 text-sm bg-orange-500/10 border border-orange-500/25 p-4 rounded-2xl text-orange-700 dark:text-orange-300"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="font-semibold">ডাউনলোড প্রক্রিয়া বাতিল করা হয়েছে।</span>
                </div>
              )}

              {downloadDone && (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                    <h5 className="text-sm font-bold text-foreground">সফলভাবে ডাউনলোড সম্পন্ন</h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-background/70 border border-border/50">
                      <span className="text-muted-foreground">সার্ভারে তৈরি:</span>
                      <span className="font-semibold text-foreground break-words">{downloadDone.issuedAt}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-background/70 border border-border/50">
                      <span className="text-muted-foreground">যাচাই কোড:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider break-all">
                        {downloadDone.checksum}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Trust badges */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-500 shrink-0" aria-hidden="true" />
              SSL এনক্রিপ্টেড
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/30" aria-hidden="true" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-primary shrink-0" aria-hidden="true" />
              সরকারি ডেটাবেইস
            </span>
          </div>
        </div>
      </div>

      {/* Results section */}
      {data && !isPending && !error && (
        <Suspense fallback={<ResultSkeleton />}>
          <NidResult data={data} />
        </Suspense>
      )}
    </div>
  );
};

export default NidForm;
