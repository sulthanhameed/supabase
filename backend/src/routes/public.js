import { Router } from "express";
import bcrypt from "bcryptjs";
import { q, mapProduct, mapCategory, mapUser, mapReview, getOrderByCode, hydrateOrders } from "../db.js";
import { signToken, setAuthCookie, requireAuth } from "../auth.js";
import { calcTotals, generateOrderCode, wrap } from "../utils.js";
import { createRazorpayOrder, razorpayConfigured, razorpayKeyId, verifyRazorpaySignature } from "../razorpay.js";
import { sendOrderEmails, sendOrderSms } from "../notify.js";

const r = Router();

const PRODUCT_SQL = `SELECT p.*, c.name AS category_name, c.slug AS category_slug
  FROM products p JOIN categories c ON c.id = p.category_id`;

/* ---------- Products ---------- */
r.get("/products", wrap(async (req, res) => {
  const { rows } = await q(`${PRODUCT_SQL} ORDER BY c.sort_order ASC, p.id ASC`);
  let list = rows.map(mapProduct);
  if (req.query.category) list = list.filter((p) => p.categorySlug === req.query.category);
  if (req.query.featured === "true") list = list.filter((p) => p.isFeatured);
  if (req.query.q) {
    const s = String(req.query.q).toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.categoryName?.toLowerCase().includes(s));
  }
  if (req.query.random === "true") return res.json({ product: list[Math.floor(Math.random() * list.length)] });
  res.json({ products: list });
}));

r.get("/products/:id", wrap(async (req, res) => {
  const { rows } = await q(`${PRODUCT_SQL} WHERE p.id = $1`, [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  const { rows: reviews } = await q("SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC LIMIT 10", [rows[0].id]);
  res.json({ product: mapProduct(rows[0]), reviews: reviews.map(mapReview) });
}));

/* ---------- Categories ---------- */
r.get("/categories", wrap(async (_req, res) => {
  const { rows } = await q(`SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count FROM categories c ORDER BY c.sort_order ASC`);
  res.json({ categories: rows.map(mapCategory) });
}));

/* ---------- Reviews ---------- */
r.get("/reviews", wrap(async (req, res) => {
  const pid = req.query.productId ? Number(req.query.productId) : null;
  const { rows } = pid
    ? await q("SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC LIMIT 20", [pid])
    : await q("SELECT * FROM reviews WHERE product_id IS NULL ORDER BY created_at DESC LIMIT 20");
  res.json({ reviews: rows.map(mapReview), summary: { rating: 4.6, count: 583 } });
}));

r.post("/reviews", wrap(async (req, res) => {
  const { productId, name, rating, comment } = req.body ?? {};
  if (!comment || !rating) return res.status(400).json({ error: "rating and comment are required" });
  const rt = Math.min(5, Math.max(1, Number(rating)));
  const { rows } = await q(
    "INSERT INTO reviews (product_id, user_id, name, rating, comment) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [productId ? Number(productId) : null, req.user?.id ?? null, req.user?.name || name || "Guest", rt, String(comment).slice(0, 600)],
  );
  if (rows[0].product_id) {
    await q(`UPDATE products SET reviews_count = reviews_count + 1,
             rating = ROUND(((rating * reviews_count) + $2)::numeric / (reviews_count + 1), 1)
             WHERE id = $1`, [rows[0].product_id, rt]);
  }
  res.status(201).json({ review: mapReview(rows[0]) });
}));

/* ---------- Auth ---------- */
r.post("/auth/signup", wrap(async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  const phone = req.body?.phone ? String(req.body.phone).trim() : null;
  if (!name || !email || password.length < 6) return res.status(400).json({ error: "Name, valid email and a 6+ character password are required" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Please enter a valid email" });
  const { rows: existing } = await q("SELECT id FROM users WHERE email = $1", [email]);
  if (existing[0]) return res.status(409).json({ error: "An account with this email already exists" });
  const { rows } = await q("INSERT INTO users (name, email, phone, password_hash) VALUES ($1,$2,$3,$4) RETURNING *", [name, email, phone, await bcrypt.hash(password, 10)]);
  const user = mapUser(rows[0]);
  const token = signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ user, token });
}));

r.post("/auth/login", wrap(async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  const { rows } = await q("SELECT * FROM users WHERE email = $1", [email]);
  if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) return res.status(401).json({ error: "Invalid email or password" });
  const user = mapUser(rows[0]);
  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ user, token });
}));

r.post("/auth/logout", (_req, res) => { res.clearCookie?.("khang_token", { path: "/" }); res.json({ ok: true }); });

r.get("/auth/me", (req, res) => (req.user ? res.json({ user: req.user }) : res.status(401).json({ user: null })));

r.patch("/auth/me", requireAuth, wrap(async (req, res) => {
  const b = req.body ?? {};
  const { rows } = await q("UPDATE users SET name = $2, phone = $3, address = $4 WHERE id = $1 RETURNING *", [
    req.user.id,
    b.name ? String(b.name).trim() : req.user.name,
    b.phone !== undefined ? String(b.phone).trim() : req.user.phone,
    b.address !== undefined ? String(b.address).trim() : req.user.address,
  ]);
  res.json({ user: mapUser(rows[0]) });
}));

