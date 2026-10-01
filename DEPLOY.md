# 🚀 DEPLOY — Supabase (backend) + Vercel (app)

Two things to create, about 10 minutes total:

```
1) Supabase project   → gives you DATABASE_URL   (the backend: hosted Postgres)
2) Vercel project     → runs the whole Next.js app (website + built-in API)
```

---

## 1) Backend — create the Supabase project

1. Go to **[supabase.com](https://supabase.com)** → **New project**.
2. Name: `khang-restaurant` · pick a strong **database password** (save it!) ·
   Region: **Mumbai (ap-south-1)** — closest to India.
3. Wait ~2 min for the project to provision.

### Get the connection string (this is your `DATABASE_URL`)

**Project Settings → Database → Connection string → URI** and choose the
**Session pooler** (recommended — it works over IPv4 from Vercel):

```
postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

Replace `[YOUR-PASSWORD]` with the database password you chose.
> If the password contains special characters (like `@` or `#`), use the
> **percent-encoded** URI that the Supabase dashboard shows, or URL-encode them yourself.

### Create the tables (optional!)

Pick **one** — all three end with the same database:

| Option | How |
|---|---|
| **A · Do nothing (recommended)** | The app creates every table and seeds the menu + admin on the **first request** after you deploy. |
| B · Supabase SQL Editor | Open **SQL Editor → New query**, paste `supabase/migrations/20260101000000_init.sql`, **Run**; then paste `supabase/seed.sql`, **Run**. |
| C · Supabase CLI | `npm i -g supabase` → `supabase link --project-ref <your-ref>` → `supabase db push` |

---

## 2) App — deploy on Vercel

**Vercel → Add New → Project → import this repo**, then:

| Setting | Value |
|---|---|
| Framework Preset | Next.js (auto-detected) |
| **Root Directory** | **repo root** (leave as `./` — do NOT pick a subfolder) |
| Build Command | `npm run build` (default) |
| Install Command | `npm ci` (default) |
| Node.js Version | **22** (from `.nvmrc`) |

Environment variables (Production **and** Preview):

| Key | Value |
|---|---|
| `DATABASE_URL` | the Supabase **Session pooler URI** from step 1 |
| `JWT_SECRET` | any long random string (e.g. from `openssl rand -hex 32`) |
| `OWNER_EMAIL` | `sultham456@gmail.com` (gets order confirmations) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | `smtp.gmail.com` / `587` / `false` *(optional — e-mails)* |
| `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Gmail address / **App Password** / Gmail address |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | from the Razorpay dashboard *(optional — online payments)* |
| `FAST2SMS_API_KEY` | *(optional — order SMS)* |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@khang.com` / `admin123` (first-boot admin, change it!) |

Click **Deploy**.

> Do **not** set `NEXT_PUBLIC_API_URL` — the app uses its own built-in API.

---

## 3) Verify

| Check | Expected |
|---|---|
| `https://<your-app>.vercel.app/api/health` | `{"ok":true}` |
| `https://<your-app>.vercel.app/api/connection` | `{"mode":"built-in","database":"supabase","ok":true}` |
| Open the site | menu loads (tables + seed created on first request) |
| Admin login | `admin@khang.com` / `admin123` |

---

## Local development

```bash
cp .env.example .env         # fill DATABASE_URL (Supabase URI) + JWT_SECRET
npm install
npm run dev                  # http://localhost:3000
```

You can point `DATABASE_URL` at your hosted Supabase project, or run Postgres
locally with the Supabase CLI stack (`supabase start` → use the local URI it
prints, e.g. `postgresql://postgres:postgres@127.0.0.1:54322/postgres`).

Useful extras:

```bash
npm run db:studio            # browse the data (Drizzle Studio)
npx supabase db reset        # local Supabase stack: re-apply migration + seed
```

---

## Common failures & fixes

| Symptom | Cause | Fix |
|---|---|---|
| Build fails: `DATABASE_URL is required` | You set `NEXT_PUBLIC_API_URL` by mistake, or the error appears at runtime only | Don't set `NEXT_PUBLIC_API_URL`; make sure `DATABASE_URL` is set on Vercel |
| `password authentication failed for user postgres` | Password wrong / not URL-encoded | Reset the DB password in Supabase and re-copy the URI from the dashboard |
| `ENOTFOUND` / `connection timed out` | Using the **direct** `db.<ref>.supabase.com` host (IPv6-only) from Vercel | Use the **Session pooler** URI (`…pooler.supabase.com:5432`) |
| `no schema has been selected to create in` / permission errors | Wrong database in the URI | The URI must end in `/postgres` |
| `502`/`500` on `/api/health` | Supabase project paused (free tier after ~1 week idle) | Supabase dashboard → Restore project |
| Menu empty after deploy | First request still bootstrapping, or tables were created empty | Reload once; check Supabase → Table Editor; the app seeds itself only into an **empty** database |
| Login says invalid credentials | Admin account not created yet or password changed | First request creates `admin@khang.com` / `admin123` (or your `ADMIN_EMAIL`/`ADMIN_PASSWORD`) |
| E-mails not arriving | SMTP vars missing / not an App Password | Use a Gmail **App Password** in `SMTP_PASS` |
| Vercel: build works but pages error | Env vars added only to Preview, not Production | Add them to **Production** too and redeploy |
