import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { setAuthCookie, signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await ensureSeeded();
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const phone = body?.phone ? String(body.phone).trim() : null;

  if (!name || !email || password.length < 6) {
    return Response.json({ error: "Name, valid email and a 6+ character password are required" }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email" }, { status: 400 });
  }
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return Response.json({ error: "An account with this email already exists" }, { status: 409 });

  const [user] = await db
    .insert(users)
    .values({ name, email, phone, passwordHash: await bcrypt.hash(password, 10) })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role, phone: users.phone, address: users.address });

  const token = await signToken({ sub: String(user.id), role: user.role, email: user.email, name: user.name });
  await setAuthCookie(token);
  return Response.json({ user, token }, { status: 201 });
}
