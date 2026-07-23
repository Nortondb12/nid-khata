import { lazy, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2, AlertCircle, CreditCard, Calendar, ShieldCheck, X, User, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { nidLookupSchema, type NidLookupInput } from "../schema";
import { useNidLookup } from "../hooks/useNidLookup";
import { NidLookupError } from "../api/nidClient";

const NidResult = lazy(() => import("./NidResult"));

const ResultSkeleton = () => (
  <div className="space-y-3" aria-hidden="true">
    <Skeleton className="h-12 w-full rounded-2xl" />
    <Skeleton className="h-40 w-full rounded-2xl" />
    <Skeleton className="h-11 w-full rounded-xl" />
  </div>
);

const NidForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<NidLookupInput>({
    resolver: zodResolver(nidLookupSchema),
    defaultValues: { nid_number: "", date_of_birth: "", full_name: "", father_name: "" },
    mode: "onTouched",
  });

  const { mutate, data, isPending, error, reset } = useNidLookup();
  const nidValue = watch("nid_number") ?? "";

  const onSubmit = (values: NidLookupInput) => {
    mutate(values as Required<NidLookupInput>);
  };

  const apiErrorMessage =
    error instanceof NidLookupError ? error.message : error ? "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।" : null;

  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto space-y-5 sm:space-y-6">
      <div className="relative w-full bg-card rounded-2xl sm:rounded-3xl shadow-[var(--shadow-elevated)] border border-border/80 p-5 sm:p-7 lg:p-8 overflow-hidden">
        {/* Top accent gradient */}
        <div
          className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-[hsl(var(--primary-glow))] to-accent"
          aria-hidden="true"
        />
        {/* Soft glow */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden="true">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="form-heading" className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                NID তথ্য যাচাই করুন
              </h2>
              <p className="text-sm text-muted-foreground">আপনার সঠিক তথ্য প্রদান করুন</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* NID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="nid" className="text-sm font-semibold">
                  NID নম্বর
                </Label>
                <span className="text-[11px] text-muted-foreground tabular-nums" aria-hidden="true">
                  {nidValue.length}/17
                </span>
              </div>
              <div className="relative group">
                <CreditCard
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"
                  aria-hidden="true"
                />
                <Input
                  id="nid"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="১০, ১৩ বা ১৭ সংখ্যার নম্বর"
                  maxLength={17}
                  aria-invalid={!!errors.nid_number}
                  aria-describedby={errors.nid_number ? "nid-error" : "nid-hint"}
                  className="h-12 bg-muted/40 rounded-xl pl-11 pr-4 border-border focus-visible:bg-card focus-visible:border-primary transition-colors text-base"
                  {...register("nid_number", {
                    onChange: (e) => {
                      const sanitized = e.target.value.replace(/\D/g, "");
                      setValue("nid_number", sanitized, { shouldValidate: true });
                    },
                  })}
                />
              </div>
              {errors.nid_number ? (
                <p id="nid-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  {errors.nid_number.message}
                </p>
              ) : (
                <p id="nid-hint" className="text-xs text-muted-foreground">
                  কার্ডের পেছনে অথবা সামনে উল্লেখিত নম্বরটি লিখুন
                </p>
              )}
            </div>

            {/* DOB */}
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-sm font-semibold">
                জন্ম তারিখ
              </Label>
              <div className="relative group">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  id="dob"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  min="1900-01-01"
                  aria-invalid={!!errors.date_of_birth}
                  aria-describedby={errors.date_of_birth ? "dob-error" : undefined}
                  className="h-12 bg-muted/40 rounded-xl pl-11 pr-4 border-border focus-visible:bg-card focus-visible:border-primary transition-colors text-base"
                  {...register("date_of_birth")}
                />
              </div>
              {errors.date_of_birth && (
                <p id="dob-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  {errors.date_of_birth.message}
                </p>
              )}
            </div>

            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-semibold">
                পূর্ণ নাম
              </Label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"
                  aria-hidden="true"
                />
                <Input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="NID কার্ডে যেমন আছে"
                  maxLength={100}
                  aria-invalid={!!errors.full_name}
                  aria-describedby={errors.full_name ? "full_name-error" : "full_name-hint"}
                  className="h-12 bg-muted/40 rounded-xl pl-11 pr-4 border-border focus-visible:bg-card focus-visible:border-primary transition-colors text-base"
                  {...register("full_name")}
                />
              </div>
              {errors.full_name ? (
                <p id="full_name-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.full_name.message}</span>
                </p>
              ) : (
                <p id="full_name-hint" className="text-xs text-muted-foreground">
                  NID কার্ডে যেভাবে লেখা আছে ঠিক সেভাবেই লিখুন (২–১০০ অক্ষর)
                </p>
              )}

            </div>

            {/* Father's name */}
            <div className="space-y-2">
              <Label htmlFor="father_name" className="text-sm font-semibold">
                পিতার নাম
              </Label>
              <div className="relative group">
                <Users
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"
                  aria-hidden="true"
                />
                <Input
                  id="father_name"
                  type="text"
                  autoComplete="off"
                  placeholder="NID কার্ডে যেমন আছে"
                  maxLength={100}
                  aria-invalid={!!errors.father_name}
                  aria-describedby={errors.father_name ? "father_name-error" : "father_name-hint"}
                  className="h-12 bg-muted/40 rounded-xl pl-11 pr-4 border-border focus-visible:bg-card focus-visible:border-primary transition-colors text-base"
                  {...register("father_name")}
                />
              </div>
              {errors.father_name ? (
                <p id="father_name-error" role="alert" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.father_name.message}</span>
                </p>
              ) : (
                <p id="father_name-hint" className="text-xs text-muted-foreground">
                  NID কার্ডে উল্লেখিত পিতার পূর্ণ নাম লিখুন
                </p>
              )}

            </div>

            {apiErrorMessage && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 p-3 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="flex-1">{apiErrorMessage}</span>
                <button
                  type="button"
                  onClick={() => reset()}
                  aria-label="বার্তা বন্ধ করুন"
                  className="shrink-0 p-0.5 rounded hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              aria-disabled={isPending}
              className="relative w-full min-h-12 bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground font-bold py-3.5 rounded-xl shadow-[var(--shadow-primary)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[var(--shadow-glow)] hover:brightness-105 active:scale-[0.99] motion-reduce:active:scale-100 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>অনুসন্ধান করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Search
                    className="w-5 h-5 group-hover:scale-110 transition-transform motion-reduce:group-hover:scale-100"
                    aria-hidden="true"
                  />
                  <span>অনুসন্ধান করুন</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              আপনার তথ্য সম্পূর্ণ গোপন রাখা হবে
            </p>
          </form>
        </div>
      </div>

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
