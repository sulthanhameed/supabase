/**
 * =====================================================================
 *  BACKEND ↔ FRONTEND CONNECTION FILE (Express side)
 * =====================================================================
 *  Mirrors  src/config/backend.ts  in the frontend.
 *
 *  FRONTEND_URL  — comma-separated list of frontend origins allowed by
 *                  CORS (credentials + Authorization header enabled).
 *                  e.g. FRONTEND_URL=https://khang.vercel.app,http://localhost:3000
 *  PORT          — Render injects this automatically.
 *  API_PREFIX    — all routes are mounted under /api (must match frontend).
 * =====================================================================
 */

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* Shared connection file (repo root ./connect.js) — env vars override it. */
const here = path.dirname(fileURLToPath(import.meta.url));
const connectFile = [path.resolve(here, "../connect.js"), path.resolve(here, "../../connect.js"), path.resolve(process.cwd(), "connect.js"), path.resolve(process.cwd(), "../connect.js")].find((p) => existsSync(p));
let connection = {};
try { if (connectFile) connection = createRequire(import.meta.url)(connectFile); } catch { connection = {}; }

export const PORT = process.env.PORT || 4000;
export const API_PREFIX = connection.apiPrefix || "/api";
export const OWNER_EMAIL_DEFAULT = connection.ownerEmail || "sultham456@gmail.com";

export const FRONTEND_ORIGINS = (process.env.FRONTEND_URL || connection.frontendUrl || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

export const corsOptions = {
  origin: (origin, cb) => {
    // allow server-to-server / curl (no Origin) and any whitelisted frontend
    if (!origin || FRONTEND_ORIGINS.includes("*") || FRONTEND_ORIGINS.includes(origin)) return cb(null, true);
    // also allow Vercel preview deployments of the same project
    if (/\.vercel\.app$/.test(new URL(origin).hostname) && FRONTEND_ORIGINS.some((o) => o.endsWith(".vercel.app"))) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
