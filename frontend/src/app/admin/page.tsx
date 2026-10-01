"use client";

import { useAuth, useToast } from "@/components/providers";
import { api } from "@/lib/api";
import { ORDER_STAGES, formatINR, type CategoryDTO, type OrderDTO, type ProductDTO } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, CreditCard, Layers, Package, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConnectionStatus } from "@/components/connection-status";
import { useCallback, useEffect, useState } from "react";

type Tab = "overview" | "orders" | "products" | "categories" | "users" | "payments";
type AdminUser = { id: number; name: string; email: string; phone: string | null; role: string; createdAt: string; orderCount: number; spent: string | null };
type PaymentRow = { id: number; orderCode: string; customerName: string; provider: string; providerPaymentId: string | null; amount: number; status: string; createdAt: string };

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "orders", label: "Orders", icon: Package },
  { key: "products", label: "Products", icon: Layers },
  { key: "categories", label: "Categories", icon: Layers },
  { key: "users", label: "Users", icon: Users },
  { key: "payments", label: "Payments", icon: CreditCard },
];

const emptyProduct = { name: "", price: 0, categoryId: 0, image: "", description: "", ingredients: "", isVeg: false, isFeatured: false, isAvailable: true };
const inputCls = "w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [editing, setEditing] = useState<(typeof emptyProduct & { id?: number }) | null>(null);
  const [newCat, setNewCat] = useState({ name: "", emoji: "🍜", image: "", description: "" });

  const loadAll = useCallback(async () => {
    const [o, p, c, u, pay] = await Promise.all([
      api<{ orders: OrderDTO[] }>("/admin/orders"),
      api<{ products: ProductDTO[] }>("/admin/products"),
      api<{ categories: CategoryDTO[] }>("/admin/categories"),
      api<{ users: AdminUser[] }>("/admin/users"),
      api<{ payments: PaymentRow[] }>("/admin/payments"),
    ]);
    setOrders(o.orders); setProducts(p.products); setCategories(c.categories); setUsers(u.users); setPayments(pay.payments);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login?next=/admin");
    else if (user.role !== "admin") router.replace("/profile");
    else loadAll().catch((e) => toast((e as Error).message, "error"));
  }, [loading, user, router, loadAll, toast]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const t = setInterval(() => api<{ orders: OrderDTO[] }>("/admin/orders").then((r) => setOrders(r.orders)).catch(() => {}), 10000);
    return () => clearInterval(t);
  }, [user]);

  if (loading || !user || user.role !== "admin") return <div className="min-h-screen pt-32 text-center text-muted">Loading admin…</div>;

  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const today = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString());

  const updateOrder = async (id: number, status: string) => {
    try {
      const { order } = await api<{ order: OrderDTO }>(`/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setOrders((os) => os.map((o) => (o.id === id ? order : o)));
      toast(`Order ${order.orderCode} → ${status.replace(/_/g," ")}`);
    } catch (e) { toast((e as Error).message, "error"); }
  };
  const markPaid = async (id: number) => {
    try {
      const { order } = await api<{ order: OrderDTO }>(`/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ paymentStatus: "paid" }) });
      setOrders((os) => os.map((o) => (o.id === id ? order : o)));
      toast("Marked as paid");
    } catch (e) { toast((e as Error).message, "error"); }
  };

  const saveProduct = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        await api(`/admin/products/${editing.id}`, { method: "PATCH", body: JSON.stringify(editing) });
      } else {
        await api("/admin/products", { method: "POST", body: JSON.stringify({ ...editing, categoryId: editing.categoryId || categories[0]?.id }) });
      }
      const p = await api<{ products: ProductDTO[] }>("/admin/products");
      setProducts(p.products);
      setEditing(null);
      toast("Product saved ✓");
    } catch (e) { toast((e as Error).message, "error"); }
  };
  const deleteProduct = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await api(`/admin/products/${id}`, { method: "DELETE" });
    setProducts((ps) => ps.filter((p) => p.id !== id));
    toast("Product deleted", "info");
  };
  const toggle = async (p: ProductDTO, key: "isAvailable" | "isFeatured") => {
    const { product } = await api<{ product: ProductDTO }>(`/admin/products/${p.id}`, { method: "PATCH", body: JSON.stringify({ [key]: !p[key] }) });
    setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, ...product } : x)));
  };

  const addCategory = async () => {
    try {
      await api("/admin/categories", { method: "POST", body: JSON.stringify(newCat) });
      const c = await api<{ categories: CategoryDTO[] }>("/admin/categories");
      setCategories(c.categories);
      setNewCat({ name: "", emoji: "🍜", image: "", description: "" });
      toast("Category added ✓");
    } catch (e) { toast((e as Error).message, "error"); }
  };
  const deleteCategory = async (id: number) => {
    if (!confirm("Delete this category and ALL its products?")) return;
    await api(`/admin/categories/${id}`, { method: "DELETE" });
    setCategories((cs) => cs.filter((c) => c.id !== id));
    setProducts((ps) => ps.filter((p) => p.categoryId !== id));
  };

  const setRole = async (id: number, role: string) => {
    try {
      await api(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ role }) });
      setUsers((us) => us.map((u) => (u.id === id ? { ...u, role } : u)));
      toast("Role updated");
    } catch (e) { toast((e as Error).message, "error"); }
  };
  const deleteUser = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api(`/admin/users/${id}`, { method: "DELETE" });
      setUsers((us) => us.filter((u) => u.id !== id));
    } catch (e) { toast((e as Error).message, "error"); }
  };

  const statusColor: Record<string, string> = { received: "bg-sand text-neutral-800", preparing: "bg-line text-neutral-800", out_for_delivery: "bg-green-100 text-green-800", delivered: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };

  return (
    <div className="page-enter min-h-screen bg-cream pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="text-3xl font-medium">Khang Dashboard</h1>
            <div className="mt-2"><ConnectionStatus /></div>
          </div>
          <div className="scrollbar-hide flex gap-1 overflow-x-auto rounded-full bg-paper p-1 shadow">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`btn-press flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.key ? "bg-primary text-cream" : "text-muted hover:bg-paper"}`}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="mt-8">
            {tab === "overview" && (
              <div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Total Revenue", formatINR(revenue), "💰"],
                    ["Orders Today", String(today.length), "📦"],
                    ["Active Orders", String(orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length), "🔥"],
                    ["Customers", String(users.length), "👥"],
                  ].map(([l, v, i]) => (
                    <div key={l} className="rounded-[1.25rem] border border-line bg-paper p-5 shadow">
                      <div className="flex items-center justify-between"><p className="eyebrow !text-muted">{l}</p><span className="text-2xl">{i}</span></div>
                      <p className="mt-2 text-3xl font-medium">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-line bg-paper p-5 shadow">
                    <h3 className="font-medium">Orders by status</h3>
                    <div className="mt-4 space-y-3">
                      {[...ORDER_STAGES.map((s) => s.key), "cancelled"].map((s) => {
                        const n = orders.filter((o) => o.status === s).length;
                        return (
                          <div key={s} className="text-sm">
                            <div className="flex justify-between"><span className="capitalize">{s.replace(/_/g," ")}</span><b>{n}</b></div>
                            <div className="mt-1 h-2 rounded-full bg-paper"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${orders.length ? (n / orders.length) * 100 : 0}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-line bg-paper p-5 shadow">
                    <h3 className="font-medium">Recent orders</h3>
                    <ul className="mt-3 divide-y divide-gold/30 text-sm">
                      {orders.slice(0, 6).map((o) => (
                        <li key={o.id} className="flex items-center justify-between py-2">
                          <div><p className="font-mono font-medium">{o.orderCode}</p><p className="text-xs text-muted">{o.customerName}</p></div>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor[o.status]}`}>{o.status.replace(/_/g," ")}</span>
                          <b>{formatINR(o.total)}</b>
                        </li>
                      ))}
                      {orders.length === 0 && <li className="py-6 text-center text-muted">No orders yet.</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {tab === "orders" && (
              <div className="space-y-4">
                {orders.length === 0 && <p className="rounded-[1.25rem] bg-paper p-10 text-center text-muted">No orders yet.</p>}
                {orders.map((o) => (
                  <div key={o.id} className="rounded-[1.25rem] border border-line bg-paper p-5 shadow">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-lg font-medium">{o.orderCode}</p>
                        <p className="text-sm font-semibold">{o.customerName} · {o.phone}</p>
                        <p className="text-xs text-muted">{o.address}</p>
                        {o.notes && <p className="mt-1 text-xs italic text-neutral-600">Note: {o.notes}</p>}
                        <p className="mt-1 text-xs text-muted">{new Date(o.createdAt).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-medium">{formatINR(o.total)}</p>
                        <p className="text-xs uppercase text-muted">{o.paymentMethod} · <span className={o.paymentStatus === "paid" ? "text-primary" : "text-neutral-600"}>{o.paymentStatus.replace("_"," ")}</span></p>
                        {o.paymentStatus !== "paid" && <button onClick={() => markPaid(o.id)} className="mt-1 text-xs font-semibold text-primary underline">Mark paid</button>}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted">{o.items.map((i) => `${i.name} ×${i.quantity}`).join(" · ")}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="eyebrow !text-muted">Update tracking:</span>
                      {[...ORDER_STAGES.map((s) => ({ key: s.key, label: s.label })), { key: "cancelled", label: "Cancel" }].map((s) => (
                        <button
                          key={s.key}
                          disabled={o.status === s.key}
                          onClick={() => updateOrder(o.id, s.key)}
                          className={`btn-press rounded-full px-3 py-1.5 text-xs font-semibold transition ${o.status === s.key ? statusColor[s.key] +" ring-2 ring-offset-1 ring-current" : "bg-paper hover:bg-line"}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "products" && (
              <div>
                <div className="mb-4 flex justify-end">
                  <button onClick={() => setEditing({ ...emptyProduct, categoryId: categories[0]?.id ?? 0 })} className="btn-press flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-cream hover:bg-primary-dark"><Plus size={16} /> Add Product</button>
                </div>
                <div className="overflow-x-auto rounded-[1.25rem] border border-line bg-paper shadow">
                  <table className="w-full text-sm">
                    <thead className="bg-paper text-left text-xs uppercase tracking-widest text-muted">
                      <tr><th className="p-3">Dish</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Rating</th><th className="p-3">Featured</th><th className="p-3">Available</th><th className="p-3"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-gold/20">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-white/50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.image} alt="" className="photo h-10 w-10 rounded-lg object-cover" />
                              <div><p className="font-semibold">{p.name}</p><p className="text-xs text-muted">{p.isVeg ? "🟢 Veg" : "🔴 Non-veg"}</p></div>
                            </div>
                          </td>
                          <td className="p-3">{p.categoryName}</td>
                          <td className="p-3 font-medium">{formatINR(p.price)}</td>
                          <td className="p-3">⭐ {p.rating.toFixed(1)} <span className="text-xs text-muted">({p.reviewsCount})</span></td>
                          <td className="p-3"><button onClick={() => toggle(p, "isFeatured")} className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.isFeatured ? "bg-ink text-cream" : "bg-paper text-muted"}`}>{p.isFeatured ? "Yes" : "No"}</button></td>
                          <td className="p-3"><button onClick={() => toggle(p, "isAvailable")} className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.isAvailable ? "bg-primary text-cream" : "bg-red-100 text-red-700"}`}>{p.isAvailable ? "In stock" : "Sold out"}</button></td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <button onClick={() => setEditing({ id: p.id, name: p.name, price: p.price, categoryId: p.categoryId, image: p.image, description: p.description, ingredients: p.ingredients, isVeg: p.isVeg, isFeatured: p.isFeatured, isAvailable: p.isAvailable })} className="btn-press rounded-full p-2 hover:bg-paper"><Pencil size={15} /></button>
                              <button onClick={() => deleteProduct(p.id)} className="btn-press rounded-full p-2 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "categories" && (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-[1.25rem] border border-line bg-paper p-5 shadow">
                  <h3 className="font-medium">Add category</h3>
                  <div className="mt-3 space-y-2">
                    <input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} placeholder="Name" className={inputCls} />
                    <input value={newCat.emoji} onChange={(e) => setNewCat({ ...newCat, emoji: e.target.value })} placeholder="Emoji" className={inputCls} />
                    <input value={newCat.image} onChange={(e) => setNewCat({ ...newCat, image: e.target.value })} placeholder="Image URL" className={inputCls} />
                    <input value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} placeholder="Description" className={inputCls} />
                    <button onClick={addCategory} className="btn-press w-full rounded-full bg-primary py-2 text-sm font-semibold text-cream hover:bg-primary-dark">Add</button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                  {categories.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-[1.25rem] border border-line bg-paper p-4 shadow">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.image} alt="" className="photo h-16 w-16 rounded-[1.25rem] object-cover" />
                      <div className="flex-1"><p className="font-medium">{c.emoji} {c.name}</p><p className="text-xs text-muted">{c.productCount} products · /{c.slug}</p></div>
                      <button onClick={() => deleteCategory(c.id)} className="btn-press rounded-full p-2 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "users" && (
              <div className="overflow-x-auto rounded-[1.25rem] border border-line bg-paper shadow">
                <table className="w-full text-sm">
                  <thead className="bg-paper text-left text-xs uppercase tracking-widest text-muted">
                    <tr><th className="p-3">User</th><th className="p-3">Phone</th><th className="p-3">Orders</th><th className="p-3">Spent</th><th className="p-3">Role</th><th className="p-3">Joined</th><th className="p-3"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-gold/20">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3"><p className="font-semibold">{u.name}</p><p className="text-xs text-muted">{u.email}</p></td>
                        <td className="p-3">{u.phone || "—"}</td>
                        <td className="p-3">{u.orderCount}</td>
                        <td className="p-3 font-medium">{formatINR(Number(u.spent ?? 0))}</td>
                        <td className="p-3">
                          <select value={u.role} onChange={(e) => setRole(u.id, e.target.value)} className="rounded-lg border border-line bg-paper px-2 py-1 text-xs">
                            <option value="customer">customer</option><option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="p-3 text-xs text-muted">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="p-3">{u.id !== user.id && <button onClick={() => deleteUser(u.id)} className="btn-press rounded-full p-2 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "payments" && (
              <div className="overflow-x-auto rounded-[1.25rem] border border-line bg-paper shadow">
                <table className="w-full text-sm">
                  <thead className="bg-paper text-left text-xs uppercase tracking-widest text-muted">
                    <tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Provider</th><th className="p-3">Payment ID</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gold/20">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3 font-mono font-medium">{p.orderCode}</td>
                        <td className="p-3">{p.customerName}</td>
                        <td className="p-3 capitalize">{p.provider}</td>
                        <td className="p-3 font-mono text-xs">{p.providerPaymentId || "—"}</td>
                        <td className="p-3 font-medium">{formatINR(p.amount)}</td>
                        <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "paid" ? "bg-green-100 text-green-800" : p.status === "failed" ? "bg-red-100 text-red-700" : "bg-line text-neutral-800"}`}>{p.status}</span></td>
                        <td className="p-3 text-xs text-muted">{new Date(p.createdAt).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                    {payments.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted">No payments yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)} className="fixed inset-0 z-[80] bg-ink/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed left-1/2 top-1/2 z-[90] w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] bg-paper p-6 shadow-2xl">
              <div className="flex items-center justify-between"><h3 className="text-lg font-medium">{editing.id ? "Edit product" : "New product"}</h3><button onClick={() => setEditing(null)}><X size={20} /></button></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Name" className={`${inputCls} sm:col-span-2`} />
                <input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} placeholder="Price (₹)" className={inputCls} />
                <select value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: Number(e.target.value) })} className={inputCls}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="Image URL" className={`${inputCls} sm:col-span-2`} />
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Description" rows={2} className={`${inputCls} sm:col-span-2`} />
                <input value={editing.ingredients} onChange={(e) => setEditing({ ...editing, ingredients: e.target.value })} placeholder="Ingredients (comma separated)" className={`${inputCls} sm:col-span-2`} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.isVeg} onChange={(e) => setEditing({ ...editing, isVeg: e.target.checked })} /> Vegetarian</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.isFeatured} onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })} /> Featured</label>
              </div>
              <button onClick={saveProduct} className="btn-press mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-cream hover:bg-primary-dark">Save</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
