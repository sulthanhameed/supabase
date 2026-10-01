/**
 * =====================================================================
 *  FRONTEND ↔ BACKEND CONNECTION FILE
 * =====================================================================
 *
 *  This is the ONE place the React frontend learns where the API lives.
 *  Everything else (src/lib/api.ts for browser calls, src/lib/data.ts for
 *  server-rendered pages) imports from here.
 *
 *  HOW IT WORKS (Supabase all-in-one deployment)
 *  ----------------------------------------------
 *  NEXT_PUBLIC_API_URL is normally EMPTY. The app then uses its own
 *  built-in API routes (src/app/api/**) on the same server, which talk to
 *  the Supabase Postgres backend through DATABASE_URL. One deployment,
 *  nothing else to configure.
 *
 *  Set it to a full URL only if you ever host the API on a separate
 *  server:
 *
 *        NEXT_PUBLIC_API_URL=https://api.example.com
 * =====================================================================
 */

/** Raw backend origin, no trailing slash. Empty string = built-in API. */
export const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

/** True when talking to a separately hosted API. */
export const USE_REMOTE_BACKEND = BACKEND_URL.length > 0;

/** Every API route is mounted under /api */
export const API_PREFIX = "/api";

/** Build a full URL for an API path, e.g. apiUrl("/products") */
export const apiUrl = (path: string) => `${BACKEND_URL}${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;

/** localStorage key for the JWT returned by /auth/login and /auth/signup */
export const TOKEN_STORAGE_KEY = "khang_token";

/** Named endpoints — keep in sync with src/app/api/** */
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
