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
      const { data: requestData, error: requestError } = await supabase
        .from("nid_requests")
        .select("id, user_id")
        .eq("id", id)
        .maybeSingle();

      if (requestError) throw new Error("অনুরোধটি খুঁজে পাওয়া যায়নি।");

      if (status === "success" && requestData?.user_id) {
        // Grant the requester the 'user' role so they get their own account
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: requestData.user_id, role: "user" });

        if (roleError) {
          // If duplicate key, role already exists - this is fine
          if (!roleError.message.includes("duplicate")) throw roleError;
        }
      }

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
      <main className="min-h-screen bg-background px-4 flex items-center justify-center">
        <section className="max-w-md text-center">
          <CircleAlert className="mx-auto h-10 w-10 text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">অ্যাক্সেস অনুমোদিত নয়</h1>
          <p className="mt-2 text-muted-foreground">এই পেজটি শুধু অনুমোদিত অ্যাডমিনদের জন্য।</p>
          <Button asChild className="mt-6"><Link to="/">হোম পেজে ফিরুন</Link></Button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
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
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/auth", { replace: true });
            }}
          >
            <LogOut aria-hidden="true" /> লগআউট
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">অনুরোধ ব্যবস্থাপনা</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">ভেরিফিকেশন অনুরোধ</h1>
            <p className="mt-1 text-sm text-muted-foreground">অনুরোধ পর্যালোচনা করে অনুমোদন বা ব্যর্থ হিসেবে চিহ্নিত করুন।</p>
          </div>
          <Button variant="outline" onClick={() => requestsQuery.refetch()} disabled={requestsQuery.isFetching}>
            <RefreshCw className={requestsQuery.isFetching ? "animate-spin" : ""} aria-hidden="true" />
            রিফ্রেশ
          </Button>
        </div>

        <div className="mt-7 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="স্ট্যাটাস দিয়ে ফিল্টার করুন">
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

        <section className="mt-4 space-y-3" aria-live="polite">
          {requestsQuery.isLoading && (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> অনুরোধ লোড হচ্ছে...
            </div>
          )}
          {requestsQuery.error && (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              অনুরোধগুলো আনা যায়নি। আবার চেষ্টা করুন।
            </p>
          )}
          {!requestsQuery.isLoading && !requestsQuery.error && visibleRequests.length === 0 && (
            <div className="rounded-md border border-dashed border-border py-14 text-center">
              <Inbox className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-sm text-muted-foreground">এই স্ট্যাটাসে কোনো অনুরোধ নেই।</p>
            </div>
          )}

          {visibleRequests.map((request) => {
            const normalizedStatus: RequestStatus = ["success", "failed"].includes(request.status)
              ? (request.status as RequestStatus)
              : "pending";
            const meta = statusMeta[normalizedStatus];
            return (
              <article key={request.id} className="rounded-md border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-foreground tabular-nums">NID: {request.nid_masked}</h2>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
                    </div>
                    <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                      <div><dt className="text-xs text-muted-foreground">জন্ম সাল</dt><dd className="font-medium text-foreground">{request.dob_year ?? "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">ক্লায়েন্ট ইমেইল</dt><dd className="break-all font-medium text-foreground">{request.email ?? "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">জমা হয়েছে</dt><dd className="font-medium text-foreground">{formatDate(request.created_at)}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">সর্বশেষ আপডেট</dt><dd className="font-medium text-foreground">{formatDate(request.updated_at)}</dd></div>
                    </dl>
                    {request.failure_reason && <p className="mt-3 text-sm text-destructive">ব্যর্থতার কারণ: {request.failure_reason}</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={updateStatus.isPending || normalizedStatus === "success"}
                      onClick={() => updateStatus.mutate({ id: request.id, status: "success" })}
                    >
                      <CheckCircle2 aria-hidden="true" /> অনুমোদন
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
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
        <DialogContent className="max-w-md">
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
          <DialogFooter>
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