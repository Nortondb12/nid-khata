// ============================================================================
// Shared e-commerce helpers for Supabase Edge Functions
//
// Used by verify-payment, payment-webhook and deliver-order so that the
// payment verification, idempotency and delivery contracts stay identical
// across every function. Runs on Deno (Supabase Edge Runtime).
// ============================================================================

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------
export interface EcommerceEnv {
  supabaseUrl: string;
  serviceRoleKey: string;
  /** Shared secret used to authenticate inbound payment webhooks. */
  webhookSecret: string;
  /** Optional HMAC secret for signature verification of provider callbacks. */
  paymentSignatureSecret: string;
}

export function readEnv(): EcommerceEnv {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const webhookSecret = Deno.env.get("PAYMENT_WEBHOOK_SECRET") ?? "";
  const paymentSignatureSecret = Deno.env.get("PAYMENT_SIGNATURE_SECRET") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new HttpError(
      500,
      "server_misconfigured",
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured for the payment functions.",
    );
  }

  return { supabaseUrl, serviceRoleKey, webhookSecret, paymentSignatureSecret };
}

/**
 * Service-role client. Every write to orders / payments / deliveries /
 * license_keys happens through this client so that RLS never has to be
 * loosened for the browser.
 */
export function createServiceClient(env: EcommerceEnv): SupabaseClient {
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "nid-khata-ecommerce" } },
  });
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-secret, x-idempotency-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return jsonResponse(
      { ok: false, error: { code: error.code, message: error.message, details: error.details ?? null } },
      error.status,
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  console.error("[ecommerce] unhandled error:", error);
  return jsonResponse({ ok: false, error: { code: "internal_error", message } }, 500);
}

export function handleOptions(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return null;
}

export async function readJsonBody<T>(req: Request): Promise<T> {
  try {
    const raw = await req.text();
    if (!raw) throw new HttpError(400, "empty_body", "Request body is required.");
    return JSON.parse(raw) as T;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "invalid_json", "Request body must be valid JSON.");
  }
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
export function requireString(value: unknown, field: string, maxLength = 512): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, "invalid_field", `"${field}" is required.`, { field });
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new HttpError(400, "invalid_field", `"${field}" is too long.`, { field, maxLength });
  }
  return trimmed;
}

export function optionalString(value: unknown, maxLength = 512): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export function requireNumber(value: unknown, field: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new HttpError(400, "invalid_field", `"${field}" must be a number.`, { field });
  }
  return parsed;
}

export function requireUuid(value: unknown, field: string): string {
  const candidate = requireString(value, field, 64);
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(candidate)) {
    throw new HttpError(400, "invalid_field", `"${field}" must be a valid UUID.`, { field });
  }
  return candidate;
}

// ---------------------------------------------------------------------------
// Idempotency
// ---------------------------------------------------------------------------
/**
 * Normalises an idempotency key so the same logical request always maps to the
 * same stored value. Falls back to a deterministic key derived from the order
 * and provider reference when the caller did not send one.
 */
export function resolveIdempotencyKey(
  provided: string | null,
  fallbackParts: Array<string | number | null | undefined>,
): string {
  if (provided && provided.trim().length > 0) {
    return provided.trim().slice(0, 200);
  }
  const seed = fallbackParts
    .filter((part) => part !== null && part !== undefined && `${part}`.length > 0)
    .join(":");
  return `auto:${seed}`.slice(0, 200);
}

export interface IdempotencyRecord {
  key: string;
  scope: string;
  response: unknown;
}

/**
 * Returns the previously stored response for this key/scope pair, or null when
 * the request has not been processed yet. This is what stops a retried webhook
 * or a double-clicked checkout from creating a second order.
 */
export async function findIdempotentResponse(
  client: SupabaseClient,
  scope: string,
  key: string,
): Promise<IdempotencyRecord | null> {
  const { data, error } = await client
    .from("idempotency_keys")
    .select("key, scope, response")
    .eq("scope", scope)
    .eq("key", key)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, "idempotency_lookup_failed", error.message);
  }
  if (!data) return null;

  return { key: data.key as string, scope: data.scope as string, response: data.response };
}

/**
 * Stores the response for a key/scope pair. A concurrent duplicate insert is
 * treated as success because the first writer already owns the record.
 */
export async function storeIdempotentResponse(
  client: SupabaseClient,
  scope: string,
  key: string,
  response: unknown,
): Promise<void> {
  const { error } = await client
    .from("idempotency_keys")
    .insert({ scope, key, response: response as never });

  if (error && error.code !== "23505") {
    throw new HttpError(500, "idempotency_store_failed", error.message);
  }
}

