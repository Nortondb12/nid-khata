import { createClient } from "npm:@supabase/supabase-js@2";

export type AuditAction = "lookup" | "download";
export type AuditOutcome = "success" | "failure";

export interface AuditEvent {
  action: AuditAction;
  outcome: AuditOutcome;
  /** Raw NID — never stored; only the last 4 digits are persisted. */
  nid_number: string;
  date_of_birth?: string;
  format?: "pdf" | "png";
  checksum?: string;
  failure_reason?: string;
}

export const maskNidForAudit = (nid: string) => {
  const digits = nid.replace(/\D/g, "");
  return digits.length <= 4 ? "****" : `****${digits.slice(-4)}`;
};

const sha256Hex = async (input: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const clientIp = (req: Request) =>
  (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
  req.headers.get("cf-connecting-ip") ||
  "unknown";

/** Best-effort audit write. Never throws — logging must not break the request. */
export async function recordAuditEvent(req: Request, event: AuditEvent): Promise<void> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    // Identify the caller when a valid session token is present (optional).
    let actorUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      actorUserId = data.user?.id ?? null;
    }

    const salt = Deno.env.get("SUPABASE_JWKS") ?? "nid-audit";
    const ipHash = (await sha256Hex(`${clientIp(req)}|${salt}`)).slice(0, 32);

    await supabase.from("nid_audit_log").insert({
      action: event.action,
      outcome: event.outcome,
      nid_masked: maskNidForAudit(event.nid_number),
      dob_year: event.date_of_birth ? event.date_of_birth.slice(0, 4) : null,
      format: event.format ?? null,
      checksum: event.checksum ?? null,
      failure_reason: event.failure_reason?.slice(0, 200) ?? null,
      actor_user_id: actorUserId,
      ip_hash: ipHash,
      user_agent: (req.headers.get("user-agent") ?? "").slice(0, 200),
    });
  } catch (err) {
    console.error("audit log write failed", err instanceof Error ? err.message : err);
  }
}
