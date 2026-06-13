import { lazy, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { nidLookupSchema, type NidLookupInput } from "../schema";
import { useNidLookup } from "../hooks/useNidLookup";
import { NidLookupError } from "../api/nidClient";

const NidResult = lazy(() => import("./NidResult"));

const ResultSkeleton = () => (
  <div className="space-y-3" aria-hidden="true">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-11 w-full" />
  </div>
);

const NidForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<NidLookupInput>({
    resolver: zodResolver(nidLookupSchema),
    defaultValues: { nid_number: "", date_of_birth: "" },
    mode: "onTouched",
  });

  const { mutate, data, isPending, error, reset } = useNidLookup();

  const onSubmit = (values: NidLookupInput) => {
    mutate(values);
  };

  const apiErrorMessage =
    error instanceof NidLookupError ? error.message : error ? "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।" : null;

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="w-full bg-card rounded-3xl shadow-[var(--shadow-elevated)] border border-border p-6 sm:p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" aria-hidden="true" />

        <div className="text-center mb-7">
          <h2 id="form-heading" className="text-2xl font-bold text-foreground">
            NID তথ্য যাচাই করুন
          </h2>
          <p className="text-muted-foreground mt-1">
            আপনার জাতীয় পরিচয়পত্রের সঠিক তথ্য প্রদান করুন
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="nid" className="text-sm font-semibold ml-1">
              NID নম্বর
            </Label>
            <Input
              id="nid"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="আপনার ১০, ১৩ বা ১৭ সংখ্যার NID নম্বর"
              maxLength={17}
              aria-invalid={!!errors.nid_number}
              aria-describedby={errors.nid_number ? "nid-error" : undefined}
              className="h-12 bg-muted/60 rounded-xl px-5"
              {...register("nid_number", {
                onChange: (e) => {
                  const sanitized = e.target.value.replace(/\D/g, "");
                  setValue("nid_number", sanitized, { shouldValidate: true });
                },
              })}
            />
            {errors.nid_number && (
              <p id="nid-error" role="alert" className="text-sm text-destructive ml-1">
                {errors.nid_number.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="text-sm font-semibold ml-1">
              জন্ম তারিখ
            </Label>
            <Input
              id="dob"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              min="1900-01-01"
              aria-invalid={!!errors.date_of_birth}
              aria-describedby={errors.date_of_birth ? "dob-error" : undefined}
              className="h-12 bg-muted/60 rounded-xl px-5"
              {...register("date_of_birth")}
            />
            {errors.date_of_birth && (
              <p id="dob-error" role="alert" className="text-sm text-destructive ml-1">
                {errors.date_of_birth.message}
              </p>
            )}
          </div>

          {apiErrorMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{apiErrorMessage}</span>
              <button
                type="button"
                onClick={() => reset()}
                className="ml-auto underline text-xs"
              >
                বন্ধ
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full min-h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-[var(--shadow-primary)] transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] motion-reduce:active:scale-100"
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
        </form>
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
