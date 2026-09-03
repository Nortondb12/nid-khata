import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LogOut, ShieldCheck, RefreshCw, Inbox } from "lucide-react";
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
    document.title = "আমার অনুরোধের স্ট্যাটাস | NID সার্ভার কপি";
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl animated-gradient flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="font-bold text-foreground text-sm">NID সার্ভার কপি</span>
          </Link>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/auth", { replace: true });
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            লগআউট
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">আমার অনুরোধসমূহ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {session?.user?.email} — এই ইমেইলে জমা দেওয়া অনুরোধের বর্তমান অবস্থা।
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
            রিফ্রেশ
          </button>
        </div>

        <div className="mt-6 space-y-3" aria-live="polite">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> লোড হচ্ছে...
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">
              তথ্য আনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
            </p>
          )}

          {!isLoading && data && data.length === 0 && (
            <div className="text-center border border-dashed border-border rounded-2xl p-10">
              <Inbox className="w-8 h-8 mx-auto text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-sm text-muted-foreground">
                এই ইমেইলে কোনো অনুরোধ পাওয়া যায়নি।
              </p>
              <Link
                to="/"
                className="inline-block mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
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
                className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground tabular-nums">NID: {row.nid_masked}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    জন্ম সাল: {row.dob_year ?? "—"} · জমা: {formatDate(row.created_at)}
                  </p>
                  {row.status === "failed" && row.failure_reason && (
                    <p className="text-xs text-destructive mt-1">কারণ: {row.failure_reason}</p>
                  )}
                </div>
                <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border ${badge.className}`}>
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
