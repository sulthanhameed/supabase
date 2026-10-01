"use client";

import { api } from "@/lib/api";
import { ORDER_STAGES, formatINR, type OrderDTO } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Check, PackageSearch, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function OrderProgress({ order }: { order: OrderDTO }) {
  const cancelled = order.status === "cancelled";
  const currentIdx = ORDER_STAGES.findIndex((s) => s.key === order.status);
  return (
    <div className="relative">
      {cancelled ? (
        <div className="rounded-[1.25rem] bg-red-100 p-4 text-center font-semibold text-red-700">This order was cancelled.</div>
      ) : (
        <ol className="relative grid grid-cols-4 gap-2">
          <div className="absolute left-[12.5%] right-[12.5%] top-6 h-px bg-line" />
          <motion.div
            className="absolute left-[12.5%] top-6 h-px bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(Math.max(0, currentIdx) / 3) * 75}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          {ORDER_STAGES.map((s, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <li key={s.key} className="relative flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: active ? [1, 1.15, 1] : 1 }}
                  transition={active ? { repeat: Infinity, duration: 1.6 } : {}}
                  className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border text-lg ${
                    done ? "border-primary bg-primary text-cream" : "border-line bg-paper"
                  }`}
                >
                  {done && !active ? <Check size={22} /> : s.icon}
                </motion.div>
                <p className={`mt-2 text-[11px] font-semibold leading-tight sm:text-xs ${done ? "text-ink" : "text-muted"}`}>{s.label}</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function OrderTracker({ initialCode = "", compact = false }: { initialCode?: string; compact?: boolean }) {
  const [code, setCode] = useState(initialCode);
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async (c: string) => {
    if (!c.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { order } = await api<{ order: OrderDTO }>(`/orders/${encodeURIComponent(c.trim().toUpperCase())}`);
      setOrder(order);
    } catch (e) {
      setOrder(null);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCode) void lookup(initialCode);
  }, [initialCode, lookup]);

  // live polling
  useEffect(() => {
    if (!order || order.status === "delivered" || order.status === "cancelled") return;
    const t = setInterval(() => lookup(order.orderCode), 8000);
    return () => clearInterval(t);
  }, [order, lookup]);

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(code);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <PackageSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter Order ID (e.g. KH-7X3K9A)"
            className="w-full rounded-full border border-line bg-paper py-3.5 pl-12 pr-4 font-mono text-sm tracking-widest"
          />
        </div>
        <button
          disabled={loading}
          className="btn-press rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-cream transition hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "Tracking…" : "Track"}
        </button>
      </form>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 text-center text-sm font-medium text-red-700">
            {error}
          </motion.p>
        )}
        {order && (
          <motion.div
            key={order.orderCode + order.status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 rounded-[1.25rem] border border-line bg-paper p-5 sm:p-8"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted">Order</p>
                <p className="font-mono text-xl font-medium">{order.orderCode}</p>
              </div>
              <div className="text-right text-xs text-muted">
                <p>{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                <p className="flex items-center justify-end gap-1 text-primary"><RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Live updates</p>
              </div>
            </div>
            <OrderProgress order={order} />
            {!compact && (
              <div className="mt-8 grid gap-6 border-t border-line pt-6 md:grid-cols-2">
                <div>
                  <h4 className="eyebrow !text-muted">Items</h4>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {order.items.map((i) => (
                      <li key={i.id} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span className="font-semibold">{formatINR(i.price * i.quantity)}</span></li>
                    ))}
                    <li className="flex justify-between border-t border-line pt-2 font-medium"><span>Total</span><span>{formatINR(order.total)}</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="eyebrow !text-muted">Timeline</h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    {order.tracking.map((t) => (
                      <li key={t.id} className="flex gap-3">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <div>
                          <p className="font-semibold capitalize">{t.status.replace(/_/g, " ")}</p>
                          {t.note && <p className="text-xs text-muted">{t.note}</p>}
                          <p className="text-[11px] text-muted">{new Date(t.createdAt).toLocaleString("en-IN")}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted">Delivering to: {order.address}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
