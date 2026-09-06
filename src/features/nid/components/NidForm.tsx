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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { nidRequestFormSchema, type NidRequestFormInput } from "../schema";
import { useNidLookup } from "../hooks/useNidLookup";
import { NidLookupError } from "../api/nidClient";

const NidResult = lazy(() => import("./NidResult"));

const ResultSkeleton = () => (
  <div className="space-y-4 pt-2">
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3.5 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 shadow-sm backdrop-blur-sm"
    >
      <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
        <Loader2 className="w-5 h-5 text-primary animate-spin" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          যাচাই করা হচ্ছে...
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          আপনার তথ্য নিরাপদ চ্যানেলের মাধ্যমে যাচাই করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।
        </p>
      </div>
    </div>
    <div aria-hidden="true" className="space-y-3">
      <Skeleton className="h-56 w-full rounded-3xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
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

  const onSubmit = (values: NidRequestFormInput) => {
    mutate(values as Required<NidRequestFormInput>);
  };

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

  return (
    <div className="w-full space-y-6">
      {/* Form Card */}
      <div className="relative w-full bg-card/95 backdrop-blur-xl rounded-3xl border border-border/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-6 sm:p-8 lg:p-9 overflow-hidden transition-all">
        {/* Subtle Decorative Elements */}
        <div
          className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-teal-500"
          aria-hidden="true"
        />
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8 pb-5 border-b border-border/60">
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-sm"
                aria-hidden="true"
              >
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 id="form-heading" className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                  <span>NID তথ্য অনুসন্ধান</span>
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  সঠিক জাতীয় পরিচয়পত্র নম্বর ও জন্ম তারিখ দিন
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>SSL এনক্রিপ্টেড</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5 sm:space-y-6" noValidate>
            {/* Global Errors summary if needed */}
            {Object.keys(errors).length > 0 && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 text-destructive shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-destructive">
                      অনুগ্রহ করে তথ্যগুলো সংশোধন করুন:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-destructive/90 list-disc list-inside">
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

                          return (
                            <li key={field}>
                              <a
                                href={`#${idMap[field]}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const el = document.getElementById(idMap[field]);
                                  el?.focus();
                                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                                }}
                                className="underline underline-offset-2 hover:no-underline font-medium"
                              >
                                {labelMap[field]}: {err?.message}
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

            {/* NID Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="nid" className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>জাতীয় পরিচয়পত্র নম্বর (NID)</span>
                  <span className="text-destructive">*</span>
                </Label>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded-md transition-colors ${
                    nidValue.length === 10 || nidValue.length === 13 || nidValue.length === 17
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "bg-muted text-muted-foreground"
                  }`}
                  aria-hidden="true"
                >
                  {nidValue.length}/17
                </span>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted/60 group-focus-within:bg-primary/10 flex items-center justify-center transition-colors">
                  <CreditCard
                    className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <Input
                  id="nid"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="১০, ১৩ বা ১৭ সংখ্যার স্মার্ট বা সাধারণ NID লিখুন"
                  maxLength={17}
                  aria-invalid={!!errors.nid_number}
                  aria-describedby={errors.nid_number ? "nid-error" : "nid-hint"}
                  className="h-13 bg-muted/30 hover:bg-muted/50 rounded-2xl pl-14 pr-4 border-border/80 focus-visible:bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 aria-[invalid=true]:border-destructive text-base font-medium transition-all shadow-inner/5"
                  {...register("nid_number", {
                    onChange: (e) => {
                      const sanitized = e.target.value.replace(/\D/g, "");
                      setValue("nid_number", sanitized, { shouldValidate: true });
                    },
                  })}
                />
              </div>
              {errors.nid_number ? (
                <p id="nid-error" role="alert" className="text-xs text-destructive font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  {errors.nid_number.message}
                </p>
              ) : (
                <p id="nid-hint" className="text-xs text-muted-foreground">
                  ১০ অঙ্কের স্মার্ট কার্ড অথবা ১৩/১৭ অঙ্কের সাধারণ কার্ড নম্বর
                </p>
              )}
            </div>

            {/* Date of Birth & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* DOB */}
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>জন্ম তারিখ</span>
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted/60 group-focus-within:bg-primary/10 flex items-center justify-center transition-colors pointer-events-none">
                    <Calendar
                      className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"
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
                    className="h-13 bg-muted/30 hover:bg-muted/50 rounded-2xl pl-14 pr-4 border-border/80 focus-visible:bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 aria-[invalid=true]:border-destructive text-base font-medium transition-all"
                    {...register("date_of_birth")}
                  />
                </div>
                {errors.date_of_birth && (
                  <p id="dob-error" role="alert" className="text-xs text-destructive font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    {errors.date_of_birth.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span>ইমেইল ঠিকানা</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground font-medium">ফলাফল কপি পেতে</span>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted/60 group-focus-within:bg-primary/10 flex items-center justify-center transition-colors pointer-events-none">
                    <Mail
                      className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@mail.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : "email-hint"}
                    className="h-13 bg-muted/30 hover:bg-muted/50 rounded-2xl pl-14 pr-4 border-border/80 focus-visible:bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 aria-[invalid=true]:border-destructive text-base font-medium transition-all"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" role="alert" className="text-xs text-destructive font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* API Error Box */}
            {apiErrorMessage && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-3 text-destructive text-sm bg-destructive/10 border border-destructive/25 p-4 rounded-2xl animate-in fade-in"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="flex-1 font-medium">{apiErrorMessage}</span>
                <button
                  type="button"
                  onClick={() => reset()}
                  aria-label="বার্তা বন্ধ করুন"
                  className="shrink-0 p-1 rounded-lg hover:bg-destructive/15 transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Submit CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                aria-disabled={isPending}
                className="relative w-full h-13 sm:h-14 bg-gradient-to-r from-primary via-emerald-600 to-teal-600 text-white font-bold text-base rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 group disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden cursor-pointer"
              >
                {/* Subtle shine effect */}
                <div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none"
                  aria-hidden="true"
                />

                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span>যাচাই ও অনুসন্ধান করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Search
                      className="w-5 h-5 group-hover:scale-110 group-hover:rotate-6 transition-transform"
                      aria-hidden="true"
                    />
                    <span>তথ্য যাচাই ও অনুসন্ধান করুন</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer trust notes */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                তাৎক্ষণিক ফলাফল
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                শতভাগ গোপনীয় ও সুরক্ষিত
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Dynamic Results or Skeleton Loader */}
      {isPending && <ResultSkeleton />}
      {data && (
        <Suspense fallback={<ResultSkeleton />}>
          <NidResult data={data} />
        </Suspense>
      )}
    </div>
  );
};

export default NidForm;
