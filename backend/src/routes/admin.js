import { Router } from "express";
import { q, mapProduct, mapCategory, hydrateOrders } from "../db.js";
import { requireAdmin } from "../auth.js";
import { slugify, wrap } from "../utils.js";

const r = Router();
r.use(requireAdmin);

const STATUSES = ["received", "preparing", "out_for_delivery", "delivered", "cancelled"];
const PRODUCT_SQL = `SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p JOIN categories c ON c.id = p.category_id`;

/* Products */
r.get("/products", wrap(async (_req, res) => {
  const { rows } = await q(`${PRODUCT_SQL} ORDER BY c.sort_order, p.id`);
  res.json({ products: rows.map(mapProduct) });
}));
r.post("/products", wrap(async (req, res) => {
  const b = req.body ?? {};
  if (!b.name || !b.price || !b.categoryId || !b.image) return res.status(400).json({ error: "name, price, categoryId and image are required" });
  const { rows } = await q(
    `INSERT INTO products (name, slug, description, ingredients, price, image, category_id, rating, reviews_count, is_featured, is_veg, is_available)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [String(b.name), `${slugify(b.name)}-${Date.now().toString(36)}`, String(b.description ?? ""), String(b.ingredients ?? ""), Math.round(Number(b.price)), String(b.image),
     Number(b.categoryId), Number(b.rating ?? 4.5), Number(b.reviewsCount ?? 0), !!b.isFeatured, !!b.isVeg, b.isAvailable === undefined ? true : !!b.isAvailable],
  );
  res.status(201).json({ product: mapProduct(rows[0]) });
}));
r.patch("/products/:id", wrap(async (req, res) => {
  const b = req.body ?? {};
  const map = { name: "name", description: "description", ingredients: "ingredients", price: "price", image: "image", categoryId: "category_id", rating: "rating", isFeatured: "is_featured", isVeg: "is_veg", isAvailable: "is_available" };
  const sets = []; const vals = [Number(req.params.id)];
  for (const [k, col] of Object.entries(map)) if (b[k] !== undefined) { vals.push(k === "price" ? Math.round(Number(b[k])) : b[k]); sets.push(`${col} = $${vals.length}`); }
  if (sets.length === 0) return res.status(400).json({ error: "Nothing to update" });
  const { rows } = await q(`UPDATE products SET ${sets.join(", ")} WHERE id = $1 RETURNING *`, vals);
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json({ product: mapProduct(rows[0]) });
}));
r.delete("/products/:id", wrap(async (req, res) => { await q("DELETE FROM products WHERE id = $1", [Number(req.params.id)]); res.json({ ok: true }); }));

/* Categories */
r.get("/categories", wrap(async (_req, res) => {
  const { rows } = await q(`SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count FROM categories c ORDER BY c.sort_order`);
  res.json({ categories: rows.map(mapCategory) });
}));
r.post("/categories", wrap(async (req, res) => {
  const b = req.body ?? {};
  if (!b.name || !b.image) return res.status(400).json({ error: "name and image are required" });
  const { rows } = await q("INSERT INTO categories (name, slug, emoji, image, description, sort_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [String(b.name), slugify(b.name), String(b.emoji ?? "🍜"), String(b.image), b.description ? String(b.description) : null, Number(b.sortOrder ?? 99)]);
  res.status(201).json({ category: mapCategory(rows[0]) });
}));
r.patch("/categories/:id", wrap(async (req, res) => {
  const b = req.body ?? {};
  const map = { name: "name", emoji: "emoji", image: "image", description: "description", sortOrder: "sort_order" };
  const sets = []; const vals = [Number(req.params.id)];
  for (const [k, col] of Object.entries(map)) if (b[k] !== undefined) { vals.push(b[k]); sets.push(`${col} = $${vals.length}`); }
  if (sets.length === 0) return res.status(400).json({ error: "Nothing to update" });
  const { rows } = await q(`UPDATE categories SET ${sets.join(", ")} WHERE id = $1 RETURNING *`, vals);
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json({ category: mapCategory(rows[0]) });
}));
r.delete("/categories/:id", wrap(async (req, res) => { await q("DELETE FROM categories WHERE id = $1", [Number(req.params.id)]); res.json({ ok: true }); }));

/* Orders + tracking */
r.get("/orders", wrap(async (_req, res) => {
  const { rows } = await q("SELECT * FROM orders ORDER BY created_at DESC");
  res.json({ orders: await hydrateOrders(rows) });
}));
r.patch("/orders/:id", wrap(async (req, res) => {
  const b = req.body ?? {};
  const id = Number(req.params.id);
  if (b.status !== undefined && !STATUSES.includes(b.status)) return res.status(400).json({ error: "Invalid status" });
  const { rows } = await q("UPDATE orders SET status = COALESCE($2, status), payment_status = COALESCE($3, payment_status), updated_at = NOW() WHERE id = $1 RETURNING *", [id, b.status ?? null, b.paymentStatus ?? null]);
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  if (b.status !== undefined) await q("INSERT INTO tracking (order_id, status, note) VALUES ($1,$2,$3)", [id, b.status, b.note ? String(b.note) : null]);
  res.json({ order: (await hydrateOrders(rows))[0] });
}));

/* Users */
r.get("/users", wrap(async (_req, res) => {
  const { rows } = await q(`SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at, COUNT(o.id)::int AS order_count, COALESCE(SUM(o.total),0)::int AS spent
    FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id ORDER BY u.created_at DESC`);
  res.json({ users: rows.map((u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: u.created_at, orderCount: u.order_count, spent: String(u.spent) })) });
}));
r.patch("/users/:id", wrap(async (req, res) => {
  const id = Number(req.params.id); const { role } = req.body ?? {};
  if (!["admin", "customer"].includes(role)) return res.status(400).json({ error: "Invalid role" });
  if (id === req.user.id && role !== "admin") return res.status(400).json({ error: "You cannot demote yourself" });
  const { rows } = await q("UPDATE users SET role = $2 WHERE id = $1 RETURNING id, role", [id, role]);
  res.json({ user: rows[0] });
}));
r.delete("/users/:id", wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: "You cannot delete yourself" });
  await q("DELETE FROM users WHERE id = $1", [id]); res.json({ ok: true });
}));

/* Payments */
r.get("/payments", wrap(async (_req, res) => {
  const { rows } = await q(`SELECT p.id, o.order_code, o.customer_name, p.provider, p.provider_order_id, p.provider_payment_id, p.amount, p.currency, p.status, p.created_at
    FROM payments p JOIN orders o ON o.id = p.order_id ORDER BY p.created_at DESC`);
  res.json({ payments: rows.map((p) => ({ id: p.id, orderCode: p.order_code, customerName: p.customer_name, provider: p.provider, providerOrderId: p.provider_order_id, providerPaymentId: p.provider_payment_id, amount: p.amount, currency: p.currency, status: p.status, createdAt: p.created_at })) });
}));

export default r;
