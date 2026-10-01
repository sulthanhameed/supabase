/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║        KHANG — FRONTEND ↔ BACKEND CONNECTION FILE                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 *  This ONE file joins the two apps.
 *
 *    frontend/  (React / Next.js → Vercel)   reads  backendUrl
 *    backend/   (Express API   → Render)     reads  frontendUrl  (CORS)
 *
 *  ── HOW TO USE ────────────────────────────────────────────────────
 *  1. Deploy backend/ on Render → copy its URL
 *  2. Deploy frontend/ on Vercel → copy its URL
 *  3. Fill both values below and redeploy (or run `npm run connect`
 *     to write them into frontend/.env.production and backend/.env)
 *
 *  Environment variables always win over this file:
 *    NEXT_PUBLIC_API_URL  (frontend)   FRONTEND_URL  (backend)
 *  Leave backendUrl empty to run frontend + built-in API on one server.
 * ─────────────────────────────────────────────────────────────────────
 */

const connection = {
  /** Express backend on Render — e.g. "https://khang-backend.onrender.com" */
  backendUrl: "",

  /** React frontend on Vercel — e.g. "https://khang.vercel.app" (comma-separate extras) */
  frontendUrl: "http://localhost:3000",

  /** All API routes are mounted here on the backend (do not change) */
  apiPrefix: "/api",

  /** Where order confirmation e-mails are sent (in addition to the customer) */
  ownerEmail: "sultham456@gmail.com",
};

/* Resolved values (env overrides file) */
connection.resolvedBackendUrl = (process.env.NEXT_PUBLIC_API_URL || connection.backendUrl || "").replace(/\/$/, "");
connection.resolvedFrontendUrl = process.env.FRONTEND_URL || connection.frontendUrl;

module.exports = connection;
