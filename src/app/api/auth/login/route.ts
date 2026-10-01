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
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) return Response.json({ error: "Email and password are required" }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const token = await signToken({ sub: String(user.id), role: user.role, email: user.email, name: user.name });
  await setAuthCookie(token);
  return Response.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address },
    token,
  });
}