// ---------------------------------------------------------------------------
// Payment signature verification
// ---------------------------------------------------------------------------
/**
 * Verifies an HMAC-SHA256 signature sent by the payment provider. When no
 * signature secret is configured the check is skipped so local development
 * still works, but the caller is warned in the logs.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): Promise<boolean> {
  if (!secret) {
    console.warn("[ecommerce] PAYMENT_SIGNATURE_SECRET is not set — skipping signature check.");
    return true;
  }
  if (!signature) return false;

  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(rawBody));
  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(expected, signature.trim().toLowerCase());
}

/** Constant-time string comparison to avoid leaking signature bytes. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// ---------------------------------------------------------------------------
// Order / payment domain helpers
// ---------------------------------------------------------------------------
export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "delivered"
  | "failed"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "initiated" | "pending" | "verified" | "failed" | "refunded";

export interface OrderRow {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  coupon_code: string | null;
  created_at: string;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  provider: string;
  provider_reference: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotency_key: string | null;
  verified_at: string | null;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_type: string;
}

export async function fetchOrder(client: SupabaseClient, orderId: string): Promise<OrderRow> {
  const { data, error } = await client
    .from("orders")
    .select("id, user_id, status, total_amount, currency, coupon_code, created_at")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new HttpError(500, "order_lookup_failed", error.message);
  if (!data) throw new HttpError(404, "order_not_found", `No order found for id ${orderId}.`);
  return data as OrderRow;
}

export async function fetchOrderItems(client: SupabaseClient, orderId: string): Promise<OrderItemRow[]> {
  const { data, error } = await client
    .from("order_items")
    .select("id, order_id, product_id, quantity, unit_price, total_price, product_type")
    .eq("order_id", orderId);

  if (error) throw new HttpError(500, "order_items_lookup_failed", error.message);
  return (data ?? []) as OrderItemRow[];
}

export async function fetchPaymentByReference(
  client: SupabaseClient,
  provider: string,
  providerReference: string,
): Promise<PaymentRow | null> {
  const { data, error } = await client
    .from("payments")
    .select(
      "id, order_id, provider, provider_reference, amount, currency, status, idempotency_key, verified_at",
    )
    .eq("provider", provider)
    .eq("provider_reference", providerReference)
    .maybeSingle();

  if (error) throw new HttpError(500, "payment_lookup_failed", error.message);
  if (!data) return null;
  return data as PaymentRow;
}

// ---------------------------------------------------------------------------
// Delivery helpers
// ---------------------------------------------------------------------------
export interface DeliveryRow {
  id: string;
  order_id: string;
  order_item_id: string | null;
  product_id: string;
  user_id: string | null;
  status: "pending" | "delivered" | "failed";
  failure_reason: string | null;
  delivered_at: string | null;
}

export interface LicenseKeyRow {
  id: string;
  product_id: string;
  license_key: string;
  status: "available" | "reserved" | "assigned" | "revoked";
  order_id: string | null;
  order_item_id: string | null;
  assigned_user_id: string | null;
  assigned_at: string | null;
}

export async function fetchDeliveries(
  client: SupabaseClient,
  orderId: string,
): Promise<DeliveryRow[]> {
  const { data, error } = await client
    .from("deliveries")
    .select("id, order_id, order_item_id, product_id, user_id, status, failure_reason, delivered_at")
    .eq("order_id", orderId);

  if (error) throw new HttpError(500, "delivery_lookup_failed", error.message);
  return (data ?? []) as DeliveryRow[];
}

/**
 * Atomically claims `quantity` available license keys for a product. The
 * `status = 'available'` filter plus the row-level update means two concurrent
 * deliveries can never receive the same key.
 */
export async function claimLicenseKeys(
  client: SupabaseClient,
  productId: string,
  quantity: number,
  orderId: string,
  orderItemId: string,
  userId: string | null,
): Promise<LicenseKeyRow[]> {
  const { data: candidates, error: selectError } = await client
    .from("license_keys")
    .select("id, product_id, license_key, status, order_id, order_item_id, assigned_user_id, assigned_at")
    .eq("product_id", productId)
    .eq("status", "available")
    .order("created_at", { ascending: true })
    .limit(quantity);

  if (selectError) {
    throw new HttpError(500, "license_key_lookup_failed", selectError.message);
  }

  const rows = (candidates ?? []) as LicenseKeyRow[];
  if (rows.length < quantity) {
    throw new HttpError(
      409,
      "insufficient_license_keys",
      `Only ${rows.length} license key(s) available for product ${productId}, ${quantity} required.`,
      { productId, required: quantity, available: rows.length },
    );
  }

  const ids = rows.map((row) => row.id);
  const { data: updated, error: updateError } = await client
    .from("license_keys")
    .update({
      status: "assigned",
      order_id: orderId,
      order_item_id: orderItemId,
      assigned_user_id: userId,
      assigned_at: new Date().toISOString(),
    })
    .in("id", ids)
    .eq("status", "available")
    .select("id, product_id, license_key, status, order_id, order_item_id, assigned_user_id, assigned_at");

  if (updateError) {
    throw new HttpError(500, "license_key_assign_failed", updateError.message);
  }

  const assigned = (updated ?? []) as LicenseKeyRow[];
  if (assigned.length < quantity) {
    throw new HttpError(
      409,
      "license_key_race",
      "License keys were claimed by another delivery while this one was running.",
      { productId, required: quantity, assigned: assigned.length },
    );
  }

  return assigned;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export type NotificationType = "order" | "payment" | "delivery" | "system" | "support";

export interface NotificationInput {
  userId: string;
  title: string;
  body?: string | null;
  type?: NotificationType;
  metadata?: Record<string, unknown>;
}

/**
 * Records an in-app notification for a user. Notification failures are logged
 * but never fail the surrounding commerce operation.
 */
export async function createNotification(
  client: SupabaseClient,
  input: NotificationInput,
): Promise<void> {
  const { error } = await client.from("notifications").insert({
    user_id: input.userId,
    title: input.title,
    body: input.body ?? null,
    type: input.type ?? "system",
    metadata: (input.metadata ?? {}) as never,
  });

  if (error) {
    console.error("[ecommerce] notification insert failed:", error.message);
  }
}
