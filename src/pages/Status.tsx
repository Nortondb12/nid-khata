import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LogOut, ShieldCheck, RefreshCw, Inbox, ArrowLeft } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type RequestRow = {
  id: string;
  nid_masked: string;
  dob_year: string | null;
  status: string;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
};

const statusLabel: Record<string, { text: string; className: string }> = {
  pending: { text: "প্রক্রিয়াধীন", className: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  success: { text: "সম্পন্ন", className: "bg-primary/10 text-primary border-primary/30" },
  failed: { text: "ব্যর্থ", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" });

const Status = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    document.title = "আমার অনুরোধের স্ট্যাটাস | NID Service BD";
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) navigate("/auth", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
      if (!data.session) navigate("/auth", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["my-nid-requests", session?.user?.id],
    enabled: !!session,
    queryFn: async (): Promise<RequestRow[]> => {
      const { data: rows, error: err } = await supabase
        .from("nid_requests")
        .select("id, nid_masked, dob_year, status, failure_reason, created_at, updated_at")
        .order("created_at", { ascending: false });
      if (err) throw err;
      return rows ?? [];
    },
  });

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl animated-gradient flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="font-bold text-foreground text-xs sm:text-sm truncate">NID Service BD</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              <span className="hidden xs:inline">মূল পাতা</span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/auth", { replace: true });
              }}
              className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              লগআউট
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-3 sm:px-6 py-6 sm:py-10 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">আমার অনুরোধসমূহ</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-all sm:break-normal">
              <span className="font-medium text-foreground">{session?.user?.email}</span> — এই ইমেইলে জমা দেওয়া অনুরোধের বর্তমান অবস্থা।
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="self-start sm:self-auto flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-border text-xs sm:text-sm font-medium hover:bg-muted active:scale-[0.98] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
            রিফ্রেশ
          </button>
        </div>

        <div className="mt-5 sm:mt-6 space-y-3" aria-live="polite">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground py-10">
              <Loader2 className="w-4 h-4 animate-spin text-primary" aria-hidden="true" /> লোড হচ্ছে...
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 sm:p-4">
              তথ্য আনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
            </p>
          )}

          {!isLoading && data && data.length === 0 && (
            <div className="text-center border border-dashed border-border rounded-2xl p-8 sm:p-12">
              <Inbox className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
                এই ইমেইলে কোনো অনুরোধ পাওয়া যায়নি।
              </p>
              <Link
                to="/"
                className="inline-block mt-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold shadow-md active:scale-[0.98] transition"
              >
                নতুন অনুরোধ করুন
              </Link>
            </div>
          )}

          {data?.map((row) => {
            const badge = statusLabel[row.status] ?? {
              text: row.status,
              className: "bg-muted text-muted-foreground border-border",
            };
            return (
              <article
                key={row.id}
                className="bg-card border border-border/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-primary/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-sm sm:text-base tabular-nums">
                      NID: {row.nid_masked}
                    </p>
                    <span className="sm:hidden text-xs font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${badge.className}">
                      {badge.text}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span>জন্ম সাল: <strong className="text-foreground/80">{row.dob_year ?? "—"}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>জমা: {formatDate(row.created_at)}</span>
                  </p>
                  {row.status === "failed" && row.failure_reason && (
                    <p className="text-xs text-destructive mt-1.5 bg-destructive/5 border border-destructive/15 rounded-md px-2 py-1">
                      কারণ: {row.failure_reason}
                    </p>
                  )}
                </div>
                <span className={`hidden sm:inline-flex shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border ${badge.className}`}>
                  {badge.text}
                </span>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Status;