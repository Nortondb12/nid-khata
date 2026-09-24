// ============================================================================
// payment-webhook — Supabase Edge Function
//
// Inbound payment-provider callback handler for the digital product storefront.
//
// Flow:
//   1. Verify the shared webhook secret and (when configured) the HMAC-SHA256
//      signature over the raw request body.
//   2. Reject duplicate deliveries using an idempotency key derived from the
//      provider reference, so a retried callback can never create a second
//      payment or a second order.
//   3. Reconcile the provider event against the stored order: the amount and
//      currency must match the order total before anything is marked paid.
//   4. Mark the payment verified, advance the order to `paid`, and hand off to
//      the delivery engine (deliver-order) which assigns license keys.
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
  requireNumber,
  requireString,
  resolveIdempotencyKey,
  storeIdempotentResponse,
  timingSafeEqual,
  verifyWebhookSignature,
  type OrderRow,
  type PaymentRow,
} from "../_shared/ecommerce.ts";

// ---------------------------------------------------------------------------
// Request / response contracts
// ---------------------------------------------------------------------------
interface PaymentWebhookRequest {
  /** Provider event identifier, used for audit and idempotency fallback. */
  eventId?: string;
  /** Provider name, e.g. "bkash", "sslcommerz", "stripe". */
  provider: string;
  /** Provider-side transaction reference. */
  providerReference: string;
  /** Order this payment belongs to. */
  orderId: string;
  /** Amount the provider actually captured. */
  amount: number;
  currency?: string;
  /** Provider event type, e.g. "payment.succeeded". */
  eventType?: string;
  /** Raw provider payload kept for audit / dispute resolution. */
  providerPayload?: Record<string, unknown>;
}

interface PaymentWebhookResponse {
  ok: true;
  orderId: string;
  paymentId: string;
  status: "verified";
  amount: number;
  currency: string;
  idempotent: boolean;
  deliveryQueued: boolean;
}

const IDEMPOTENCY_SCOPE = "payment-webhook";

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
      { ok: false, error: { code: "method_not_allowed", message: "Use POST for payment webhooks." } },
      405,
    );
  }

  try {
    const env = readEnv();

    // -----------------------------------------------------------------------
    // Authenticate the callback before parsing anything else.
    // -----------------------------------------------------------------------
    const sharedSecret = req.headers.get("x-webhook-secret") ?? req.headers.get("X-Webhook-Secret");
    if (env.webhookSecret) {
      if (!sharedSecret || !timingSafeEqual(sharedSecret.trim(), env.webhookSecret)) {
        throw new HttpError(401, "invalid_webhook_secret", "The webhook secret is missing or invalid.");
      }
    } else {
      console.warn("[payment-webhook] PAYMENT_WEBHOOK_SECRET is not set — skipping secret check.");
    }

    const rawBody = await req.text();
    if (!rawBody) {
      throw new HttpError(400, "empty_body", "Request body is required.");
    }

    const signature = req.headers.get("x-webhook-signature") ?? req.headers.get("X-Webhook-Signature");
    const signatureValid = await verifyWebhookSignature(rawBody, signature, env.paymentSignatureSecret);
    if (!signatureValid) {
      throw new HttpError(401, "invalid_signature", "The webhook signature could not be verified.");
    }

    let body: PaymentWebhookRequest;
    try {
      body = JSON.parse(rawBody) as PaymentWebhookRequest;
    } catch {
      throw new HttpError(400, "invalid_json", "Request body must be valid JSON.");
    }

    const provider = requireString(body.provider, "provider", 64).toLowerCase();
    const providerReference = requireString(body.providerReference, "providerReference", 200);
    const orderId = requireString(body.orderId, "orderId", 64);
    const amount = requireNumber(body.amount, "amount");
    const currency = (optionalString(body.currency, 8) ?? "BDT").toUpperCase();
    const eventType = optionalString(body.eventType, 64);
    const providerPayload = body.providerPayload ?? null;

    if (amount <= 0) {
      throw new HttpError(400, "invalid_field", '"amount" must be greater than zero.', { field: "amount" });
    }

    const client = createServiceClient(env);

    // -----------------------------------------------------------------------
    // Idempotency — a retried callback returns the original result instead of
    // creating a second payment or a second order.
    // -----------------------------------------------------------------------
    const idempotencyKey = resolveIdempotencyKey(null, [
      provider,
      providerReference,
      body.eventId ?? null,
    ]);

    const existing = await findIdempotentResponse(client, IDEMPOTENCY_SCOPE, idempotencyKey);
    if (existing) {
      const stored = existing.response as PaymentWebhookResponse | null;
      if (stored && stored.ok) {
        return jsonResponse({ ...stored, idempotent: true });
      }
    }

    // -----------------------------------------------------------------------
    // Reconcile the event against the stored order.
    // -----------------------------------------------------------------------
    const order: OrderRow = await fetchOrder(client, orderId);

    if (order.status === "cancelled" || order.status === "refunded") {
      throw new HttpError(409, "order_not_payable", `Order is ${order.status} and cannot be paid.`, {
        status: order.status,
      });
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
    // A provider reference already bound to a different order is a replay.
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
        console.error("[payment-webhook] deliver-order responded", deliveryResponse.status);
      }
    } catch (deliveryError) {
      console.error("[payment-webhook] deliver-order invocation failed:", deliveryError);
    }

    const response: PaymentWebhookResponse = {
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

    console.info("[payment-webhook] processed", { provider, providerReference, eventType, orderId });

    return jsonResponse(response);
  } catch (error) {
    return errorResponse(error);
  }
});

// Re-exported so the shared CORS contract stays visible to the runtime.
export { corsHeaders };
