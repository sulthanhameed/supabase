"use client";

import { useCart } from "@/components/providers";
import { FREE_DELIVERY_ABOVE, formatINR } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, totals, count } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const remaining = FREE_DELIVERY_ABOVE - totals.subtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-line bg-paper"
          >
            <div className="flex items-center justify-between border-b border-line bg-paper px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                <h2 className="text-lg font-medium">Your Cart</h2>
                <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-semibold">{count}</span>
              </div>
              <button onClick={close} className="btn-press rounded-full p-1.5 hover:bg-sand">
                <X size={22} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <span className="text-6xl">🥡</span>
                <p className="font-semibold text-ink">Your cart is empty</p>
                <p className="text-sm text-muted">Add some dumplings to make it happy.</p>
                <Link href="/menu" onClick={close} className="btn-press rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-cream hover:bg-primary-dark">
                  Browse menu
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {remaining > 0 ? (
                    <div className="mb-4 rounded-xl border border-line bg-sand px-4 py-2.5 text-xs text-muted">
                      Add {formatINR(remaining)} more for <b className="text-ink">free delivery</b>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.min(100, (totals.subtotal / FREE_DELIVERY_ABOVE) * 100)}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl bg-sand px-4 py-2.5 text-xs font-semibold text-primary">Free delivery unlocked</div>
                  )}
                  <ul className="space-y-3">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.li
                          key={item.productId}
                          layout
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40, height: 0 }}
                          className="flex gap-3 rounded-[1.25rem] border border-line bg-paper p-3"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} loading="lazy" className="photo h-20 w-20 shrink-0 rounded-xl object-cover" />
                          <div className="flex flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <p className="line-clamp-2 text-sm font-semibold">{item.name}</p>
                              <button onClick={() => remove(item.productId)} className="btn-press text-muted hover:text-primary">
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className="text-xs text-muted">{formatINR(item.price)} each</p>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-1 rounded-full border border-line">
                                <button onClick={() => setQty(item.productId, item.quantity - 1)} className="btn-press p-1.5 text-ink/70">
                                  <Minus size={14} />
                                </button>
                                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                <button onClick={() => setQty(item.productId, item.quantity + 1)} className="btn-press p-1.5 text-ink/70">
                                  <Plus size={14} />
                                </button>
                              </div>
                              <span className="font-semibold">{formatINR(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <div className="border-t border-line bg-paper px-5 py-4">
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-medium">{formatINR(totals.subtotal)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Tax (5% GST)</dt><dd className="font-medium">{formatINR(totals.tax)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className={`font-medium ${totals.deliveryFee === 0 ? "text-primary" : ""}`}>{totals.deliveryFee === 0 ? "FREE" : formatINR(totals.deliveryFee)}</dd></div>
                    <div className="flex justify-between border-t border-line pt-2 text-base font-medium"><dt>Total</dt><dd>{formatINR(totals.total)}</dd></div>
                  </dl>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="btn-press mt-4 block w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-cream transition hover:bg-primary-dark"
                  >
                    Checkout →
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
