-- Khang Chinese Restaurant & Dimsum — PostgreSQL schema
-- Works on Render Postgres, Neon, Supabase, Railway or local Postgres.
-- Run:  psql "$DATABASE_URL" -f database/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(200) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone         VARCHAR(30),
  address       TEXT,
  role          VARCHAR(20) NOT NULL DEFAULT 'customer',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  emoji       VARCHAR(10) NOT NULL DEFAULT '🍜',
  image       TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  slug          VARCHAR(160) NOT NULL UNIQUE,
  description   TEXT NOT NULL,
  ingredients   TEXT NOT NULL DEFAULT '',
  price         INTEGER NOT NULL,
  image         TEXT NOT NULL,
  category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  rating        REAL NOT NULL DEFAULT 4.5,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  is_veg        BOOLEAN NOT NULL DEFAULT FALSE,
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  order_code     VARCHAR(20) NOT NULL UNIQUE,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name  VARCHAR(120) NOT NULL,
  phone          VARCHAR(30) NOT NULL,
  email          VARCHAR(200),
  address        TEXT NOT NULL,
  notes          TEXT,
  subtotal       INTEGER NOT NULL,
  tax            INTEGER NOT NULL,
  delivery_fee   INTEGER NOT NULL,
  total          INTEGER NOT NULL,
  payment_method VARCHAR(30) NOT NULL,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  status         VARCHAR(30) NOT NULL DEFAULT 'received',
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  name       VARCHAR(160) NOT NULL,
  image      TEXT,
  price      INTEGER NOT NULL,
  quantity   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id                  SERIAL PRIMARY KEY,
  order_id            INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider            VARCHAR(30) NOT NULL,
  provider_order_id   VARCHAR(120),
  provider_payment_id VARCHAR(120),
  amount              INTEGER NOT NULL,
  currency            VARCHAR(10) NOT NULL DEFAULT 'INR',
  status              VARCHAR(30) NOT NULL DEFAULT 'created',
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name       VARCHAR(120) NOT NULL,
  rating     INTEGER NOT NULL,
  comment    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracking (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status     VARCHAR(30) NOT NULL,
  note       TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_tracking_order ON tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order ON payments(provider_order_id);
