"use client";

import { useAuth, useCart, useToast } from "@/components/providers";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/types";
import { motion } from "framer-motion";
import { Banknote, CreditCard, Smartphone, Wallet, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = {
  key: string; amount: number; currency: string; name: string; description: string; order_id: string; image?: string;
  prefill: { name: string; email?: string; contact: string }; theme: { color: string };
  handler: (r: RazorpayResponse) => void; modal?: { ondismiss?: () => void };
};
declare global {
  interface Window {
    Razorpay?: new (o: RazorpayOptions) => { open: () => void };
  }
}

const METHODS = [
  { key: "upi", label: "UPI", desc: "GPay, PhonePe, Paytm", icon: Smartphone },
  { key: "card", label: "Cards", desc: "Credit / Debit", icon: CreditCard },
  { key: "wallet", label: "Wallets", desc: "Paytm, Mobikwik", icon: Wallet },
  { key: "cod", label: "Cash on Delivery", desc: "Pay at doorstep", icon: Banknote },
] as const;

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function CheckoutPage() {
  const { items, totals, clear } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ customerName: "", phone: "", email: "", address: "", notes: "" });
  const [method, setMethod] = useState<(typeof METHODS)[number]["key"]>("upi");
  const [submitting, setSubmitting] = useState(false);
  const [gateway, setGateway] = useState<{ configured: boolean } | null>(null);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, customerName: f.customerName || user.name, email: f.email || user.email, phone: f.phone || user.phone || "", address: f.address || user.address || "" }));
  }, [user]);

  useEffect(() => {
    api<{ configured: boolean }>("/payments/razorpay/config").then(setGateway).catch(() => setGateway({ configured: false }));
  }, []);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await api<{ order: { orderCode: string }; razorpay: { keyId: string; orderId: string; amount: number; currency: string } | null }>("/orders", {
        method: "POST",
        body: JSON.stringify({ ...form, paymentMethod: method, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }),
      });

      if (res.razorpay) {
        const ok = await loadRazorpay();
        if (!ok || !window.Razorpay) throw new Error("Could not load Razorpay. Please try again.");
        const rz = res.razorpay;
        const code = res.order.orderCode;
        const instance = new window.Razorpay({
          key: rz.keyId,
          amount: rz.amount,
          currency: rz.currency,
          name: "Khang Chinese Restaurant & Dimsum",
          description: `Order ${code}`,
          order_id: rz.orderId,
          prefill: { name: form.customerName, email: form.email || undefined, contact: form.phone },
          theme: { color: "#15803d" },
          handler: async (r) => {
            try {
              await api("/payments/razorpay/verify", { method: "POST", body: JSON.stringify({ orderCode: code, ...r }) });
              clear();
              router.push(`/order/${code}`);
            } catch (err) {
              toast((err as Error).message, "error");
              setSubmitting(false);
            }
          },
          modal: { ondismiss: () => { toast("Payment cancelled. Your order is saved as pending.", "info"); setSubmitting(false); } },
        });
        instance.open();
        return;
      }

      clear();
      router.push(`/order/${res.order.orderCode}`);
    } catch (err) {
      toast((err as Error).message, "error");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-enter flex min-h-screen flex-col items-center justify-center gap-4 px-4 pt-20 text-center">
        <span className="text-7xl">🥡</span>
        <h1 className="text-2xl font-medium">Your cart is empty</h1>
        <p className="text-muted">Add some delicious dishes before checking out.</p>
        <Link href="/menu" className="btn-press rounded-full bg-primary px-7 py-3 text-sm font-semibold text-cream hover:bg-primary-dark">Browse Menu</Link>
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm";

  return (
    <div className="page-enter min-h-screen pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow">Almost there</p>
        <h1 className="text-3xl font-medium md:text-4xl">Checkout</h1>

        <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.25rem] border border-line bg-paper p-6">
              <h2 className="flex items-center gap-2 text-lg font-medium"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-cream">1</span> Delivery Details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Full name *" className={inputCls} />
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number *" type="tel" className={inputCls} />
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (for order confirmation)" type="email" className={`${inputCls} sm:col-span-2`} />
                <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full delivery address with landmark *" rows={3} className={`${inputCls} sm:col-span-2`} />
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Cooking notes (e.g. extra spicy, no onion)" className={`${inputCls} sm:col-span-2`} />
              </div>
              {!user && (
                <p className="mt-3 text-xs text-muted">
                  <Link href="/login?next=/checkout" className="font-semibold text-ink underline">Log in</Link> to save your details and view order history.
                </p>
              )}
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[1.25rem] border border-line bg-paper p-6">
              <h2 className="flex items-center gap-2 text-lg font-medium"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-cream">2</span> Payment Method</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {METHODS.map((m) => (
                  <button
                    type="button"
                    key={m.key}
                    onClick={() => setMethod(m.key)}
                    className={`btn-press flex items-center gap-3 rounded-[1.25rem] border-2 p-4 text-left transition ${method === m.key ? "border-ink bg-sand" : "border-line hover:border-line"}`}
                  >
                    <m.icon size={22} className={method === m.key ? "text-primary" : "text-muted"} />
                    <div>
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-xs text-muted">{m.desc}</p>
                    </div>
                    {method === m.key && <span className="ml-auto h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-sand p-3 text-xs text-primary">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                {method === "cod" ? (
                  <span>Pay in cash or UPI when your food arrives.</span>
                ) : gateway?.configured ? (
                  <span>Secured by <b>Razorpay</b>. You&apos;ll be redirected to a secure checkout for {METHODS.find((m) => m.key === method)?.label}.</span>
                ) : (
                  <span>Razorpay keys are not configured on this server — online payment runs in <b>demo mode</b> and the order is marked paid instantly.</span>
                )}
              </div>
            </motion.section>
          </div>

          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
            <div className="sticky top-24 rounded-[1.25rem] border border-line bg-paper p-6">
              <h2 className="text-lg font-medium">Order Summary</h2>
              <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                {items.map((i) => (
                  <li key={i.productId} className="flex items-center gap-3 text-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image} alt="" className="photo h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="line-clamp-1 font-medium">{i.name}</p>
                      <p className="text-xs text-muted">{i.quantity} × {formatINR(i.price)}</p>
                    </div>
                    <span className="font-semibold">{formatINR(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1.5 border-t border-dashed border-line pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(totals.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">GST (5%)</dt><dd>{formatINR(totals.tax)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className={totals.deliveryFee === 0 ? "font-semibold text-primary" : ""}>{totals.deliveryFee === 0 ? "FREE" : formatINR(totals.deliveryFee)}</dd></div>
                <div className="flex justify-between border-t border-line pt-2 text-lg font-medium"><dt>Total</dt><dd>{formatINR(totals.total)}</dd></div>
              </dl>
              <button
                disabled={submitting}
                className="btn-press mt-5 w-full rounded-full bg-primary py-4 text-sm font-semibold text-cream transition hover:bg-primary-dark disabled:opacity-60"
              >
                {submitting ? "Processing…" : method === "cod" ? `Place Order · ${formatINR(totals.total)}` : `Pay ${formatINR(totals.total)}`}
              </button>
              <p className="mt-3 text-center text-[11px] text-muted">Order confirmation will be sent by email & SMS.</p>
            </div>
          </motion.aside>
        </form>
      </div>
    </div>
  );
}
