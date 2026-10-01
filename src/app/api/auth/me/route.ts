import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const [updated] = await db
    .update(users)
    .set({
      name: body.name ? String(body.name).trim() : user.name,
      phone: body.phone !== undefined ? String(body.phone).trim() : user.phone,
      address: body.address !== undefined ? String(body.address).trim() : user.address,
    })
    .where(eq(users.id, user.id))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role, phone: users.phone, address: users.address });
  return Response.json({ user: updated });
}
