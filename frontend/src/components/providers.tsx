"use client";

import { api, setToken } from "@/lib/api";
import type { CartItem, ProductDTO, UserDTO } from "@/lib/types";
import { calcTotals } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/* ---------------- Toasts ---------------- */
type Toast = { id: number; message: string; type?: "success" | "error" | "info" };
const ToastCtx = createContext<{ toast: (m: string, t?: Toast["type"]) => void }>({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

/* ---------------- Cart ---------------- */
type CartCtx = {
  items: CartItem[];
  count: number;
  totals: ReturnType<typeof calcTotals>;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (p: ProductDTO | CartItem, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
  lastAdded: number;
};
const CartContext = createContext<CartCtx | null>(null);
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within Providers");
  return ctx;
};

/* ---------------- Auth ---------------- */
type AuthCtx = {
  user: UserDTO | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};
const AuthContext = createContext<AuthCtx | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within Providers");
  return ctx;
};

/* ---------------- Product modal ---------------- */
type ModalCtx = { product: ProductDTO | null; openProduct: (p: ProductDTO) => void; closeProduct: () => void };
const ModalContext = createContext<ModalCtx>({ product: null, openProduct: () => {}, closeProduct: () => {} });
export const useProductModal = () => useContext(ModalContext);

export function Providers({ children }: { children: ReactNode }) {
  // toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  // cart
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("khang_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem("khang_cart", JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback(
    (p: ProductDTO | CartItem, qty = 1) => {
      const productId = "productId" in p ? p.productId : p.id;
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) return prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(20, i.quantity + qty) } : i));
        return [...prev, { productId, name: p.name, price: p.price, image: p.image, quantity: qty }];
      });
      setLastAdded(Date.now());
      toast(`${p.name} added to cart 🥢`);
    },
    [toast],
  );
  const remove = useCallback((productId: number) => setItems((prev) => prev.filter((i) => i.productId !== productId)), []);
  const setQty = useCallback((productId: number, qty: number) => {
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(20, qty) } : i))));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const cartValue = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      totals: calcTotals(items),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      remove,
      setQty,
      clear,
      lastAdded,
    }),
    [items, isOpen, add, remove, setQty, clear, lastAdded],
  );

  // auth
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const { user } = await api<{ user: UserDTO }>("/auth/me");
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const authValue = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      refresh,
      login: async (email, password) => {
        const res = await api<{ user: UserDTO; token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
        setToken(res.token);
        setUser(res.user);
      },
      signup: async (data) => {
        const res = await api<{ user: UserDTO; token: string }>("/auth/signup", { method: "POST", body: JSON.stringify(data) });
        setToken(res.token);
        setUser(res.user);
      },
      logout: async () => {
        await api("/auth/logout", { method: "POST" }).catch(() => {});
        setToken(null);
        setUser(null);
      },
    }),
    [user, loading, refresh],
  );

  // modal
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const modalValue = useMemo<ModalCtx>(() => ({ product, openProduct: setProduct, closeProduct: () => setProduct(null) }), [product]);

  return (
    <ToastCtx.Provider value={{ toast }}>
      <AuthContext.Provider value={authValue}>
        <CartContext.Provider value={cartValue}>
          <ModalContext.Provider value={modalValue}>
            {children}
            <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
              <AnimatePresence>
                {toasts.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className={`rounded-full px-5 py-2.5 text-sm font-medium text-cream shadow-xl ${
                      t.type === "error" ? "bg-red-700" : t.type === "info" ? "bg-ink" : "bg-primary"
                    }`}
                  >
                    {t.message}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ModalContext.Provider>
        </CartContext.Provider>
      </AuthContext.Provider>
    </ToastCtx.Provider>
  );
}
