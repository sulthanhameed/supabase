# Khang Backend — Node.js + Express REST API

Standalone API server for **Khang Chinese Restaurant & Dimsum**. Deploy this folder on **Render**.

## Stack
Express 4 · PostgreSQL (`pg`) · JWT (`jsonwebtoken`) · bcrypt · Nodemailer (email) · Fast2SMS (SMS) · Razorpay (payments, REST + HMAC verification)

## Install & run
```bash
cd backend
cp .env.example .env        # fill DATABASE_URL etc.
npm run build               # installs dependencies  (= bash build.sh → npm ci --omit=dev)
npm start                   # starts the API          (= node start.js → server.js)
```
`npm start` is **self-healing**: if `node_modules` is missing it installs dependencies first, then boots the server.
Tables are created and the menu is seeded automatically on first start.

| Script | Command | Purpose |
|---|---|---|
| `npm run build` | `bash build.sh` | **Build Command** — install production deps |
| `npm start` | `node start.js` | **Start Command** — auto-install if needed + run server |
| `npm run serve` | `node server.js` | start without the install check |
| `npm run dev` | `node --watch server.js` | local dev with reload |
| `npm run db:push` | `node scripts/migrate.js` | create tables + seed manually |
| `npm run check` | `node scripts/check-connection.js` | test frontend↔backend link |

## Deploy on Render
1. Push this repo to GitHub.
2. Render → **New → Blueprint** → select the repo. The root `render.yaml` creates this web service **and** a free Postgres database and links `DATABASE_URL`.
   *Manual alternative — New → Web Service:*

   | Setting | Value |
   |---|---|
   | **Root Directory** | `backend` |
   | **Build Command** | `npm run build` |
   | **Start Command** | `npm start` |
   | Health Check Path | `/api/health` |
3. Set env vars in the Render dashboard:
   - `FRONTEND_URL` = your Vercel URL (e.g. `https://khang.vercel.app`) — required for CORS
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `SMTP_USER`, `SMTP_PASS` (Gmail App Password), `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`
   - `OWNER_EMAIL=sultham456@gmail.com` (already in blueprint) — every order confirmation is sent here + to the customer
   - `FAST2SMS_API_KEY` (optional)
4. Health check: `https://<service>.onrender.com/api/health` → `{"ok":true}`

## REST endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products?category=&featured=&q=&random=` | – | List / search / random dish |
| GET | `/api/products/:id` | – | Dish + reviews |
| GET | `/api/categories` | – | Categories with counts |
| GET/POST | `/api/reviews?productId=` | – | Reviews (POST adds one) |
| POST | `/api/auth/signup` · `/api/auth/login` · `/api/auth/logout` | – | Email/password auth → JWT |
| GET/PATCH | `/api/auth/me` | user | Profile |
| POST | `/api/orders` | – | Place order (server-side pricing, creates Razorpay order for UPI/card/wallet) |
| GET | `/api/orders` | user | Order history |
| GET | `/api/orders/:code` | – | Track by Order ID |
| GET | `/api/payments/razorpay/config` | – | Gateway availability + public key |
| POST | `/api/payments/razorpay/verify` | – | Verify signature → mark paid → send email/SMS |
| GET/POST/PATCH/DELETE | `/api/admin/products[/:id]` | admin | Manage products |
| GET/POST/PATCH/DELETE | `/api/admin/categories[/:id]` | admin | Manage categories |
| GET/PATCH | `/api/admin/orders[/:id]` | admin | View orders, update tracking status / payment |
| GET/PATCH/DELETE | `/api/admin/users[/:id]` | admin | Manage users / roles |
| GET | `/api/admin/payments` | admin | Payment log |

Auth: send `Authorization: Bearer <token>` (token returned by login/signup). Admin demo: `admin@khang.com` / `admin123`.
