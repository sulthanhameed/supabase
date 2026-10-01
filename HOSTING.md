# 🥢 Khang — Hosting Guide (Frontend · Backend · Database separated)

> **Quick reference with exact Root Directory / Build / Start values: see `DEPLOY.md`.**

```
├── connect.js     JOIN FILE — backendUrl + frontendUrl, read by both apps
├── frontend/      FRONTEND  — React (Next.js) → deploy on Vercel (Root Directory: frontend)
├── backend/       BACKEND   — Node.js + Express REST API → deploy on Render (Root Directory: backend)
└── database/      DATABASE  — PostgreSQL schema + seed → Render Postgres / Neon / Supabase
```

The three parts talk **only over HTTPS/REST** — the frontend never opens a DB connection when
`NEXT_PUBLIC_API_URL` is set.

---

## 1 · Database
Create a PostgreSQL instance (Render Postgres free tier is fine). Copy the **External Connection String**.
Optional manual setup: `psql "$DATABASE_URL" -f database/schema.sql && psql "$DATABASE_URL" -f database/seed.sql`
(the backend does this automatically on first boot).

## 2 · Backend → Render
See `backend/README.md`. Minimum env vars on Render:

| Var | Value |
|---|---|
| `DATABASE_URL` | from step 1 |
| `JWT_SECRET` | any long random string |
| `FRONTEND_URL` | your Vercel URL (CORS) |
| `OWNER_EMAIL` | `sultham456@gmail.com` |
| `SMTP_HOST/PORT/USER/PASS` | Gmail SMTP + App Password |
| `RAZORPAY_KEY_ID/SECRET` | from Razorpay dashboard |

Result: `https://khang-backend.onrender.com/api/health` → `{"ok":true}`

## 3 · Frontend → Vercel
1. Import the repo on Vercel → **Root Directory: `frontend`** (framework auto-detects Next.js).
2. Add env var **`NEXT_PUBLIC_API_URL = https://khang-backend.onrender.com`** (your Render URL, no trailing slash).
3. Deploy. Then go back to Render and set `FRONTEND_URL` to the Vercel domain so CORS allows it.

That's it — menu, cart, checkout (Razorpay), tracking, auth, profile and admin all run against the Render API.

### The connection files
| Side | File | What it holds |
|---|---|---|
| **Both** | **`connect.js`** (repo root) | `backendUrl`, `frontendUrl`, `apiPrefix`, `ownerEmail` — fill once, `npm run connect` |
| Frontend | **`src/config/backend.ts`** | `BACKEND_URL` (from `NEXT_PUBLIC_API_URL`), `apiUrl()`, token key, every endpoint name |
| Backend | **`backend/src/config.js`** | `FRONTEND_ORIGINS` (from `FRONTEND_URL`) → CORS whitelist, `API_PREFIX` |

Check the link any time:
* Browser → `https://<frontend>/api/connection` → `{"mode":"remote","backend":"…","ok":true}`
* Terminal → `cd backend && npm run check -- https://<backend>.onrender.com https://<frontend>.vercel.app`
* Admin dashboard shows a live "Backend: … · ms" badge.

### How the frontend connects
* Browser calls: `src/lib/api.ts` → `${NEXT_PUBLIC_API_URL}/api/...` with `Authorization: Bearer <JWT>` (token stored in localStorage after login).
* Server-rendered pages (home, menu, top foods, order page): `src/lib/data.ts` → same REST API.
* If `NEXT_PUBLIC_API_URL` is empty, the built-in API routes under `src/app/api` are used instead (single-app deployment).

---

## Alternative: single deployment
Deploy the repo root to Vercel/Render **with** `DATABASE_URL` and the SMTP/Razorpay vars, and leave
`NEXT_PUBLIC_API_URL` empty. The Next.js app then serves both the UI and the API.

## Feature checklist
- [x] React frontend, REST-connected to Express backend
- [x] PostgreSQL models: Users, Products, Categories, Orders, OrderItems, Payments, Reviews, Tracking
- [x] Signup / login (emails + bcrypt hashes stored in `users`), JWT, profile, order history
- [x] Menu, categories, food detail modal, cart drawer, quantity, totals (5% GST, delivery, free ≥ ₹499)
- [x] Checkout: UPI / Cards / Wallets via **Razorpay** (order creation + signature verification) and COD
- [x] Order ID generation, success page, live tracking (Received → Preparing → Out for delivery → Delivered)
- [x] Order confirmation **email to customer + sultham456@gmail.com** (Nodemailer) and SMS (Fast2SMS)
- [x] Admin dashboard: products, categories, orders + tracking updates, users, payments
- [x] Chef's Surprise, reviews, top foods, responsive glassmorphic UI, animations
