/**
 * =====================================================================
 *  FRONTEND ↔ BACKEND CONNECTION FILE
 * =====================================================================
 *
 *  This is the ONE place the React frontend learns where the Express
 *  backend lives. Everything else (src/lib/api.ts for browser calls,
 *  src/lib/data.ts for server-rendered pages) imports from here.
 *
 *  HOW TO CONNECT
 *  --------------
 *  1. Deploy `backend/` on Render  →  e.g. https://khang-backend.onrender.com
 *  2. Put that URL in the frontend env:
 *
 *        NEXT_PUBLIC_API_URL=https://khang-backend.onrender.com
 *
 *     (Vercel → Project → Settings → Environment Variables, or `.env` locally)
 *  3. On Render, set  FRONTEND_URL=https://<your-vercel-domain>  so CORS
 *     lets the browser call the API with the auth token.
 *
 *  If NEXT_PUBLIC_API_URL is empty the frontend uses its own built-in API
 *  routes (single-server mode) — handy for local preview.
 * =====================================================================
 */

/** Raw backend origin, no trailing slash. Empty string = built-in API. */
export const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

/** True when talking to a separately hosted Express backend. */
export const USE_REMOTE_BACKEND = BACKEND_URL.length > 0;

/** Every backend route is mounted under /api */
export const API_PREFIX = "/api";

/** Build a full URL for an API path, e.g. apiUrl("/products") */
export const apiUrl = (path: string) => `${BACKEND_URL}${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;

/** localStorage key for the JWT returned by /auth/login and /auth/signup */
export const TOKEN_STORAGE_KEY = "khang_token";

/** Named endpoints — keep in sync with backend/src/routes/*.js */
export const ENDPOINTS = {
  health: "/health",
  products: "/products",
  product: (id: number | string) => `/products/${id}`,
  categories: "/categories",
  reviews: "/reviews",
  auth: { signup: "/auth/signup", login: "/auth/login", logout: "/auth/logout", me: "/auth/me" },
  orders: "/orders",
  order: (code: string) => `/orders/${encodeURIComponent(code)}`,
  razorpay: { config: "/payments/razorpay/config", verify: "/payments/razorpay/verify" },
  admin: {
    products: "/admin/products",
    product: (id: number) => `/admin/products/${id}`,
    categories: "/admin/categories",
    category: (id: number) => `/admin/categories/${id}`,
    orders: "/admin/orders",
    order: (id: number) => `/admin/orders/${id}`,
    users: "/admin/users",
    user: (id: number) => `/admin/users/${id}`,
    payments: "/admin/payments",
  },
} as const;
