import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  if (!["admin", "customer"].includes(b.role)) return Response.json({ error: "Invalid role" }, { status: 400 });
  if (Number(id) === admin.id && b.role !== "admin") return Response.json({ error: "You cannot demote yourself" }, { status: 400 });
  const [row] = await db.update(users).set({ role: b.role }).where(eq(users.id, Number(id))).returning({ id: users.id, role: users.role });
  return Response.json({ user: row });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  if (Number(id) === admin.id) return Response.json({ error: "You cannot delete yourself" }, { status: 400 });
  await db.delete(users).where(eq(users.id, Number(id)));
  return Response.json({ ok: true });
}
