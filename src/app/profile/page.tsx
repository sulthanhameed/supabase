"use client";

import { OrderProgress } from "@/components/order-tracker";
import { useAuth, useCart, useToast } from "@/components/providers";
import { api } from "@/lib/api";
import { formatINR, type OrderDTO } from "@/lib/types";
import { LogOut, Package, RotateCcw, Shield, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, loading, logout, refresh } = useAuth();
  const { add } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/profile");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name, phone: user.phone ?? "", address: user.address ?? "" });
    api<{ orders: OrderDTO[] }>("/orders").then((r) => setOrders(r.orders)).catch(() => {});
  }, [user]);

  if (loading || !user) return <div className="min-h-screen pt-32 text-center text-muted">Loading…</div>;

  const save = async () => {
    setSaving(true);
    try {
      await api("/auth/me", { method: "PATCH", body: JSON.stringify(form) });
      await refresh();
      toast("Profile updated ✓");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm";

  return (
    <div className="page-enter min-h-screen pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-medium text-cream">{user.name.charAt(0)}</div>
            <div>
              <h1 className="text-2xl font-medium">{user.name}</h1>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {user.role === "admin" && (
              <Link href="/admin" className="btn-press flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream/70"><Shield size={16} /> Admin</Link>
            )}
            <button onClick={async () => { await logout(); router.push("/"); }} className="btn-press flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary"><LogOut size={16} /> Logout</button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <section className="rounded-[1.25rem] border border-line bg-paper p-6 lg:col-span-1">
            <h2 className="flex items-center gap-2 text-lg font-medium"><UserRound size={18} className="text-primary" /> Profile</h2>
            <div className="mt-4 space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className={inputCls} />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className={inputCls} />
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Default delivery address" rows={3} className={inputCls} />
              <button onClick={save} disabled={saving} className="btn-press w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-cream hover:bg-primary-dark disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </section>

          <section className="lg:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-medium"><Package size={18} className="text-primary" /> Order History</h2>
            {orders.length === 0 ? (
              <div className="mt-4 rounded-[1.25rem] border border-dashed border-line bg-paper p-10 text-center">
                <p className="text-5xl">🥢</p>
                <p className="mt-3 font-semibold">No orders yet</p>
                <Link href="/menu" className="btn-press mt-3 inline-block rounded-full bg-primary px-6 py-2 text-sm font-semibold text-cream hover:bg-primary-dark">Start ordering</Link>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-[1.25rem] border border-line bg-paper p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <Link href={`/order/${o.orderCode}`} className="font-mono text-lg font-medium hover:underline">{o.orderCode}</Link>
                        <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatINR(o.total)}</p>
                        <p className="text-xs uppercase text-muted">{o.paymentMethod} · {o.paymentStatus.replace("_"," ")}</p>
                      </div>
                    </div>
                    <div className="mt-4"><OrderProgress order={o} /></div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-line pt-3 text-xs text-muted">
                      <span className="line-clamp-1">{o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</span>
                      <button
                        onClick={() => { o.items.forEach((i) => i.productId && add({ productId: i.productId, name: i.name, price: i.price, image: i.image ?? "", quantity: i.quantity }, i.quantity)); }}
                        className="btn-press flex items-center gap-1 rounded-full bg-sand px-3 py-1.5 font-medium text-ink hover:bg-line"
                      >
                        <RotateCcw size={12} /> Reorder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
