-- ============================================================================
-- Digital Product E-Commerce Platform — Foundation Schema
-- Migration: 20260910000000_ecommerce_foundation.sql
--
-- Creates the core commerce tables, enums, indexes, triggers and
-- least-privilege RLS policies for the NID Khata digital storefront.
-- Idempotent: safe to re-run (guards on every CREATE TYPE / CREATE TABLE /
-- CREATE POLICY / CREATE INDEX / CREATE TRIGGER).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending',
      'awaiting_payment',
      'paid',
      'processing',
      'delivered',
      'failed',
      'cancelled',
      'refunded'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM (
      'initiated',
      'pending',
      'verified',
      'failed',
      'refunded'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status') THEN
    CREATE TYPE public.delivery_status AS ENUM (
      'pending',
      'delivered',
      'failed'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE public.product_status AS ENUM (
      'draft',
      'active',
      'archived'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'license_key_status') THEN
    CREATE TYPE public.license_key_status AS ENUM (
      'available',
      'reserved',
      'assigned',
      'revoked'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coupon_type') THEN
    CREATE TYPE public.coupon_type AS ENUM (
      'percentage',
      'fixed'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM (
      'order',
      'payment',
      'delivery',
      'system',
      'support'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_ticket_status') THEN
    CREATE TYPE public.support_ticket_status AS ENUM (
      'open',
      'pending',
      'resolved',
      'closed'
    );
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at fresh
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  default_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_active_sort
  ON public.categories (is_active, sort_order);

GRANT SELECT ON public.categories TO anon, authenticated;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text,
  description text,
  price numeric(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  compare_at_price numeric(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  currency text NOT NULL DEFAULT 'BDT',
  cover_image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  product_type text NOT NULL DEFAULT 'license_key',
  delivery_instructions text,
  stock_quantity integer,
  is_featured boolean NOT NULL DEFAULT false,
  is_popular boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  status public.product_status NOT NULL DEFAULT 'draft',
  rating numeric(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  sales_count integer NOT NULL DEFAULT 0 CHECK (sales_count >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_status_created
  ON public.products (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category
  ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured
  ON public.products (is_featured) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_popular
  ON public.products (is_popular) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_products_new
  ON public.products (is_new) WHERE status = 'active';

GRANT SELECT ON public.products TO anon, authenticated;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- license_keys
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.license_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  license_key text NOT NULL,
  status public.license_key_status NOT NULL DEFAULT 'available',
  order_id uuid,
  order_item_id uuid,
  assigned_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  assigned_at timestamptz,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT license_keys_key_unique UNIQUE (product_id, license_key)
);

CREATE INDEX IF NOT EXISTS idx_license_keys_product_status
  ON public.license_keys (product_id, status);
CREATE INDEX IF NOT EXISTS idx_license_keys_order
  ON public.license_keys (order_id);
CREATE INDEX IF NOT EXISTS idx_license_keys_user
  ON public.license_keys (assigned_user_id);

GRANT SELECT ON public.license_keys TO authenticated;

ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

-- Buyers may read only the keys assigned to them. Writes happen through
-- SECURITY DEFINER edge functions / service role, never from the browser.
DROP POLICY IF EXISTS "license_keys_select_own" ON public.license_keys;
CREATE POLICY "license_keys_select_own"
  ON public.license_keys FOR SELECT
  TO authenticated
  USING (assigned_user_id = auth.uid());

DROP TRIGGER IF EXISTS trg_license_keys_updated_at ON public.license_keys;
CREATE TRIGGER trg_license_keys_updated_at
  BEFORE UPDATE ON public.license_keys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- coupons
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type public.coupon_type NOT NULL DEFAULT 'percentage',
  discount_value numeric(12, 2) NOT NULL CHECK (discount_value >= 0),
  min_order_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  max_discount_amount numeric(12, 2) CHECK (max_discount_amount IS NULL OR max_discount_amount >= 0),
  usage_limit integer CHECK (usage_limit IS NULL OR usage_limit >= 0),
  used_count integer NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  per_user_limit integer NOT NULL DEFAULT 1 CHECK (per_user_limit >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_active
  ON public.coupons (is_active, expires_at);

GRANT SELECT ON public.coupons TO authenticated;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Coupon codes are validated server-side; the browser never lists them.
DROP POLICY IF EXISTS "coupons_no_public_read" ON public.coupons;
CREATE POLICY "coupons_no_public_read"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (false);

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON public.coupons;
CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  email text,
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal_amount >= 0),
  discount_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  currency text NOT NULL DEFAULT 'BDT',
  coupon_code text,
  notes text,
  idempotency_key text,
  paid_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON public.orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON public.orders (idempotency_key) WHERE idempotency_key IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Buyers may only move their own order into a payable state; the payment
-- functions (service role) own every later transition.
DROP POLICY IF EXISTS "orders_update_own_pending" ON public.orders;
CREATE POLICY "orders_update_own_pending"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status IN ('pending', 'awaiting_payment'))
  WITH CHECK (user_id = auth.uid() AND status IN ('pending', 'awaiting_payment'));

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  product_type text NOT NULL DEFAULT 'license_key',
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric(12, 2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(12, 2) NOT NULL CHECK (total_price >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order
  ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product
  ON public.order_items (product_id);

GRANT SELECT, INSERT ON public.order_items TO authenticated;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;
CREATE POLICY "order_items_insert_own"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
        AND o.status IN ('pending', 'awaiting_payment')
    )
  );

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_reference text,
  amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'BDT',
  status public.payment_status NOT NULL DEFAULT 'initiated',
  idempotency_key text,
  provider_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  failure_reason text,
  verified_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_provider_reference_unique UNIQUE (provider, provider_reference)
);

CREATE INDEX IF NOT EXISTS idx_payments_order
  ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status
  ON public.payments (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency_key
  ON public.payments (idempotency_key) WHERE idempotency_key IS NOT NULL;

GRANT SELECT ON public.payments TO authenticated;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payment rows are written only by the service-role edge functions; buyers
-- may read the payments attached to their own orders.
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id AND o.user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- deliveries
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES public.order_items (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  status public.delivery_status NOT NULL DEFAULT 'pending',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  failure_reason text,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order
  ON public.deliveries (order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_user
  ON public.deliveries (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_deliveries_order_item_unique
  ON public.deliveries (order_item_id) WHERE order_item_id IS NOT NULL;

GRANT SELECT ON public.deliveries TO authenticated;

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deliveries_select_own" ON public.deliveries;
CREATE POLICY "deliveries_select_own"
  ON public.deliveries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS trg_deliveries_updated_at ON public.deliveries;
CREATE TRIGGER trg_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type public.notification_type NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications (user_id) WHERE is_read = false;

GRANT SELECT, UPDATE ON public.notifications TO authenticated;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- A buyer may only mark their own notification as read.
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- support_tickets
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders (id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status public.support_ticket_status NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  admin_reply text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_created
  ON public.support_tickets (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON public.support_tickets (status);

GRANT SELECT, INSERT ON public.support_tickets TO authenticated;

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_tickets_select_own" ON public.support_tickets;
CREATE POLICY "support_tickets_select_own"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "support_tickets_insert_own" ON public.support_tickets;
CREATE POLICY "support_tickets_insert_own"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- idempotency_keys
--
-- Backs the duplicate-order / duplicate-payment guard used by verify-payment,
-- payment-webhook and deliver-order. A (scope, key) pair stores the response
-- of the first successful run so a retried request replays it instead of
-- creating a second order, payment or delivery.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  key text NOT NULL,
  response jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT idempotency_keys_scope_key_unique UNIQUE (scope, key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_scope_key
  ON public.idempotency_keys (scope, key);

-- Written and read only by the service-role edge functions. The browser never
-- touches this table, so no role is granted Data API access and the RLS policy
-- denies every non-service-role caller.
GRANT SELECT, INSERT ON public.idempotency_keys TO service_role;

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "idempotency_keys_service_role_only" ON public.idempotency_keys;
CREATE POLICY "idempotency_keys_service_role_only"
  ON public.idempotency_keys FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- cart_items
--
-- Mirrors the browser cart for signed-in users so it follows them across
-- devices. Anonymous visitors keep their cart in localStorage only.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user
  ON public.cart_items (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_select_own" ON public.cart_items;
CREATE POLICY "cart_items_select_own"
  ON public.cart_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "cart_items_insert_own" ON public.cart_items;
CREATE POLICY "cart_items_insert_own"
  ON public.cart_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cart_items_update_own" ON public.cart_items;
CREATE POLICY "cart_items_update_own"
  ON public.cart_items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "cart_items_delete_own" ON public.cart_items;
CREATE POLICY "cart_items_delete_own"
  ON public.cart_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed: storefront categories
-- ---------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, description, icon, sort_order)
VALUES
  ('সফটওয়্যার লাইসেন্স', 'software-license', 'অরিজিনাল সফটওয়্যার লাইসেন্স কী ও অ্যাক্টিভেশন কোড', 'package', 1),
  ('সাবস্ক্রিপশন', 'subscription', 'মাসিক ও বার্ষিক প্রিমিয়াম সাবস্ক্রিপশন প্ল্যান', 'sparkles', 2),
  ('অ্যাক্টিভেশন কী', 'activation-key', 'তাৎক্ষণিক ডেলিভারিযোগ্য অ্যাক্টিভেশন কী', 'tag', 3),
  ('ডিজিটাল কোড', 'digital-code', 'গেম, গিফট কার্ড ও ডিজিটাল রিডেম্পশন কোড', 'qr-code', 4),
  ('টেমপ্লেট', 'template', 'প্রিমিয়াম ওয়েবসাইট, ডিজাইন ও ডকুমেন্ট টেমপ্লেট', 'file-text', 5),
  ('ডাউনলোডযোগ্য ফাইল', 'downloadable-file', 'সরাসরি ডাউনলোডযোগ্য ডিজিটাল প্রোডাক্ট', 'file-down', 6)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed: storefront products
-- ---------------------------------------------------------------------------
INSERT INTO public.products (
  category_id,
  name,
  slug,
  short_description,
  description,
  price,
  compare_at_price,
  product_type,
  is_featured,
  is_popular,
  is_new,
  status,
  rating,
  review_count,
  sales_count,
  delivery_instructions
)
SELECT
  c.id,
  v.name,
  v.slug,
  v.short_description,
  v.description,
  v.price,
  v.compare_at_price,
  v.product_type,
  v.is_featured,
  v.is_popular,
  v.is_new,
  'active'::public.product_status,
  v.rating,
  v.review_count,
  v.sales_count,
  v.delivery_instructions
FROM (
  VALUES
    ('subscription', 'Microsoft Office 365 — ১ বছর', 'microsoft-office-365-1-year', 'এক বছরের অফিসিয়াল সাবস্ক্রিপশন, ৫ ডিভাইস পর্যন্ত', 'Microsoft Office 365 পারিবারিক প্ল্যানের এক বছরের অফিসিয়াল সাবস্ক্রিপশন। Word, Excel, PowerPoint, Outlook ও ১TB OneDrive স্টোরেজ অন্তর্ভুক্ত।', 4990.00, 7500.00, 'subscription', true, true, false, 4.90, 312, 1840, 'পেমেন্ট নিশ্চিত হওয়ার সাথে সাথেই অ্যাক্টিভেশন লিংক ও লাইসেন্স কী ইমেইলে পাঠানো হবে।'),
    ('software-license', 'Windows 11 Pro লাইসেন্স কী', 'windows-11-pro-license-key', 'অরিজিনাল রিটেইল লাইসেন্স, লাইফটাইম অ্যাক্টিভেশন', 'Windows 11 Pro-এর অফিসিয়াল রিটেইল লাইসেন্স কী। একবার অ্যাক্টিভেশনের পর লাইফটাইম ব্যবহারযোগ্য এবং Microsoft অ্যাকাউন্টের সাথে বাইন্ড করা যায়।', 2490.00, 4200.00, 'license_key', true, true, false, 4.80, 528, 3120, 'লাইসেন্স কী ডেলিভারি সেকশনে তাৎক্ষণিক দেখানো হবে এবং ইমেইলে পাঠানো হবে।'),
    ('subscription', 'Adobe Creative Cloud — ১ মাস', 'adobe-creative-cloud-1-month', 'Photoshop, Illustrator সহ সম্পূর্ণ অ্যাপ বান্ডেল', 'Adobe Creative Cloud-এর এক মাসের অফিসিয়াল সাবস্ক্রিপশন। Photoshop, Illustrator, Premiere Pro, After Effects সহ ২০+ অ্যাপ অন্তর্ভুক্ত।', 1890.00, 2900.00, 'subscription', true, false, false, 4.70, 204, 980, 'অ্যাক্টিভেশন নির্দেশনা ও অ্যাকাউন্ট অ্যাক্সেস পেমেন্টের পরপরই প্রদান করা হবে।'),
    ('template', 'Premium WordPress থিম বান্ডেল', 'premium-wordpress-theme-bundle', '১০টি প্রিমিয়াম থিম, আজীবন আপডেট', '১০টি বাছাই করা প্রিমিয়াম WordPress থিমের বান্ডেল। প্রতিটি থিমে আজীবন আপডেট ও ডকুমেন্টেশন অন্তর্ভুক্ত।', 1290.00, 2100.00, 'downloadable_file', true, false, true, 4.90, 96, 420, 'ডাউনলোড লিংক পেমেন্ট নিশ্চিত হওয়ার সাথে সাথেই অ্যাক্সেসযোগ্য হবে।'),
    ('subscription', 'Canva Pro — ১ বছর', 'canva-pro-1-year', 'আনলিমিটেড ডিজাইন, প্রিমিয়াম টেমপ্লেট ও ব্র্যান্ড কিট', 'Canva Pro-এর এক বছরের অফিসিয়াল সাবস্ক্রিপশন। আনলিমিটেড প্রিমিয়াম টেমপ্লেট, ব্যাকগ্রাউন্ড রিমুভার ও ব্র্যান্ড কিট সুবিধা।', 990.00, 1800.00, 'subscription', false, true, false, 4.80, 412, 2260, 'অ্যাক্টিভেশন লিংক ও নির্দেশনা ইমেইলে পাঠানো হবে।'),
    ('subscription', 'NordVPN — ৬ মাস', 'nordvpn-6-months', '৬ মাসের প্রিমিয়াম VPN সাবস্ক্রিপশন', 'NordVPN-এর ৬ মাসের প্রিমিয়াম সাবস্ক্রিপশন। ৫,০০০+ সার্ভার, নো-লগ পলিসি ও একাধিক ডিভাইস সাপোর্ট।', 1490.00, 2400.00, 'subscription', false, true, false, 4.70, 287, 1340, 'অ্যাকাউন্ট ক্রেডেনশিয়াল ও সেটআপ গাইড পেমেন্টের পর প্রদান করা হবে।'),
    ('subscription', 'Grammarly Premium — ১ বছর', 'grammarly-premium-1-year', 'এক বছরের প্রিমিয়াম রাইটিং অ্যাসিস্ট্যান্ট', 'Grammarly Premium-এর এক বছরের সাবস্ক্রিপশন। অ্যাডভান্সড গ্রামার, টোন ও প্লেজিয়ারিজম চেক অন্তর্ভুক্ত।', 1790.00, 2900.00, 'subscription', false, true, false, 4.60, 198, 870, 'অ্যাক্টিভেশন নির্দেশনা ইমেইলে পাঠানো হবে।'),
    ('software-license', 'IDM লাইফটাইম লাইসেন্স', 'idm-lifetime-license', 'Internet Download Manager আজীবন লাইসেন্স', 'Internet Download Manager-এর অফিসিয়াল লাইফটাইম লাইসেন্স কী। একবার অ্যাক্টিভেশনে আজীবন ব্যবহারযোগ্য।', 890.00, 1500.00, 'license_key', false, true, false, 4.90, 634, 4180, 'লাইসেন্স কী তাৎক্ষণিক ডেলিভারি সেকশনে ও ইমেইলে প্রদান করা হবে।'),
    ('subscription', 'Figma Pro — ১ মাস', 'figma-pro-1-month', 'প্রফেশনাল ডিজাইন টুলের এক মাসের অ্যাক্সেস', 'Figma Professional প্ল্যানের এক মাসের অ্যাক্সেস। আনলিমিটেড ফাইল, ভার্সন হিস্ট্রি ও টিম কোলাবরেশন সুবিধা।', 1190.00, 1900.00, 'subscription', false, false, true, 4.80, 42, 160, 'টিম ইনভাইট ও অ্যাক্সেস পেমেন্টের পরপরই প্রদান করা হবে।'),
    ('subscription', 'Notion Plus — ১ বছর', 'notion-plus-1-year', 'এক বছরের Notion Plus প্ল্যান', 'Notion Plus প্ল্যানের এক বছরের সাবস্ক্রিপশন। আনলিমিটেড ব্লক, ফাইল আপলোড ও গেস্ট অ্যাক্সেস।', 1390.00, 2200.00, 'subscription', false, false, true, 4.70, 31, 120, 'ওয়ার্কস্পেস অ্যাক্সেস পেমেন্ট নিশ্চিত হওয়ার পর প্রদান করা হবে।'),
    ('downloadable-file', 'Envato Elements — ১ মাস', 'envato-elements-1-month', 'আনলিমিটেড ডিজিটাল অ্যাসেট ডাউনলোড', 'Envato Elements-এর এক মাসের সাবস্ক্রিপশন। আনলিমিটেড টেমপ্লেট, ফন্ট, ভিডিও ও অডিও ডাউনলোড সুবিধা।', 990.00, 1600.00, 'downloadable_file', false, false, true, 4.60, 27, 95, 'ডাউনলোড অ্যাক্সেস পেমেন্টের পরপরই প্রদান করা হবে।'),
    ('subscription', 'ChatGPT Plus — ১ মাস', 'chatgpt-plus-1-month', 'GPT-4o অ্যাক্সেস সহ এক মাসের প্ল্যান', 'ChatGPT Plus-এর এক মাসের সাবস্ক্রিপশন। GPT-4o, অ্যাডভান্সড ডেটা অ্যানালাইসিস ও প্রায়োরিটি অ্যাক্সেস অন্তর্ভুক্ত।', 2290.00, 3200.00, 'subscription', false, false, true, 4.90, 58, 240, 'অ্যাকাউন্ট অ্যাক্সেস ও নির্দেশনা পেমেন্টের পরপরই প্রদান করা হবে।')
) AS v (
  category_slug,
  name,
  slug,
  short_description,
  description,
  price,
  compare_at_price,
  product_type,
  is_featured,
  is_popular,
  is_new,
  rating,
  review_count,
  sales_count,
  delivery_instructions
)
JOIN public.categories c ON c.slug = v.category_slug
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed: demo license keys for the license-key products
-- ---------------------------------------------------------------------------
INSERT INTO public.license_keys (product_id, license_key, status)
SELECT p.id, v.license_key, 'available'::public.license_key_status
FROM (
  VALUES
    ('windows-11-pro-license-key', 'W11P-4F7K9-2M8QX-6T3ZB-9YH5D'),
    ('windows-11-pro-license-key', 'W11P-8N2VC-5R7LP-3K9WD-1Q6MF'),
    ('windows-11-pro-license-key', 'W11P-6H4TJ-9B2XS-7L5RN-3P8GK'),
    ('idm-lifetime-license', 'IDM-7K2M9-4X8QT-6B3ZN-5H1WD'),
    ('idm-lifetime-license', 'IDM-3P8GK-1Q6MF-9YH5D-2R7VC'),
    ('idm-lifetime-license', 'IDM-5L9RN-7T3ZB-4F7K9-8N2XS')
) AS v (product_slug, license_key)
JOIN public.products p ON p.slug = v.product_slug
ON CONFLICT (product_id, license_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed: launch coupon
-- ---------------------------------------------------------------------------
INSERT INTO public.coupons (
  code,
  description,
  discount_type,
  discount_value,
  min_order_amount,
  max_discount_amount,
  usage_limit,
  per_user_limit,
  is_active
)
VALUES (
  'WELCOME10',
  'প্রথম অর্ডারে ১০% ছাড় (সর্বোচ্চ ৫০০ টাকা)',
  'percentage'::public.coupon_type,
  10.00,
  500.00,
  500.00,
  1000,
  1,
  true
)
ON CONFLICT (code) DO NOTHING;
</｜｜DSML｜｜ parameter>
</invoke>
