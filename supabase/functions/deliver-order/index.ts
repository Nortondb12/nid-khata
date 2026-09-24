// ============================================================================
// deliver-order — Supabase Edge Function
//
// Digital product delivery engine for the storefront.
//
// Flow:
//   1. Authenticate the caller: either the service role (invoked by
//      verify-payment / payment-webhook) or the signed-in buyer who owns the
//      order.
//   2. Refuse to deliver an order that is not paid, and refuse to deliver the
//      same order twice (idempotency key + order status guard).
//   3. Assign available license keys to the order items, mark them `assigned`,
//      and record a delivery row per item.
//   4. Advance the order to `delivered` and return the delivered payload.
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
  fetchOrderItems,
  findIdempotentResponse,
  handleOptions,
  jsonResponse,
  optionalString,
  readEnv,
  readJsonBody,
  requireUuid,
  resolveIdempotencyKey,
  storeIdempotentResponse,
  type OrderItemRow,
  type OrderRow,
} from "../_shared/ecommerce.ts";

// ---------------------------------------------------------------------------
// Request / response contracts
// ---------------------------------------------------------------------------
interface DeliverOrderRequest {
  orderId: string;
  paymentId?: string;
  idempotencyKey?: string;
}

interface DeliveredItem {
  orderItemId: string;
  productId: string;
  quantity: number;
  productType: string;
  licenseKeys: string[];
  deliveryId: string;
  status: "delivered" | "failed";
  failureReason: string | null;
}

interface DeliverOrderResponse {
  ok: true;
  orderId: string;
  status: "delivered";
  idempotent: boolean;
  items: DeliveredItem[];
}

const IDEMPOTENCY_SCOPE = "deliver-order";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
/**
 * Resolves the caller identity. The service role key is accepted because this
 * function is invoked server-to-server by the payment functions; otherwise a
 * valid buyer JWT is required and the order must belong to that buyer.
 */
async function resolveCaller(
  req: Request,
  env: ReturnType<typeof readEnv>,
): Promise<{ userId: string | null; isServiceRole: boolean }> {
  const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
  const apikey = req.headers.get("apikey") ?? req.headers.get("x-api-key");

  if (apikey && apikey === env.serviceRoleKey) {
    return { userId: null, isServiceRole: true };
  }

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    throw new HttpError(401, "unauthenticated", "A valid bearer token is required.");
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new HttpError(401, "unauthenticated", "A valid bearer token is required.");
  }

  if (token === env.serviceRoleKey) {
    return { userId: null, isServiceRole: true };
  }

  const client = createServiceClient(env);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    throw new HttpError(401, "unauthenticated", "The supplied session is invalid or expired.");
  }
  return { userId: data.user.id, isServiceRole: false };
}

// ---------------------------------------------------------------------------
// License key assignment
// ---------------------------------------------------------------------------
interface LicenseKeyRow {
  id: string;
  license_key: string;
}

/**
 * Atomically claims `quantity` available license keys for a product. The
 * `status = 'available'` filter plus the row-level update means two concurrent
 * deliveries can never receive the same key.
 */
