import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq, isNull, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const productId = req.nextUrl.searchParams.get("productId");
  const rows = await db
    .select()
    .from(reviews)
    .where(productId ? eq(reviews.productId, Number(productId)) : isNull(reviews.productId))
    .orderBy(desc(reviews.createdAt))
    .limit(20);
  return Response.json({ reviews: rows, summary: { rating: 4.6, count: 583 } });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.comment || !body.rating) {
    return Response.json({ error: "rating and comment are required" }, { status: 400 });
  }
  const user = await getCurrentUser(req);
  const rating = Math.min(5, Math.max(1, Number(body.rating)));
  const [row] = await db
    .insert(reviews)
    .values({
      productId: body.productId ? Number(body.productId) : null,
      userId: user?.id ?? null,
      name: user?.name || body.name || "Guest",
      rating,
      comment: String(body.comment).slice(0, 600),
    })
    .returning();
  if (row.productId) {
    await db
      .update(products)
      .set({
        reviewsCount: sql`${products.reviewsCount} + 1`,
        rating: sql`ROUND(((${products.rating} * ${products.reviewsCount}) + ${rating})::numeric / (${products.reviewsCount} + 1), 1)`,
      })
      .where(eq(products.id, row.productId));
  }
  return Response.json({ review: row }, { status: 201 });
}
