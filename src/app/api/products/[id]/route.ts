import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await ensureSeeded();
  const [product] = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  const productReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, product.id))
    .orderBy(desc(reviews.createdAt))
    .limit(10);
  return Response.json({ product, reviews: productReviews });
}
