import { lazy, Suspense } from "react";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { nidRequestFormSchema, type NidRequestFormInput } from "../schema";
import { useNidLookup } from "../hooks/useNidLookup";
import { NidLookupError } from "../api/nidClient";

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
      <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
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
          <div className="grid grid-cols-2 gap-4">
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

  const onSubmit = (values: NidRequestFormInput) => {
    mutate(values as Required<NidRequestFormInput>);
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
      <div className="relative w-full bg-card/95 backdrop-blur-2xl rounded-3xl border border-border/80 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.5)] p-6 sm:p-8 lg:p-10 overflow-hidden transition-all duration-500 hover:shadow-[0_30px_90px_-15px_rgba(0,0,0,0.15)]">
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
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-lg opacity-50" aria-hidden="true" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-teal-600 text-white flex items-center justify-center shadow-lg shadow-primary/30 border border-white/10 backdrop-blur-sm">
                  <Fingerprint className="w-6 h-6" aria-hidden="true" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3 text-white" aria-hidden="true" />
                </span>
              </div>
              <div>
                <h2 id="form-heading" className="text-lg sm:text-xl lg:text-2xl font-black text-foreground tracking-tight flex items-center gap-2 flex-wrap">
                  <span>NID তথ্য অনুসন্ধান</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    বিনামূল্যে
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                  সঠিক তথ্য দিন — ফলাফল তাৎক্ষণিক ও নির্ভুল
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-bold shadow-sm">
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
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 sm:space-y-7" noValidate>
            {/* Validation summary */}
            {Object.keys(errors).length > 0 && (
              <div
                role="alert"
                aria-live="assertive"
                className="relative overflow-hidden rounded-2xl border border-destructive/25 bg-destructive/5 backdrop-blur-sm p-4 sm:p-5 animate-in fade-in slide-in-from-top-3 duration-300"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-destructive/60" />
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-destructive" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-destructive mb-2">
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
                            <li key={field} className="flex items-center gap-2 text-xs sm:text-sm text-destructive font-medium">
                              <span className="text-destructive/60">{iconMap[field] ?? "•"}</span>
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="nid" className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">1</span>
                  <span>জাতীয় পরিচয়পত্র নম্বর (NID)</span>
                  <span className="text-destructive text-base leading-none">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all duration-300 ${
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
                        <CheckCircle2 className="w-3 h-3" />
                        সঠিক
                      </>
                    ) : nidValue ? (
                      "অসম্পূর্ণ"
                    ) : (
                      "প্রয়োজনীয়"
                    )}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    {nidValue.length || 0}/17
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-xl bg-gradient-to-br from-muted to-muted/50 group-focus-within:from-primary/15 group-focus-within:to-primary/5 border border-border/50 group-focus-within:border-primary/30 flex items-center justify-center transition-all duration-300 pointer-events-none">
                  <CreditCard
                    className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300"
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
                  className={`h-14 sm:h-14 bg-muted/30 hover:bg-muted/40 rounded-2xl pl-16 pr-5 border-2 focus-visible:bg-card transition-all duration-300 text-base font-medium w-full ${
                    isNidValid && !errors.nid_number
                      ? "border-emerald-500/50 focus-visible:border-emerald-500"
                      : errors.nid_number
                        ? "border-destructive/60 focus-visible:border-destructive"
                        : "border-border/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                  }`}
                  {...register("nid_number", { onChange: handleNidChange })}
                />
                {isNidValid && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                )}
              </div>
              {errors.nid_number ? (
                <p id="nid-error" role="alert" className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" aria-hidden="true" />
                  {errors.nid_number.message}
                </p>
              ) : (
                <p id="nid-hint" className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Database className="w-3 h-3 shrink-0" aria-hidden="true" />
                  স্মার্ট কার্ড: ১০ সংখ্যা | সাধারণ কার্ড: ১৩ অথবা ১৭ সংখ্যা
                </p>
              )}
            </div>

            {/* DOB + Email Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {/* DOB Field */}
              <div className="space-y-2.5">
                <Label htmlFor="dob" className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">2</span>
                  <span>জন্ম তারিখ</span>
                  <span className="text-destructive text-base leading-none">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-xl bg-gradient-to-br from-muted to-muted/50 group-focus-within:from-primary/15 group-focus-within:to-primary/5 border border-border/50 group-focus-within:border-primary/30 flex items-center justify-center transition-all duration-300 pointer-events-none">
                    <Calendar
                      className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300"
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
                    className={`h-14 bg-muted/30 hover:bg-muted/40 rounded-2xl pl-16 pr-4 border-2 focus-visible:bg-card transition-all duration-300 text-base font-medium w-full ${
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
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" aria-hidden="true" />
                    {errors.date_of_birth.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="email" className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">3</span>
                    <span>ইমেইল ঠিকানা</span>
                    <span className="text-destructive text-base leading-none">*</span>
                  </Label>
                  <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                    <Mail className="w-3 h-3" />
                    ফলাফল কপি পেতে
                  </span>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-xl bg-gradient-to-br from-muted to-muted/50 group-focus-within:from-primary/15 group-focus-within:to-primary/5 border border-border/50 group-focus-within:border-primary/30 flex items-center justify-center transition-all duration-300 pointer-events-none">
                    <Mail
                      className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300"
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
                    className={`h-14 bg-muted/30 hover:bg-muted/40 rounded-2xl pl-16 pr-4 border-2 focus-visible:bg-card transition-all duration-300 text-base font-medium w-full ${
                      errors.email
                        ? "border-destructive/60 focus-visible:border-destructive"
                        : "border-border/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                    }`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" role="alert" className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" aria-hidden="true" />
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
                className="flex items-start gap-3 text-destructive text-sm bg-destructive/5 border border-destructive/25 p-4 rounded-2xl animate-in fade-in slide-in-from-top-3 relative overflow-hidden"
              >
                <span className="absolute top-0 left-0 w-1 h-full bg-destructive/60" />
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-bold text-sm">যাচাই ব্যর্থ হয়েছে</p>
                  <p className="text-xs mt-1 opacity-90">{apiErrorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => reset()}
                  aria-label="বার্তা বন্ধ করুন"
                  className="shrink-0 p-1.5 rounded-lg hover:bg-destructive/15 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isPending}
                aria-disabled={isPending}
                className="relative w-full h-14 sm:h-15 bg-gradient-to-r from-primary via-primary to-teal-600 text-white font-bold text-base rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background"
              >
                {/* Shine effect */}
                <div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out pointer-events-none"
                  aria-hidden="true"
                />
                {/* Bottom gradient overlay for depth */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-60 group-hover:opacity-30 transition-opacity" aria-hidden="true" />

                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span>সার্ভারে যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex items-center justify-center gap-2.5 z-10">
                      <Search className="w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                      <span>তথ্য যাচাই করুন</span>
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Trust & Processing Info */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-muted-foreground pt-1">
              <div className="flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/15 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>তাৎক্ষণিক ফলাফল</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/15 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>শতভাগ গোপনীয়</span>
              </div>
              <div className="hidden sm:flex items-center justify-center gap-1.5 bg-teal-500/5 px-3 py-1.5 rounded-full border border-teal-500/15 font-medium">
                <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300 shrink-0" />
                <span>এনক্রিপ্টেড চ্যানেল</span>
              </div>
              <div className="hidden md:flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-foreground/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>সার্ভার অনলাইন</span>
              </div>
            </div>

            {/* Processing agreement */}
            <p className="text-center text-[10px] sm:text-[11px] leading-relaxed text-muted-foreground/80 px-4 pt-1 border-t border-border/40">
              <Lock className="inline w-2.5 h-2.5 mr-1 opacity-60" aria-hidden="true" />
              আপনার তথ্য শুধু যাচাইয়ের জন্য ব্যবহৃত হয় — কোনো ডেটা সংরক্ষণ বা তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।
            </p>
          </form>
        </div>
      </div>

      {/* Loading or Result Section */}
      {isPending && <ResultSkeleton />}
      {data && (
        <Suspense fallback={<ResultSkeleton />}>
          <NidResult data={data} />
        </Suspense>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes progress-indeterminate {
          0% { transform: translateX(0%) scaleX(0.3); }
          50% { transform: translateX(50%) scaleX(0.5); }
          100% { transform: translateX(100%) scaleX(0.3); }
        }
        .animate-progress {
          animation: progress-indeterminate 1.5s ease-in-out infinite;
          transform-origin: left center;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default NidForm;