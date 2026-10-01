import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  const patch: Partial<typeof products.$inferInsert> = {};
  if (b.name !== undefined) patch.name = String(b.name);
  if (b.description !== undefined) patch.description = String(b.description);
  if (b.ingredients !== undefined) patch.ingredients = String(b.ingredients);
  if (b.price !== undefined) patch.price = Math.round(Number(b.price));
  if (b.image !== undefined) patch.image = String(b.image);
  if (b.categoryId !== undefined) patch.categoryId = Number(b.categoryId);
  if (b.rating !== undefined) patch.rating = Number(b.rating);
  if (b.isFeatured !== undefined) patch.isFeatured = Boolean(b.isFeatured);
  if (b.isVeg !== undefined) patch.isVeg = Boolean(b.isVeg);
  if (b.isAvailable !== undefined) patch.isAvailable = Boolean(b.isAvailable);
  const [row] = await db.update(products).set(patch).where(eq(products.id, Number(id))).returning();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ product: row });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await db.delete(products).where(eq(products.id, Number(id)));
  return Response.json({ ok: true });
}
