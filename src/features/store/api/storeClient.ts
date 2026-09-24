import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  CategoryRow,
  ProductRow,
  StoreCategory,
  StoreProduct,
  StoreApiError,
} from "@/features/store/types";

// ---------------------------------------------------------------------------
// Storefront data client
//
// Thin, typed wrapper around the Supabase client for the public storefront
// reads (categories + products) and the two server-side commerce functions
// (verify-payment, deliver-order). Every function returns plain view models so
// the UI never has to know about the raw database shape.
// ---------------------------------------------------------------------------

type ProductSelectRow = ProductRow & {
  categories: Pick<CategoryRow, "id" | "name" | "slug"> | null;
};

const PRODUCT_COLUMNS =
  "id, slug, name, category_id, short_description, price, compare_at_price, currency, cover_image_url, product_type, rating, review_count, sales_count, is_featured, is_popular, is_new, stock_quantity, categories ( id, name, slug )";

/** Error thrown by every storefront data call so callers can render a message. */
export class StoreClientError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown> | null;

  constructor(code: string, message: string, details?: Record<string, unknown> | null) {
    super(message);
    this.name = "StoreClientError";
    this.code = code;
    this.details = details ?? null;
  }
}

function toStoreClientError(error: unknown, fallbackCode: string): StoreClientError {
  if (error instanceof StoreClientError) return error;

  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    const code = "code" in error ? String((error as { code: unknown }).code) : fallbackCode;
    return new StoreClientError(code, message);
  }

  return new StoreClientError(fallbackCode, "অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন।");
}

function mapProduct(row: ProductSelectRow): StoreProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? null,
    shortDescription: row.short_description,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
    currency: row.currency,
    coverImageUrl: row.cover_image_url,
    productType: row.product_type,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    salesCount: row.sales_count,
    isFeatured: row.is_featured,
    isPopular: row.is_popular,
    isNew: row.is_new,
    stockQuantity: row.stock_quantity,
  };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export async function fetchCategories(): Promise<StoreCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, icon, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw toStoreClientError(error, "categories_fetch_failed");

  const rows = (data ?? []) as Pick<
    CategoryRow,
    "id" | "name" | "slug" | "description" | "icon" | "sort_order"
  >[];

  if (rows.length === 0) return [];

  const { data: productRows, error: productError } = await supabase
    .from("products")
    .select("category_id")
    .eq("status", "active")
    .not("category_id", "is", null);

  if (productError) throw toStoreClientError(productError, "categories_count_failed");

  const counts = new Map<string, number>();
  for (const row of (productRows ?? []) as { category_id: string | null }[]) {
    if (!row.category_id) continue;
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    productCount: counts.get(row.id) ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export interface ProductQuery {
  categorySlug?: string;
  search?: string;
  limit?: number;
}

export async function fetchProducts(query: ProductQuery = {}): Promise<StoreProduct[]> {
  const limit = Math.min(Math.max(query.limit ?? 24, 1), 100);

  let builder = supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (query.categorySlug) {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", query.categorySlug)
      .maybeSingle();

    if (categoryError) throw toStoreClientError(categoryError, "category_lookup_failed");
    if (!category) return [];

    builder = builder.eq("category_id", category.id);
  }

  const search = query.search?.trim();
  if (search) {
    const escaped = search.replace(/[%,()]/g, " ").trim();
    if (escaped) {
      builder = builder.or(
        `name.ilike.%${escaped}%,short_description.ilike.%${escaped}%,description.ilike.%${escaped}%`,
      );
    }
  }

  const { data, error } = await builder;
  if (error) throw toStoreClientError(error, "products_fetch_failed");

  return ((data ?? []) as unknown as ProductSelectRow[]).map(mapProduct);
}

export async function fetchFeaturedProducts(limit = 8): Promise<StoreProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("sales_count", { ascending: false })
    .limit(limit);

  if (error) throw toStoreClientError(error, "featured_products_fetch_failed");
  return ((data ?? []) as unknown as ProductSelectRow[]).map(mapProduct);
}

