import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE = "khang_token";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "khang-dev-secret-change-me-in-production",
);

export type JwtPayload = { sub: string; role: string; email: string; name: string };

export async function signToken(payload: JwtPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.set(COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getSession(req?: Request): Promise<JwtPayload | null> {
  // Support both cookie auth and Bearer tokens (for a separately hosted frontend)
  const header = req?.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return verifyToken(header.slice(7));
  }
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser(req?: Request) {
  const session = await getSession(req);
  if (!session) return null;
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      address: users.address,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, Number(session.sub)))
    .limit(1);
  return user ?? null;
}

export async function requireAdmin(req?: Request) {
  const user = await getCurrentUser(req);
  if (!user || user.role !== "admin") return null;
  return user;
}
