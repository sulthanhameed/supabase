import jwt from "jsonwebtoken";
import { q, mapUser } from "./db.js";

const SECRET = process.env.JWT_SECRET || "khang-dev-secret-change-me";

export const signToken = (user) => jwt.sign({ sub: String(user.id), role: user.role, email: user.email, name: user.name }, SECRET, { expiresIn: "7d" });

/** Attaches req.user (or null). Accepts `Authorization: Bearer <token>` or the khang_token cookie. */
export async function attachUser(req, _res, next) {
  req.user = null;
  try {
    let token = null;
    const h = req.headers.authorization;
    if (h?.startsWith("Bearer ")) token = h.slice(7);
    else if (req.headers.cookie) {
      const m = req.headers.cookie.match(/(?:^|;\s*)khang_token=([^;]+)/);
      if (m) token = decodeURIComponent(m[1]);
    }
    if (token) {
      const payload = jwt.verify(token, SECRET);
      const { rows } = await q("SELECT * FROM users WHERE id = $1", [Number(payload.sub)]);
      if (rows[0]) req.user = mapUser(rows[0]);
    }
  } catch { /* invalid token → anonymous */ }
  next();
}

export const requireAuth = (req, res, next) => (req.user ? next() : res.status(401).json({ error: "Unauthorized" }));
export const requireAdmin = (req, res, next) => (req.user?.role === "admin" ? next() : res.status(403).json({ error: "Forbidden" }));

export function setAuthCookie(res, token) {
  const secure = process.env.NODE_ENV === "production";
  res.cookie?.("khang_token", token, { httpOnly: true, sameSite: secure ? "none" : "lax", secure, maxAge: 7 * 24 * 3600 * 1000, path: "/" });
}
