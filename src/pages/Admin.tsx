import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Inbox,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

type RequestStatus = "pending" | "success" | "failed";
type FilterStatus = "all" | RequestStatus;

type RequestRow = {
  id: string;
  nid_masked: string;
  dob_year: string | null;
  email: string | null;
  status: string;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
};

const filters: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "সব" },
  { value: "pending", label: "প্রক্রিয়াধীন" },
  { value: "success", label: "অনুমোদিত" },
  { value: "failed", label: "ব্যর্থ" },
];

const statusMeta: Record<RequestStatus, { label: string; className: string }> = {
  pending: { label: "প্রক্রিয়াধীন", className: "border-accent/40 bg-accent/10 text-accent-foreground" },
  success: { label: "অনুমোদিত", className: "border-primary/30 bg-primary/10 text-primary" },
  failed: { label: "ব্যর্থ", className: "border-destructive/30 bg-destructive/10 text-destructive" },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" });

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [failedRequest, setFailedRequest] = useState<RequestRow | null>(null);
  const [failureReason, setFailureReason] = useState("");

  useEffect(() => {
    document.title = "অ্যাডমিন অনুরোধ ব্যবস্থাপনা | NID Service BD";

    const checkAccess = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/auth?next=/admin", { replace: true });
        return;
      }

      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(role?.role === "admin");
      setCheckingAccess(false);
    };

    void checkAccess();
  }, [navigate]);

  const requestsQuery = useQuery({
    queryKey: ["admin-nid-requests"],
    enabled: isAdmin,
    queryFn: async (): Promise<RequestRow[]> => {
      const { data, error } = await supabase
        .from("nid_requests")
        .select("id, nid_masked, dob_year, email, status, failure_reason, created_at, updated_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: RequestStatus; reason?: string }) => {
      const { error } = await supabase
        .from("nid_requests")
        .update({ status, failure_reason: reason?.trim() || null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-nid-requests"] });
      toast.success(variables.status === "success" ? "অনুরোধ অনুমোদিত হয়েছে" : "অনুরোধ ব্যর্থ হিসেবে চিহ্নিত হয়েছে");
      setFailedRequest(null);
      setFailureReason("");
    },
    onError: () => toast.error("স্ট্যাটাস পরিবর্তন করা যায়নি। আবার চেষ্টা করুন।"),
  });

  const requests = requestsQuery.data ?? [];
  const visibleRequests = useMemo(
    () => (filter === "all" ? requests : requests.filter((request) => request.status === filter)),
    [filter, requests],
  );
  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((request) => request.status === "pending").length,
      success: requests.filter((request) => request.status === "success").length,
      failed: requests.filter((request) => request.status === "failed").length,
    }),
    [requests],
  );

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="অ্যাক্সেস যাচাই হচ্ছে" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background px-4 pt-16 pb-24 sm:px-6 flex items-center justify-center">
        <section className="max-w-md rounded-md border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <CircleAlert className="h-6 w-6 text-destructive" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-foreground sm:text-3xl">অ্যাক্সেস অনুমোদিত নয়</h1>
          <p className="mt-3 text-muted-foreground">এই পেজটি শুধু অনুমোদিত অ্যাডমিনদের জন্য।</p>
          <Button asChild className="mt-7"><Link to="/">হোম পেজে ফিরুন</Link></Button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <span className="font-bold text-foreground block text-sm">NID Service BD</span>
              <span className="text-[11px] text-muted-foreground block -mt-0.5">অ্যাডমিন প্যানেল</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/auth", { replace: true });
            }}
          >
            <LogOut aria-hidden="true" /> লগআউট
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">অনুরোধ ব্যবস্থাপনা</p>
            <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">ভেরিফিকেশন অনুরোধ</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">অনুরোধ পর্যালোচনা করে অনুমোদন বা ব্যর্থ হিসেবে চিহ্নিত করুন।</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => requestsQuery.refetch()} disabled={requestsQuery.isFetching} className="mt-1">
            <RefreshCw className={requestsQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" />
            রিফ্রেশ
          </Button>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-3 sm:flex-wrap" role="group" aria-label="স্ট্যাটাস দিয়ে ফিল্টার করুন">
          {filters.map((item) => (
            <Button
              key={item.value}
              variant={filter === item.value ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
            >
              {item.label} <span className="tabular-nums opacity-70">{counts[item.value]}</span>
            </Button>
          ))}
        </div>

        <section className="mt-6 space-y-4" aria-live="polite">
          {requestsQuery.isLoading && (
            <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> অনুরোধ লোড হচ্ছে...
            </div>
          )}
          {requestsQuery.error && (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              অনুরোধগুলো আনা যায়নি। আবার চেষ্টা করুন।
            </p>
          )}
          {!requestsQuery.isLoading && !requestsQuery.error && visibleRequests.length === 0 && (
            <div className="rounded-md border border-dashed border-border py-16 text-center px-4">
              <Inbox className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-foreground">কোনো অনুরোধ নেই</p>
              <p className="mt-1 text-sm text-muted-foreground">এই স্ট্যাটাসে কোনো অনুরোধ এখনও আসেনি।</p>
            </div>
          )}

          {visibleRequests.map((request) => {
            const normalizedStatus: RequestStatus = ["success", "failed"].includes(request.status)
              ? (request.status as RequestStatus)
              : "pending";
            const meta = statusMeta[normalizedStatus];
            return (
              <article key={request.id} className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-foreground tabular-nums">NID: {request.nid_masked}</h2>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
                    </div>
                    <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                      <div><dt className="text-xs text-muted-foreground">জন্ম সাল</dt><dd className="mt-0.5 font-medium text-foreground">{request.dob_year ?? "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">ক্লায়েন্ট ইমেইল</dt><dd className="mt-0.5 break-all font-medium text-foreground">{request.email ?? "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">জমা হয়েছে</dt><dd className="mt-0.5 font-medium text-foreground">{formatDate(request.created_at)}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">সর্বশেষ আপডেট</dt><dd className="mt-0.5 font-medium text-foreground">{formatDate(request.updated_at)}</dd></div>
                    </dl>
                    {request.failure_reason && (
                      <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 p-3">
                        <p className="text-sm text-destructive">ব্যর্থতার কারণ: {request.failure_reason}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto md:flex-col lg:flex-row">
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-none"
                      disabled={updateStatus.isPending || normalizedStatus === "success"}
                      onClick={() => updateStatus.mutate({ id: request.id, status: "success" })}
                    >
                      <CheckCircle2 aria-hidden="true" /> অনুমোদন
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 sm:flex-none"
                      disabled={updateStatus.isPending || normalizedStatus === "failed"}
                      onClick={() => {
                        setFailedRequest(request);
                        setFailureReason(request.failure_reason ?? "");
                      }}
                    >
                      <XCircle aria-hidden="true" /> ব্যর্থ
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <Dialog open={failedRequest !== null} onOpenChange={(open) => !open && setFailedRequest(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-md">
          <DialogHeader>
            <DialogTitle>অনুরোধটি ব্যর্থ হিসেবে চিহ্নিত করবেন?</DialogTitle>
            <DialogDescription>ক্লায়েন্টকে দেখানোর জন্য সংক্ষিপ্ত কারণ লিখুন।</DialogDescription>
          </DialogHeader>
          <Textarea
            value={failureReason}
            onChange={(event) => setFailureReason(event.target.value)}
            maxLength={300}
            placeholder="যেমন: প্রদত্ত তথ্য মেলেনি"
            aria-label="ব্যর্থতার কারণ"
          />
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setFailedRequest(null)}>বাতিল</Button>
            <Button
              variant="destructive"
              disabled={!failureReason.trim() || updateStatus.isPending}
              onClick={() => {
                if (!failedRequest) return;
                updateStatus.mutate({ id: failedRequest.id, status: "failed", reason: failureReason });
              }}
            >
              {updateStatus.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
              নিশ্চিত করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;