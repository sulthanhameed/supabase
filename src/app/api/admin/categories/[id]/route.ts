import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  const patch: Partial<typeof categories.$inferInsert> = {};
  if (b.name !== undefined) patch.name = String(b.name);
  if (b.emoji !== undefined) patch.emoji = String(b.emoji);
  if (b.image !== undefined) patch.image = String(b.image);
  if (b.description !== undefined) patch.description = String(b.description);
  if (b.sortOrder !== undefined) patch.sortOrder = Number(b.sortOrder);
  const [row] = await db.update(categories).set(patch).where(eq(categories.id, Number(id))).returning();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ category: row });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await db.delete(categories).where(eq(categories.id, Number(id)));
  return Response.json({ ok: true });
}