export async function fetchPopularProducts(limit = 8): Promise<StoreProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .eq("is_popular", true)
    .order("sales_count", { ascending: false })
    .limit(limit);

  if (error) throw toStoreClientError(error, "popular_products_fetch_failed");
  return ((data ?? []) as unknown as ProductSelectRow[]).map(mapProduct);
}

export async function fetchNewProducts(limit = 8): Promise<StoreProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .eq("is_new", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw toStoreClientError(error, "new_products_fetch_failed");
  return ((data ?? []) as unknown as ProductSelectRow[]).map(mapProduct);
}

export async function fetchDiscountedProducts(limit = 8): Promise<StoreProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .not("compare_at_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw toStoreClientError(error, "discounted_products_fetch_failed");

  return ((data ?? []) as unknown as ProductSelectRow[])
    .map(mapProduct)
    .filter((product) => product.compareAtPrice !== null && product.compareAtPrice > product.price);
}

export async function fetchProductBySlug(slug: string): Promise<StoreProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw toStoreClientError(error, "product_fetch_failed");
  if (!data) return null;

  return mapProduct(data as unknown as ProductSelectRow);
}

// ---------------------------------------------------------------------------
// Edge function invocation
// ---------------------------------------------------------------------------
async function invokeCommerceFunction<TResponse>(
  name: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const { data, error } = await supabase.functions.invoke<TResponse | StoreApiError>(name, { body });

  if (error) {
    throw new StoreClientError("function_invocation_failed", error.message);
  }

  if (data && typeof data === "object" && "ok" in data && data.ok === false) {
    const failure = data as StoreApiError;
    throw new StoreClientError(
      failure.error.code,
      failure.error.message,
      failure.error.details ?? null,
    );
  }

  return data as TResponse;
}

export interface VerifyPaymentInput {
  orderId: string;
  provider: string;
  providerReference: string;
  amount: number;
  currency?: string;
  idempotencyKey?: string;
  providerPayload?: Record<string, unknown>;
}

export interface VerifyPaymentResult {
  ok: true;
  orderId: string;
  paymentId: string;
  status: "verified";
  amount: number;
  currency: string;
  idempotent: boolean;
  deliveryQueued: boolean;
}

export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
  return invokeCommerceFunction<VerifyPaymentResult>("verify-payment", { ...input });
}

export interface DeliverOrderInput {
  orderId: string;
  paymentId?: string;
  idempotencyKey?: string;
}

export interface DeliveredItemResult {
  orderItemId: string;
  productId: string;
  quantity: number;
  productType: string;
  licenseKeys: string[];
  deliveryId: string;
  status: "delivered" | "failed";
  failureReason: string | null;
}

export interface DeliverOrderResult {
  ok: true;
  orderId: string;
  status: "delivered";
  idempotent: boolean;
  items: DeliveredItemResult[];
}

export async function deliverOrder(input: DeliverOrderInput): Promise<DeliverOrderResult> {
  return invokeCommerceFunction<DeliverOrderResult>("deliver-order", { ...input });
}

// ---------------------------------------------------------------------------
// Cart sync (best-effort, never blocks the local cart)
// ---------------------------------------------------------------------------
export interface CartSyncItem {
  productId: string;
  quantity: number;
}

/**
 * Persists the signed-in user's cart to Supabase so it survives a device
 * change. Anonymous visitors keep their cart in localStorage only, and a
 * failed sync never breaks the local cart.
 */
export async function syncCartToSupabase(items: CartSyncItem[]): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return false;

  const { error } = await supabase
    .from("cart_items")
    .upsert(
      items.map((item) => ({
        user_id: userId,
        product_id: item.productId,
        quantity: item.quantity,
      })),
      { onConflict: "user_id,product_id" },
    );

  if (error) {
    console.warn("[store] cart sync failed:", error.message);
    return false;
  }

  return true;
}

export async function loadCartFromSupabase(): Promise<CartSyncItem[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", userId);

  if (error) {
    console.warn("[store] cart load failed:", error.message);
    return [];
  }

  return ((data ?? []) as { product_id: string; quantity: number }[]).map((row) => ({
    productId: row.product_id,
    quantity: row.quantity,
  }));
}

export type StoreDatabase = Database;
