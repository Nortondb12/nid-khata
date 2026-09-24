// ============================================================================
// verify-payment — Supabase Edge Function
//
// Server-side payment verification for the digital product storefront.
//
// Flow:
//   1. Authenticate the caller (JWT) and confirm they own the order.
//   2. Validate the submitted provider reference / amount against the order.
//   3. Reject duplicate submissions using an idempotency key so a retried
//      request or a double-clicked checkout can never create a second order
//      or a second payment row.
//   4. Mark the payment verified, advance the order to `paid`, and hand off
//      to the delivery engine (deliver-order) which assigns license keys.
//
// All writes use the service-role client; RLS is never loosened for the
// browser. Runs on Deno (Supabase Edge Runtime).
// ============================================================================

import {
  HttpError,
  corsHeaders,
  createServiceClient,
  errorResponse,
  fetchOrder,
  fetchPaymentByReference,
  findIdempotentResponse,
  handleOptions,
  jsonResponse,
  optionalString,
  readEnv,
  readJsonBody,
  requireNumber,
  requireString,
  requireUuid,
  resolveIdempotencyKey,
  storeIdempotentResponse,
  type OrderRow,
  type PaymentRow,
} from "../_shared/ecommerce.ts";

// ---------------------------------------------------------------------------
// Request / response contracts
// ---------------------------------------------------------------------------
interface VerifyPaymentRequest {
  orderId: string;
  provider: string;
  providerReference: string;
  amount: number;
  currency?: string;
  idempotencyKey?: string;
  /** Optional raw provider payload kept for audit / dispute resolution. */
  providerPayload?: Record<string, unknown>;
}

interface VerifyPaymentResponse {
  ok: true;
  orderId: string;
  paymentId: string;
  status: "verified";
  amount: number;
  currency: string;
  idempotent: boolean;
  deliveryQueued: boolean;
}

const IDEMPOTENCY_SCOPE = "verify-payment";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
/**
 * Resolves the authenticated user id from the caller's JWT. The order must
 * belong to this user, otherwise the request is rejected with 403.
 */
async function requireAuthenticatedUserId(
  req: Request,
  env: ReturnType<typeof readEnv>,
): Promise<string> {
  const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    throw new HttpError(401, "unauthenticated", "A valid bearer token is required.");
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new HttpError(401, "unauthenticated", "A valid bearer token is required.");
  }

  const client = createServiceClient(env);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    throw new HttpError(401, "unauthenticated", "The supplied session is invalid or expired.");
  }
  return data.user.id;
}

