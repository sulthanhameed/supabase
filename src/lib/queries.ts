import { db } from "@/db";
import { categories, orderItems, orders, products, tracking } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { asc, desc, eq, inArray } from "drizzle-orm";
import type { OrderDTO, ProductDTO } from "@/lib/types";

export async function listProducts(opts: { category?: string; featured?: boolean; search?: string } = {}) {
  await ensureSeeded();
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      ingredients: products.ingredients,
      price: products.price,
      image: products.image,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      rating: products.rating,
      reviewsCount: products.reviewsCount,
      isFeatured: products.isFeatured,
      isVeg: products.isVeg,
      isAvailable: products.isAvailable,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(categories.sortOrder), asc(products.id));

  let result: ProductDTO[] = rows;
  if (opts.category) result = result.filter((p) => p.categorySlug === opts.category);
  if (opts.featured) result = result.filter((p) => p.isFeatured);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q),
    );
  }
  return result;
}

export async function listCategories() {
  await ensureSeeded();
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  const prods = await db.select({ categoryId: products.categoryId }).from(products);
  const counts = new Map<number, number>();
  for (const p of prods) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
  return cats.map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }));
}

export async function getOrderByCode(code: string): Promise<OrderDTO | null> {
  const [order] = await db.select().from(orders).where(eq(orders.orderCode, code.toUpperCase())).limit(1);
  if (!order) return null;
  return hydrateOrders([order]).then((r) => r[0]);
}

export async function hydrateOrders(rows: (typeof orders.$inferSelect)[]): Promise<OrderDTO[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, ids));
  const tracks = await db.select().from(tracking).where(inArray(tracking.orderId, ids)).orderBy(asc(tracking.createdAt));
  return rows.map((o) => ({
    id: o.id,
    orderCode: o.orderCode,
    customerName: o.customerName,
    phone: o.phone,
    email: o.email,
    address: o.address,
    notes: o.notes,
    subtotal: o.subtotal,
    tax: o.tax,
    deliveryFee: o.deliveryFee,
    total: o.total,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    status: o.status as OrderDTO["status"],
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: items
      .filter((i) => i.orderId === o.id)
      .map((i) => ({ id: i.id, productId: i.productId, name: i.name, image: i.image, price: i.price, quantity: i.quantity })),
    tracking: tracks
      .filter((t) => t.orderId === o.id)
      .map((t) => ({ id: t.id, status: t.status, note: t.note, createdAt: t.createdAt.toISOString() })),
  }));
}

export async function listOrdersForUser(userId: number) {
  const rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  return hydrateOrders(rows);
}

export async function listAllOrders() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return hydrateOrders(rows);
}
