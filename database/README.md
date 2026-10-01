# Database — PostgreSQL

Managed separately from the frontend and backend. Use any hosted Postgres:
**Render Postgres** (free tier), **Neon**, **Supabase** or **Railway**.

## Files
| File | Purpose |
|---|---|
| `schema.sql` | All tables + indexes (idempotent — safe to re-run) |
| `seed.sql` | Menu categories, 35 dishes, sample reviews |

## Tables (models)
`users` · `categories` · `products` · `orders` · `order_items` · `payments` · `reviews` · `tracking`

## Setup
```bash
# 1. create the database on your provider and copy its connection string
# 2. apply schema + seed
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```
> The backend also runs `schema.sql` and seeds automatically on first boot,
> so this step is optional if you deploy the backend first.

The admin user (`admin@khang.com` / `admin123`) is created by the backend on
first start — change it via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars.