/* ---------- Orders ---------- */
r.get("/orders", requireAuth, wrap(async (req, res) => {
  const { rows } = await q("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]);
  res.json({ orders: await hydrateOrders(rows) });
}));

r.get("/orders/:code", wrap(async (req, res) => {
  const order = await getOrderByCode(decodeURIComponent(req.params.code).trim());
  if (!order) return res.status(404).json({ error: "Order not found. Please check your Order ID." });
  res.json({ order });
}));

r.post("/orders", wrap(async (req, res) => {
  const b = req.body ?? {};
  const customerName = String(b.customerName ?? "").trim();
  const phone = String(b.phone ?? "").trim();
  const address = String(b.address ?? "").trim();
  const email = b.email ? String(b.email).trim().toLowerCase() : null;
  const notes = b.notes ? String(b.notes).trim() : null;
  const paymentMethod = String(b.paymentMethod ?? "cod");
  const items = Array.isArray(b.items) ? b.items : [];

  if (!customerName || phone.replace(/\D/g, "").length < 10 || address.length < 8) return res.status(400).json({ error: "Please provide name, a valid phone number and full address" });
  if (items.length === 0) return res.status(400).json({ error: "Cart is empty" });
  if (!["upi", "card", "wallet", "cod"].includes(paymentMethod)) return res.status(400).json({ error: "Invalid payment method" });

  const ids = items.map((i) => Number(i.productId));
  const { rows: dbProducts } = await q("SELECT * FROM products WHERE id = ANY($1)", [ids]);
  const lineItems = items.map((i) => {
    const p = dbProducts.find((d) => d.id === Number(i.productId));
    return p ? { productId: p.id, name: p.name, image: p.image, price: p.price, quantity: Math.max(1, Math.min(20, Number(i.quantity) || 1)) } : null;
  }).filter(Boolean);
  if (lineItems.length === 0) return res.status(400).json({ error: "No valid items" });

  const totals = calcTotals(lineItems);
  const isOnline = paymentMethod !== "cod";
  const useRazorpay = isOnline && razorpayConfigured();

  let orderCode = generateOrderCode();
  for (let i = 0; i < 5 && (await getOrderByCode(orderCode)); i++) orderCode = generateOrderCode();

  const { rows: [order] } = await q(
    `INSERT INTO orders (order_code, user_id, customer_name, phone, email, address, notes, subtotal, tax, delivery_fee, total, payment_method, payment_status, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'received') RETURNING *`,
    [orderCode, req.user?.id ?? null, customerName, phone, email, address, notes, totals.subtotal, totals.tax, totals.deliveryFee, totals.total, paymentMethod,
     isOnline ? (useRazorpay ? "pending" : "paid") : "cod_pending"],
  );
  for (const li of lineItems) {
    await q("INSERT INTO order_items (order_id, product_id, name, image, price, quantity) VALUES ($1,$2,$3,$4,$5,$6)", [order.id, li.productId, li.name, li.image, li.price, li.quantity]);
  }
  await q("INSERT INTO tracking (order_id, status, note) VALUES ($1,'received','We have received your order.')", [order.id]);

  let razorpay = null;
  if (useRazorpay) {
    try {
      const rz = await createRazorpayOrder(totals.total, orderCode);
      await q("INSERT INTO payments (order_id, provider, provider_order_id, amount, status) VALUES ($1,'razorpay',$2,$3,'created')", [order.id, rz.id, totals.total]);
      razorpay = { keyId: razorpayKeyId(), orderId: rz.id, amount: rz.amount, currency: rz.currency };
    } catch (err) {
      console.error(err);
      return res.status(502).json({ error: "Payment gateway error. Please try again or choose Cash on Delivery." });
    }
  } else {
    await q("INSERT INTO payments (order_id, provider, amount, status) VALUES ($1,$2,$3,$4)", [order.id, isOnline ? "demo" : "cod", totals.total, isOnline ? "paid" : "pending"]);
    const emailData = { orderCode, customerName, phone, email, address, paymentMethod, paymentStatus: order.payment_status, ...totals, items: lineItems };
    sendOrderEmails(emailData).catch(() => {});
    sendOrderSms(phone, orderCode, totals.total).catch(() => {});
  }

  res.status(201).json({ order: { id: order.id, orderCode, total: order.total, paymentStatus: order.payment_status }, razorpay });
}));

/* ---------- Payments (Razorpay) ---------- */
r.get("/payments/razorpay/config", (_req, res) => res.json({ configured: razorpayConfigured(), keyId: razorpayConfigured() ? razorpayKeyId() : null }));

r.post("/payments/razorpay/verify", wrap(async (req, res) => {
  const { orderCode, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ?? {};
  if (!orderCode || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: "Missing payment fields" });
  const order = await getOrderByCode(orderCode);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    await q("UPDATE payments SET status='failed', provider_payment_id=$2 WHERE provider_order_id=$1", [razorpay_order_id, razorpay_payment_id]);
    await q("UPDATE orders SET payment_status='failed', updated_at=NOW() WHERE id=$1", [order.id]);
    return res.status(400).json({ error: "Payment verification failed" });
  }
  await q("UPDATE payments SET status='paid', provider_payment_id=$2 WHERE provider_order_id=$1", [razorpay_order_id, razorpay_payment_id]);
  await q("UPDATE orders SET payment_status='paid', updated_at=NOW() WHERE id=$1", [order.id]);
  sendOrderEmails({ ...order, paymentStatus: "paid" }).catch(() => {});
  sendOrderSms(order.phone, order.orderCode, order.total).catch(() => {});
  res.json({ ok: true, orderCode: order.orderCode });
}));

export default r;