// ---------------------------------------------------------------------------
// Amount comparison
// ---------------------------------------------------------------------------
/** Compares money values with a 1-paisa tolerance to absorb float rounding. */
function amountsMatch(expected: number, received: number): boolean {
  return Math.abs(expected - received) < 0.01;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request): Promise<Response> => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse(
      { ok: false, error: { code: "method_not_allowed", message: "Use POST for payment verification." } },
      405,
    );
  }

  try {
    const env = readEnv();
    const body = await readJsonBody<VerifyPaymentRequest>(req);

    const orderId = requireUuid(body.orderId, "orderId");
    const provider = requireString(body.provider, "provider", 64).toLowerCase();
    const providerReference = requireString(body.providerReference, "providerReference", 200);
    const amount = requireNumber(body.amount, "amount");
    const currency = (optionalString(body.currency, 8) ?? "BDT").toUpperCase();
    const providerPayload = body.providerPayload ?? null;

    if (amount <= 0) {
      throw new HttpError(400, "invalid_field", '"amount" must be greater than zero.', { field: "amount" });
    }

    const userId = await requireAuthenticatedUserId(req, env);
    const client = createServiceClient(env);

    // -----------------------------------------------------------------------
    // Idempotency — a retried verification returns the original result.
    // -----------------------------------------------------------------------
    const idempotencyKey = resolveIdempotencyKey(body.idempotencyKey ?? null, [
      orderId,
      provider,
      providerReference,
    ]);

    const existing = await findIdempotentResponse(client, IDEMPOTENCY_SCOPE, idempotencyKey);
    if (existing) {
      const stored = existing.response as VerifyPaymentResponse | null;
      if (stored && stored.ok) {
        return jsonResponse({ ...stored, idempotent: true });
      }
    }

    // -----------------------------------------------------------------------
    // Ownership + state checks
    // -----------------------------------------------------------------------
    const order: OrderRow = await fetchOrder(client, orderId);

    if (order.user_id && order.user_id !== userId) {
      throw new HttpError(403, "forbidden", "This order does not belong to the signed-in user.");
    }

    if (order.status === "cancelled" || order.status === "refunded") {
      throw new HttpError(409, "order_not_payable", `Order is ${order.status} and cannot be paid.`, {
        status: order.status,
      });
    }

    if (order.status === "delivered") {
      throw new HttpError(409, "order_already_delivered", "This order has already been delivered.");
    }

    if (order.currency && order.currency.toUpperCase() !== currency) {
      throw new HttpError(400, "currency_mismatch", "Payment currency does not match the order currency.", {
        expected: order.currency,
        received: currency,
      });
    }

    if (!amountsMatch(Number(order.total_amount), amount)) {
      throw new HttpError(400, "amount_mismatch", "Payment amount does not match the order total.", {
        expected: Number(order.total_amount),
        received: amount,
      });
    }

    // -----------------------------------------------------------------------
    // Provider reference must be unique — a reference already bound to a
    // different order is a replay attempt.
    // -----------------------------------------------------------------------
    const existingPayment: PaymentRow | null = await fetchPaymentByReference(
      client,
      provider,
      providerReference,
    );

    if (existingPayment && existingPayment.order_id !== orderId) {
      throw new HttpError(409, "reference_reused", "This provider reference is already used by another order.", {
        providerReference,
      });
    }

    // -----------------------------------------------------------------------
    // Upsert the payment row
    // -----------------------------------------------------------------------
    let paymentId: string;

    if (existingPayment) {
      if (existingPayment.status === "verified") {
        paymentId = existingPayment.id;
      } else {
        const { data: updated, error: updateError } = await client
          .from("payments")
          .update({
            status: "verified",
            amount,
            currency,
            idempotency_key: idempotencyKey,
            verified_at: new Date().toISOString(),
            provider_payload: providerPayload as never,
          })
          .eq("id", existingPayment.id)
          .select("id")
          .single();

        if (updateError || !updated) {
          throw new HttpError(500, "payment_update_failed", updateError?.message ?? "Payment update failed.");
        }
        paymentId = updated.id as string;
      }
    } else {
      const { data: inserted, error: insertError } = await client
        .from("payments")
        .insert({
          order_id: orderId,
          provider,
          provider_reference: providerReference,
          amount,
          currency,
          status: "verified",
          idempotency_key: idempotencyKey,
          verified_at: new Date().toISOString(),
          provider_payload: providerPayload as never,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        // A concurrent duplicate insert is treated as a replay, not a failure.
        if (insertError?.code === "23505") {
          const replay = await fetchPaymentByReference(client, provider, providerReference);
          if (replay && replay.order_id === orderId) {
            paymentId = replay.id;
          } else {
            throw new HttpError(409, "duplicate_payment", "A payment for this reference already exists.");
          }
        } else {
          throw new HttpError(500, "payment_insert_failed", insertError?.message ?? "Payment insert failed.");
        }
      } else {
        paymentId = inserted.id as string;
      }
    }

    // -----------------------------------------------------------------------
    // Advance the order to `paid`
    // -----------------------------------------------------------------------
    const { error: orderUpdateError } = await client
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", orderId)
      .in("status", ["pending", "awaiting_payment", "paid"]);

    if (orderUpdateError) {
      throw new HttpError(500, "order_update_failed", orderUpdateError.message);
    }

    // -----------------------------------------------------------------------
    // Hand off to the delivery engine. A delivery failure must not roll back
    // the verified payment — the order stays `paid` and can be retried.
    // -----------------------------------------------------------------------
    let deliveryQueued = false;
    try {
      const deliveryResponse = await fetch(`${env.supabaseUrl}/functions/v1/deliver-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.serviceRoleKey}`,
          apikey: env.serviceRoleKey,
        },
        body: JSON.stringify({ orderId, paymentId, idempotencyKey }),
      });
      deliveryQueued = deliveryResponse.ok;
      if (!deliveryResponse.ok) {
        console.error("[verify-payment] deliver-order responded", deliveryResponse.status);
      }
    } catch (deliveryError) {
      console.error("[verify-payment] deliver-order invocation failed:", deliveryError);
    }

    const response: VerifyPaymentResponse = {
      ok: true,
      orderId,
      paymentId,
      status: "verified",
      amount,
      currency,
      idempotent: false,
      deliveryQueued,
    };

    await storeIdempotentResponse(client, IDEMPOTENCY_SCOPE, idempotencyKey, response);

    return jsonResponse(response);
  } catch (error) {
    return errorResponse(error);
  }
});

// Re-exported so the shared CORS contract stays visible to the runtime.
export { corsHeaders };
