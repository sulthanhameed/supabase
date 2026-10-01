# 🥢 Khang Chinese Restaurant & Dimsum

Full-stack food ordering platform — **ONE Next.js app** (frontend + built-in REST API) with a **Supabase Postgres backend**.

```
├── supabase/        ← Supabase backend project (migrations + seed data)
│   ├── config.toml          Supabase CLI configuration
│   ├── migrations/…init.sql full database schema
│   └── seed.sql             menu, reviews + admin account
├── src/
│   ├── app/         ← Next.js: pages + built-in API routes (src/app/api/**)
│   ├── db/          ← database client, schema (Drizzle) + auto-bootstrap/seed
│   └── lib/         ← auth (JWT), e-mail/SMS, Razorpay, queries
└── package.json     ← ONE app: npm run dev / build / start
```

## How it works

Everything runs in **one deployment**. The Next.js app serves the website and
its own API routes (`/api/products`, `/api/orders`, `/api/auth/*`,
`/api/admin/*`, …). Those routes talk to **Supabase Postgres** through a
single `DATABASE_URL`. No separate backend server, no CORS setup.

On the very first request the app creates the tables and seeds the menu +
admin account by itself (same SQL as `supabase/migrations/`), so a fresh
Supabase project needs **zero manual SQL** — although you can apply the
migration yourself via the Supabase CLI or SQL Editor if you prefer.

## Deploy (exact steps in **DEPLOY.md**)

| Part | Host | What |
|---|---|---|
| Backend (Postgres) | **Supabase** | create project → copy the **Session pooler** connection URI → that's `DATABASE_URL` |
| App (frontend + API) | **Vercel** (or any Node host) | import the repo (root directory = repo root) → set env vars → deploy |

Required environment variables: `DATABASE_URL` (Supabase URI) and `JWT_SECRET`.
Optional: `SMTP_*` (order e-mails), `RAZORPAY_*` (online payments), `FAST2SMS_API_KEY` (SMS), `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

## Commands (repo root)

| Command | What it does |
|---|---|
| `npm run dev` | App on http://localhost:3000 (uses `DATABASE_URL` from `.env`) |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript check |
| `npm run db:push` | Apply `src/db/schema.ts` to the DB (Drizzle Kit — alternative to the Supabase CLI) |
| `npm run db:studio` | Browse the database in a local UI |
| `supabase db push` | Apply `supabase/migrations/*` via the Supabase CLI |

Node **22** is required (`.nvmrc`). Use **npm** (`package-lock.json`).

## Verify after deploying

* `https://<your-app>.vercel.app/api/health` → `{"ok":true}`
* `https://<your-app>.vercel.app/api/connection` → `{"mode":"built-in","database":"supabase","ok":true}`
* Admin login: `admin@khang.com` / `admin123` — **change this immediately**.
