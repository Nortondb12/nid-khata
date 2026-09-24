import type { Database } from "@/integrations/supabase/types";

// ---------------------------------------------------------------------------
// Database-backed row aliases
// ---------------------------------------------------------------------------
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type DeliveryRow = Database["public"]["Tables"]["deliveries"]["Row"];
export type LicenseKeyRow = Database["public"]["Tables"]["license_keys"]["Row"];
export type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type SupportTicketRow = Database["public"]["Tables"]["support_tickets"]["Row"];

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type DeliveryStatus = Database["public"]["Enums"]["delivery_status"];
export type ProductStatus = Database["public"]["Enums"]["product_status"];
export type LicenseKeyStatus = Database["public"]["Enums"]["license_key_status"];
export type CouponType = Database["public"]["Enums"]["coupon_type"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type SupportTicketStatus = Database["public"]["Enums"]["support_ticket_status"];

// ---------------------------------------------------------------------------
// Storefront view models
// ---------------------------------------------------------------------------
/** A product as rendered in the storefront grid. */
export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  coverImageUrl: string | null;
  productType: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  stockQuantity: number | null;
}

/** A storefront category with its live product count. */
export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  productCount: number;
}

/** A single line in the shopping cart. */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  coverImageUrl: string | null;
  productType: string;
  quantity: number;
}

/** The full cart state persisted to localStorage and synced to Supabase. */
export interface CartState {
  items: CartItem[];
  updatedAt: string;
}

/** Aggregated cart totals used by the header badge and cart summary. */
export interface CartSummary {
  itemCount: number;
  lineCount: number;
  subtotal: number;
  currency: string;
}

// ---------------------------------------------------------------------------
// Edge function contracts (mirror supabase/functions/_shared/ecommerce.ts)
// ---------------------------------------------------------------------------
export interface VerifyPaymentRequest {
  orderId: string;
  provider: string;
  providerReference: string;
  amount: number;
  currency?: string;
  idempotencyKey?: string;
  providerPayload?: Record<string, unknown>;
}

export interface VerifyPaymentResponse {
  ok: true;
  orderId: string;
  paymentId: string;
  status: "verified";
  amount: number;
  currency: string;
  idempotent: boolean;
  deliveryQueued: boolean;
}

export interface DeliverOrderRequest {
  orderId: string;
  paymentId?: string;
  idempotencyKey?: string;
}

export interface DeliveredItem {
  orderItemId: string;
  productId: string;
  quantity: number;
  productType: string;
  licenseKeys: string[];
  deliveryId: string;
  status: "delivered" | "failed";
  failureReason: string | null;
}

export interface DeliverOrderResponse {
  ok: true;
  orderId: string;
  status: "delivered";
  idempotent: boolean;
  items: DeliveredItem[];
}

/** Error envelope returned by every e-commerce edge function. */
export interface StoreApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | null;
  };
}
