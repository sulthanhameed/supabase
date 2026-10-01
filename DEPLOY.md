# 🚀 DEPLOY — exact settings (copy these into Render / Vercel)

Repository layout (push the whole repo to GitHub):
```
repo/
├── render.yaml      ← Render Blueprint (root)  → backend + Postgres
├── connect.js       ← join file (backendUrl / frontendUrl)
├── backend/         ← Root Directory for the API service
├── frontend/        ← Root Directory for the website
└── database/        ← optional manual SQL
```

---

## 1) DATABASE + BACKEND on Render  (one click via Blueprint)

**Render → New → Blueprint → select repo → Apply.**  `render.yaml` creates `khang-db` (Postgres) and `khang-backend`.

If you create the Web Service manually instead, use exactly:

| Setting | Value |
|---|---|
| Runtime | Node |
| **Root Directory** | `backend` |
| **Build Command** | `npm run build`  (runs `bash build.sh` → `npm ci --omit=dev`) |
| **Start Command** | `npm start`  (runs `node start.js` → installs deps if missing → `server.js`) |
| Health Check Path | `/api/health` |
| Node version | **22** (`.nvmrc` / `NODE_VERSION=22`) |

Environment variables (Render → Environment):

| Key | Value |
|---|---|
| `DATABASE_URL` | Internal connection string of `khang-db` |
| `JWT_SECRET` | any long random string |
| `FRONTEND_URL` | `https://<your-app>.vercel.app` (add after step 2; comma-separate several) |
| `OWNER_EMAIL` | `sultham456@gmail.com` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | `smtp.gmail.com` / `587` / `false` |
| `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Gmail address / **App Password** / Gmail address |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | from Razorpay dashboard |
| `FAST2SMS_API_KEY` | optional |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@khang.com` / `admin123` (change!) |

✅ Test: `https://khang-backend.onrender.com/api/health` → `{"ok":true,...}`
Tables are created and the menu seeded automatically on first boot (no manual SQL needed).

---

## 2) FRONTEND on Vercel

**Vercel → Add New → Project → import repo**, then:

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| **Root Directory** | `frontend`  ← click *Edit* and pick the folder |
| **Install Command** | `npm ci` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` (leave default) |
| Node.js Version | **22** (from `frontend/.nvmrc`) |

Environment variable (Production + Preview):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://khang-backend.onrender.com`  (your Render URL, **no trailing slash**) |

> Do **not** add `DATABASE_URL` on Vercel — the frontend never touches the database.

✅ Test: `https://<your-app>.vercel.app/api/connection` → `{"mode":"remote","ok":true}`

---

## 3) Join them
1. Copy the Vercel URL → Render → `khang-backend` → Environment → `FRONTEND_URL` → Save (auto-redeploys).
2. (Optional) also write both URLs into `connect.js` and commit — both apps read it as a fallback.

---

## Frontend on Render instead of Vercel (alternative)
`frontend/render.yaml` is included. Manual settings: Root Directory `frontend`, Build `npm ci && npm run build`, Start `npm start`, env `NEXT_PUBLIC_API_URL`.

---

## Frontend on Render (if you host the website on Render instead of Vercel)
| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Build Command** | `npm ci && npm run build`  ← replace Render's default `yarn install; yarn build` |
| **Start Command** | `npm start` |
| Env | `NEXT_PUBLIC_API_URL=https://<backend>.onrender.com` |
| Node | 22 (auto from `frontend/.nvmrc`) |

## Common failures & fixes
| Symptom | Cause | Fix |
|---|---|---|
| **`Exited with status 127` · `next: not found` · `eslint-visitor-keys… The engine "node" is incompatible… Got "20.18.0"`** | Node 20.18 is too old for one dependency, so the install aborted and `next` was never installed | Fixed in repo: `.nvmrc` = **22** and `engines.node >= 20.19`. Pull the latest commit and redeploy. Also set Build Command to `npm ci && npm run build` (yarn now works too, but npm is the intended manager). |
| Render: `Cannot find module 'express'` | Root Directory not `backend`, or build step skipped | Root Directory = `backend`; Build = `npm run build`. `npm start` now also self-installs as a fallback |
| Render: `DATABASE_URL is required` | DB env var missing | Link `khang-db` → `DATABASE_URL` |
| Vercel build: `DATABASE_URL is required` | `NEXT_PUBLIC_API_URL` missing so it built in single-server mode | Add `NEXT_PUBLIC_API_URL` and redeploy |
| Browser: CORS error / login fails | `FRONTEND_URL` on Render doesn't match the Vercel domain | Set exact `https://…vercel.app` (no slash) |
| Vercel: "No Next.js version detected" | Root Directory left at repo root or wrong folder | Root Directory = `frontend` |
| Emails not arriving | SMTP vars missing / not an App Password | Use Gmail App Password in `SMTP_PASS` |
