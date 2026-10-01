import { db } from "@/db";
import { orders, tracking } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { hydrateOrders } from "@/lib/queries";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const STATUSES = ["received", "preparing", "out_for_delivery", "delivered", "cancelled"];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  const patch: Partial<typeof orders.$inferInsert> = { updatedAt: new Date() };
  if (b.status !== undefined) {
    if (!STATUSES.includes(b.status)) return Response.json({ error: "Invalid status" }, { status: 400 });
    patch.status = b.status;
  }
  if (b.paymentStatus !== undefined) patch.paymentStatus = String(b.paymentStatus);
  const [row] = await db.update(orders).set(patch).where(eq(orders.id, Number(id))).returning();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  if (b.status !== undefined) {
    await db.insert(tracking).values({ orderId: row.id, status: b.status, note: b.note ? String(b.note) : null });
  }
  const [order] = await hydrateOrders([row]);
  return Response.json({ order });
}
