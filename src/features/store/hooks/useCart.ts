import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  loadCartFromSupabase,
  syncCartToSupabase,
  type CartSyncItem,
} from "@/features/store/api/storeClient";
import type { CartItem, CartState, CartSummary, StoreProduct } from "@/features/store/types";

// ---------------------------------------------------------------------------
// Cart state
//
// The cart lives in localStorage so it survives a refresh for anonymous
// visitors, and is mirrored to Supabase for signed-in users so it follows them
// across devices. A failed sync never breaks the local cart.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "nid-khata:cart:v1";
const MAX_QUANTITY = 99;

function emptyState(): CartState {
  return { items: [], updatedAt: new Date().toISOString() };
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.currency === "string" &&
    typeof item.productType === "string" &&
    typeof item.quantity === "number"
  );
}

function readStoredState(): CartState {
  if (typeof window === "undefined") return emptyState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();

    const parsed = JSON.parse(raw) as Partial<CartState>;
    const items = Array.isArray(parsed.items) ? parsed.items.filter(isCartItem) : [];

    return {
      items: items.map((item) => ({
        ...item,
        quantity: clampQuantity(item.quantity),
      })),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return emptyState();
  }
}

function writeStoredState(state: CartState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked (private mode) — the in-memory cart still works.
  }
}

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(Math.max(Math.trunc(quantity), 1), MAX_QUANTITY);
}

function toCartItem(product: StoreProduct, quantity: number): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    currency: product.currency,
    coverImageUrl: product.coverImageUrl,
    productType: product.productType,
    quantity: clampQuantity(quantity),
  };
}

function summarise(items: CartItem[]): CartSummary {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    itemCount,
    lineCount: items.length,
    subtotal: Math.round(subtotal * 100) / 100,
    currency: items[0]?.currency ?? "BDT",
  };
}

export interface UseCartResult {
  items: CartItem[];
  summary: CartSummary;
  /** True once the persisted cart has been read on the client. */
  isReady: boolean;
  /** True while the signed-in cart is being reconciled with Supabase. */
  isSyncing: boolean;
  addItem: (product: StoreProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
}

export function useCart(): UseCartResult {
  const [state, setState] = useState<CartState>(emptyState);
  const [isReady, setIsReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimer = useRef<number | null>(null);

  // -------------------------------------------------------------------------
  // Hydrate from localStorage, then reconcile with Supabase when signed in.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const stored = readStoredState();
    setState(stored);
    setIsReady(true);

    let cancelled = false;

    async function reconcile() {
      setIsSyncing(true);
      try {
        const remote = await loadCartFromSupabase();
        if (cancelled || remote.length === 0) return;

        setState((current) => {
          const merged = new Map<string, CartItem>();

          for (const item of current.items) {
            merged.set(item.productId, item);
          }

          for (const remoteItem of remote) {
            const existing = merged.get(remoteItem.productId);
            if (existing) {
              merged.set(remoteItem.productId, {
                ...existing,
                quantity: clampQuantity(Math.max(existing.quantity, remoteItem.quantity)),
              });
            }
          }

          return { items: Array.from(merged.values()), updatedAt: new Date().toISOString() };
        });
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    }

    void reconcile();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------------------------------------------------------
  // Persist locally on every change and debounce the Supabase mirror.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isReady) return;

    writeStoredState(state);

    if (syncTimer.current !== null) {
      window.clearTimeout(syncTimer.current);
    }

    const payload: CartSyncItem[] = state.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    syncTimer.current = window.setTimeout(() => {
      void syncCartToSupabase(payload);
    }, 600);

    return () => {
      if (syncTimer.current !== null) {
        window.clearTimeout(syncTimer.current);
        syncTimer.current = null;
      }
    };
  }, [state, isReady]);

  // Keep the cart in step with sign-in / sign-out on other tabs.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setState(emptyState());
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const addItem = useCallback((product: StoreProduct, quantity = 1) => {
    setState((current) => {
      const existing = current.items.find((item) => item.productId === product.id);

      const items = existing
        ? current.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: clampQuantity(item.quantity + quantity) }
              : item,
          )
        : [...current.items, toCartItem(product, quantity)];

      return { items, updatedAt: new Date().toISOString() };
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setState((current) => ({
      items: current.items.filter((item) => item.productId !== productId),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setState((current) => {
      if (quantity <= 0) {
        return {
          items: current.items.filter((item) => item.productId !== productId),
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        items: current.items.map((item) =>
          item.productId === productId ? { ...item, quantity: clampQuantity(quantity) } : item,
        ),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setState(emptyState());
  }, []);

  const getQuantity = useCallback(
    (productId: string) => state.items.find((item) => item.productId === productId)?.quantity ?? 0,
    [state.items],
  );

  const summary = useMemo(() => summarise(state.items), [state.items]);

  return {
    items: state.items,
    summary,
    isReady,
    isSyncing,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getQuantity,
  };
}

export default useCart;
