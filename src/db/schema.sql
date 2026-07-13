-- Sauce n' Cheese — Database Schema

-- Menu items (burgers, pizzas, deals, etc.)
CREATE TABLE IF NOT EXISTS menu_items (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  category      VARCHAR(50) NOT NULL CHECK (category IN ('classic', 'special', 'deal')),
  price         NUMERIC(10, 2) NOT NULL,
  price_small   NUMERIC(10, 2),
  price_regular NUMERIC(10, 2),
  price_large   NUMERIC(10, 2),
  description   TEXT NOT NULL,
  image         TEXT NOT NULL,
  base_cheese   INTEGER DEFAULT 4 CHECK (base_cheese BETWEEN 1 AND 5),
  base_sauce    VARCHAR(100) DEFAULT 'Liquid Gold',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Contact form submissions (linked to Clerk user if signed in)
CREATE TABLE IF NOT EXISTS contacts (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  message    TEXT,
  clerk_user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders (linked to Clerk user)
CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  order_number      VARCHAR(50) UNIQUE NOT NULL,
  clerk_user_id     VARCHAR(255) NOT NULL,
  customer_name     VARCHAR(255) NOT NULL DEFAULT '',
  customer_phone    VARCHAR(50) NOT NULL DEFAULT '',
  delivery_address  TEXT NOT NULL DEFAULT '',
  delivery_notes    TEXT DEFAULT '',
  items             JSONB NOT NULL DEFAULT '[]',
  subtotal          NUMERIC(10, 2) NOT NULL,
  status            VARCHAR(50) DEFAULT 'confirmed',
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- Admin users (Clerk user IDs with admin privileges)
-- After signing in on the site, run this SQL with YOUR Clerk user ID:
--   INSERT INTO admin_users (clerk_user_id) VALUES ('user_xxxxxx');
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ─── Migrations for existing tables (from previous deployments) ──

-- Add clerk_user_id to contacts if it was created without it
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255);

-- Add clerk_user_id to orders if it was created without it
ALTER TABLE orders ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255);

-- ─── Indexes ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items (category);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_clerk_user ON contacts (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_clerk_user ON orders (clerk_user_id);
