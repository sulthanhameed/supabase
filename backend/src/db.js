import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { CATEGORY_SEED, PRODUCT_SEED, REVIEW_SEED } from "./seed-data.js";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required (e.g. postgres://user:pass@host:5432/db)");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render / Neon / Supabase require SSL; local Postgres does not.
  ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false },
});

export const q = (text, params) => pool.query(text, params);

/** Creates tables (idempotent) and seeds the menu + admin on first boot. */
export async function initDb() {
  // schema.sql is bundled inside backend/ so the service works with Root Directory = backend
  const candidates = [
    path.resolve(__dirname, "../schema.sql"),              // backend/schema.sql  (always present)
    path.resolve(__dirname, "../../database/schema.sql"),  // repo-root database/schema.sql
    path.resolve(process.cwd(), "schema.sql"),
  ];
  const schemaFile = candidates.find((f) => fs.existsSync(f));
  if (!schemaFile) throw new Error("schema.sql not found — expected at backend/schema.sql");
  const sql = fs.readFileSync(schemaFile, "utf8");
  await q(sql);

  const { rows: [{ count: catCount }] } = await q("SELECT COUNT(*)::int AS count FROM categories");
  if (catCount === 0) {
    const bySlug = new Map();
    for (const c of CATEGORY_SEED) {
      const { rows } = await q(
        "INSERT INTO categories (name, slug, emoji, image, description, sort_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
        [c.name, c.slug, c.emoji, c.image, c.description, c.sortOrder],
      );
      bySlug.set(c.slug, rows[0].id);
    }
    for (const p of PRODUCT_SEED) {
      await q(
        `INSERT INTO products (name, slug, description, ingredients, price, image, category_id, rating, reviews_count, is_featured, is_veg)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [p.name, p.slug, p.description, p.ingredients, p.price, p.image, bySlug.get(p.category), p.rating, p.reviewsCount, !!p.isFeatured, !!p.isVeg],
      );
    }
    console.log(`[db] seeded ${CATEGORY_SEED.length} categories, ${PRODUCT_SEED.length} products`);
  }

  const { rows: [{ count: revCount }] } = await q("SELECT COUNT(*)::int AS count FROM reviews");
  if (revCount === 0) {
    for (const r of REVIEW_SEED) {
      await q("INSERT INTO reviews (name, rating, comment) VALUES ($1,$2,$3)", [r.name, r.rating, r.comment]);
    }
  }

  const { rows: [{ count: userCount }] } = await q("SELECT COUNT(*)::int AS count FROM users");
  if (userCount === 0) {
    const email = process.env.ADMIN_EMAIL || "admin@khang.com";
    const pass = process.env.ADMIN_PASSWORD || "admin123";
    await q("INSERT INTO users (name, email, password_hash, role, phone) VALUES ($1,$2,$3,'admin',$4)", [
      "Khang Admin", email, await bcrypt.hash(pass, 10), "+91 90000 00000",
    ]);
    console.log(`[db] created admin ${email}`);
  }
}

/* ---------- Row mappers (snake_case → camelCase) ---------- */
export const mapProduct = (r) => ({
  id: r.id, name: r.name, slug: r.slug, description: r.description, ingredients: r.ingredients, price: r.price, image: r.image,
  categoryId: r.category_id, categoryName: r.category_name, categorySlug: r.category_slug, rating: Number(r.rating),
  reviewsCount: r.reviews_count, isFeatured: r.is_featured, isVeg: r.is_veg, isAvailable: r.is_available, createdAt: r.created_at,
});
export const mapCategory = (r) => ({
  id: r.id, name: r.name, slug: r.slug, emoji: r.emoji, image: r.image, description: r.description, sortOrder: r.sort_order,
  productCount: r.product_count !== undefined ? Number(r.product_count) : undefined,
});
export const mapUser = (r) => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, address: r.address, role: r.role, createdAt: r.created_at });
export const mapReview = (r) => ({ id: r.id, productId: r.product_id, userId: r.user_id, name: r.name, rating: r.rating, comment: r.comment, createdAt: r.created_at });

export async function hydrateOrders(rows) {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const { rows: items } = await q("SELECT * FROM order_items WHERE order_id = ANY($1)", [ids]);
  const { rows: tracks } = await q("SELECT * FROM tracking WHERE order_id = ANY($1) ORDER BY created_at ASC", [ids]);
  return rows.map((o) => ({
    id: o.id, orderCode: o.order_code, userId: o.user_id, customerName: o.customer_name, phone: o.phone, email: o.email, address: o.address,
    notes: o.notes, subtotal: o.subtotal, tax: o.tax, deliveryFee: o.delivery_fee, total: o.total, paymentMethod: o.payment_method,
    paymentStatus: o.payment_status, status: o.status, createdAt: o.created_at, updatedAt: o.updated_at,
    items: items.filter((i) => i.order_id === o.id).map((i) => ({ id: i.id, productId: i.product_id, name: i.name, image: i.image, price: i.price, quantity: i.quantity })),
    tracking: tracks.filter((t) => t.order_id === o.id).map((t) => ({ id: t.id, status: t.status, note: t.note, createdAt: t.created_at })),
  }));
}

export async function getOrderByCode(code) {
  const { rows } = await q("SELECT * FROM orders WHERE order_code = $1 LIMIT 1", [String(code).toUpperCase()]);
  if (!rows[0]) return null;
  return (await hydrateOrders(rows))[0];
}