async function claimLicenseKeys(
  client: ReturnType<typeof createServiceClient>,
  productId: string,
  quantity: number,
  orderId: string,
  orderItemId: string,
  userId: string | null,
): Promise<LicenseKeyRow[]> {
  const { data: candidates, error: selectError } = await client
    .from("license_keys")
    .select("id, license_key")
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
    .select("id, license_key");

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
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request): Promise<Response> => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse(
      { ok: false, error: { code: "method_not_allowed", message: "Use POST to deliver an order." } },
      405,
    );
  }

  try {
    const env = readEnv();
    const body = await readJsonBody<DeliverOrderRequest>(req);

    const orderId = requireUuid(body.orderId, "orderId");
    const paymentId = optionalString(body.paymentId, 64);

    const caller = await resolveCaller(req, env);
    const client = createServiceClient(env);

    // -----------------------------------------------------------------------
    // Idempotency — a retried delivery returns the original result instead of
    // assigning a second set of license keys.
    // -----------------------------------------------------------------------
    const idempotencyKey = resolveIdempotencyKey(body.idempotencyKey ?? null, [orderId, paymentId]);

    const existing = await findIdempotentResponse(client, IDEMPOTENCY_SCOPE, idempotencyKey);
    if (existing) {
      const stored = existing.response as DeliverOrderResponse | null;
      if (stored && stored.ok) {
        return jsonResponse({ ...stored, idempotent: true });
      }
    }

    // -----------------------------------------------------------------------
    // Ownership + state checks
    // -----------------------------------------------------------------------
    const order: OrderRow = await fetchOrder(client, orderId);

    if (!caller.isServiceRole) {
      if (!order.user_id || order.user_id !== caller.userId) {
        throw new HttpError(403, "forbidden", "This order does not belong to the signed-in user.");
      }
    }

    if (order.status === "cancelled" || order.status === "refunded") {
      throw new HttpError(409, "order_not_deliverable", `Order is ${order.status} and cannot be delivered.`, {
        status: order.status,
      });
    }

    if (order.status === "delivered") {
      // Already delivered — return the recorded deliveries rather than
      // assigning a second set of keys.
      const { data: existingDeliveries, error: deliveryLookupError } = await client
        .from("deliveries")
        .select("id, order_item_id, product_id, status, failure_reason")
        .eq("order_id", orderId);

      if (deliveryLookupError) {
        throw new HttpError(500, "delivery_lookup_failed", deliveryLookupError.message);
      }

      const items: DeliveredItem[] = (existingDeliveries ?? []).map((row) => ({
        orderItemId: (row.order_item_id as string) ?? "",
        productId: (row.product_id as string) ?? "",
        quantity: 0,
        productType: "license_key",
        licenseKeys: [],
        deliveryId: row.id as string,
        status: (row.status as "delivered" | "failed") ?? "delivered",
        failureReason: (row.failure_reason as string | null) ?? null,
      }));

      const response: DeliverOrderResponse = {
        ok: true,
        orderId,
        status: "delivered",
        idempotent: true,
        items,
      };
      await storeIdempotentResponse(client, IDEMPOTENCY_SCOPE, idempotencyKey, response);
      return jsonResponse(response);
    }

    if (order.status !== "paid" && order.status !== "processing") {
      throw new HttpError(
        409,
        "order_not_paid",
        "Only a paid order can be delivered. Verify the payment first.",
        { status: order.status },
      );
    }

    // -----------------------------------------------------------------------
    // Deliver each order item
    // -----------------------------------------------------------------------
    const orderItems: OrderItemRow[] = await fetchOrderItems(client, orderId);
    if (orderItems.length === 0) {
      throw new HttpError(409, "empty_order", "This order has no items to deliver.");
    }

    const deliveredItems: DeliveredItem[] = [];

    for (const item of orderItems) {
      const quantity = Math.max(1, Number(item.quantity) || 1);

      // A delivery row already recorded for this item means it was delivered
      // in a previous partial run — skip it instead of double-assigning.
      const { data: priorDelivery, error: priorError } = await client
        .from("deliveries")
        .select("id, status")
        .eq("order_id", orderId)
        .eq("order_item_id", item.id)
        .maybeSingle();

      if (priorError) {
        throw new HttpError(500, "delivery_lookup_failed", priorError.message);
      }

      if (priorDelivery && priorDelivery.status === "delivered") {
        const { data: assignedKeys } = await client
          .from("license_keys")
          .select("license_key")
          .eq("order_item_id", item.id);

        deliveredItems.push({
          orderItemId: item.id,
          productId: item.product_id,
          quantity,
          productType: item.product_type,
          licenseKeys: (assignedKeys ?? []).map((row) => row.license_key as string),
          deliveryId: priorDelivery.id as string,
          status: "delivered",
          failureReason: null,
        });
        continue;
      }

      try {
        const assignedKeys = await claimLicenseKeys(
          client,
          item.product_id,
          quantity,
          orderId,
          item.id,
          order.user_id,
        );

        const deliveryPayload = {
          order_id: orderId,
          order_item_id: item.id,
          product_id: item.product_id,
          user_id: order.user_id,
          status: "delivered" as const,
          delivered_at: new Date().toISOString(),
          failure_reason: null,
          payload: {
            licenseKeys: assignedKeys.map((row) => row.license_key),
            productType: item.product_type,
          } as never,
        };

        let deliveryId: string;
        if (priorDelivery) {
          const { data: updatedDelivery, error: updateDeliveryError } = await client
            .from("deliveries")
            .update(deliveryPayload)
            .eq("id", priorDelivery.id)
            .select("id")
            .single();

          if (updateDeliveryError || !updatedDelivery) {
            throw new HttpError(
              500,
              "delivery_update_failed",
              updateDeliveryError?.message ?? "Delivery update failed.",
            );
          }
          deliveryId = updatedDelivery.id as string;
        } else {
          const { data: insertedDelivery, error: insertDeliveryError } = await client
            .from("deliveries")
            .insert(deliveryPayload)
            .select("id")
            .single();

          if (insertDeliveryError || !insertedDelivery) {
            throw new HttpError(
              500,
              "delivery_insert_failed",
              insertDeliveryError?.message ?? "Delivery insert failed.",
            );
          }
          deliveryId = insertedDelivery.id as string;
        }

        deliveredItems.push({
          orderItemId: item.id,
          productId: item.product_id,
          quantity,
          productType: item.product_type,
          licenseKeys: assignedKeys.map((row) => row.license_key),
          deliveryId,
          status: "delivered",
          failureReason: null,
        });
      } catch (itemError) {
        // Record the failure so the order can be retried without losing the
        // items that already delivered successfully.
        const failureReason =
          itemError instanceof HttpError ? itemError.message : "Unexpected delivery failure.";

        const failurePayload = {
          order_id: orderId,
          order_item_id: item.id,
          product_id: item.product_id,
          user_id: order.user_id,
          status: "failed" as const,
          delivered_at: null,
          failure_reason: failureReason,
          payload: { productType: item.product_type } as never,
        };

        if (priorDelivery) {
          await client.from("deliveries").update(failurePayload).eq("id", priorDelivery.id);
        } else {
          await client.from("deliveries").insert(failurePayload);
        }

        deliveredItems.push({
          orderItemId: item.id,
          productId: item.product_id,
          quantity,
          productType: item.product_type,
          licenseKeys: [],
          deliveryId: priorDelivery?.id as string ?? "",
          status: "failed",
          failureReason,
        });
      }
    }

    // -----------------------------------------------------------------------
    // Advance the order to `delivered` only when every item succeeded.
    // -----------------------------------------------------------------------
    const allDelivered = deliveredItems.every((item) => item.status === "delivered");

    if (allDelivered) {
      const { error: orderUpdateError } = await client
        .from("orders")
        .update({ status: "delivered", delivered_at: new Date().toISOString() })
        .eq("id", orderId)
        .in("status", ["paid", "processing", "delivered"]);

      if (orderUpdateError) {
        throw new HttpError(500, "order_update_failed", orderUpdateError.message);
      }
    }

    const response: DeliverOrderResponse = {
      ok: true,
      orderId,
      status: "delivered",
      idempotent: false,
      items: deliveredItems,
    };

    await storeIdempotentResponse(client, IDEMPOTENCY_SCOPE, idempotencyKey, response);

    return jsonResponse(response);
  } catch (error) {
    return errorResponse(error);
  }
});

// Re-exported so the shared CORS contract stays visible to the runtime.
export { corsHeaders };
