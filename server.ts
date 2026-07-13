import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import pool from './src/db/pool';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Verify Clerk secret key is configured
if (!process.env.CLERK_SECRET_KEY) {
  console.error('❌ CLERK_SECRET_KEY environment variable is required');
  console.error('   Get your secret key from https://dashboard.clerk.com');
  process.exit(1);
}

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' }));

// Clerk middleware — attaches req.auth to all routes
app.use(clerkMiddleware());

// ─── Auto-run schema + seed on startup ────────────────────────────

async function migrate() {
  try {
    const schemaPath = path.resolve('src/db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schemaSql);
    console.log('✅ Schema applied');

    const seedPath = path.resolve('src/db/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');

    const { rows: count } = await pool.query('SELECT COUNT(*)::int AS c FROM menu_items');
    if (count[0].c === 0) {
      await pool.query(seedSql);
      console.log(`✅ Seed data inserted`);
    } else {
      console.log(`⏭️  Seed skipped — menu_items already has ${count[0].c} rows`);
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

// ─── Serve built frontend (production) ──────────────────────────

const distPath = path.resolve('dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`✅ Serving static frontend from ${distPath}`);
}

// ─── API Routes ──────────────────────────────────────────────────

// GET /api/menu-items — public, no auth required
app.get('/api/menu-items', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        id, name, category, price,
        price_small  AS "small",
        price_regular AS "regular",
        price_large   AS "large",
        description, image,
        base_cheese   AS "baseCheese",
        base_sauce    AS "baseSauce",
        created_at, updated_at
      FROM menu_items
      ORDER BY id
    `);

    const items = rows.map((row: any) => {
      const hasSizes = row.small !== null && row.regular !== null && row.large !== null;
      return {
        id: row.id,
        name: row.name,
        category: row.category,
        price: hasSizes ? 0 : Number(row.price),
        prices: hasSizes
          ? {
              small: Number(row.small),
              regular: Number(row.regular),
              large: Number(row.large),
            }
          : undefined,
        description: row.description,
        image: row.image,
        baseCheese: row.baseCheese,
        baseSauce: row.baseSauce,
      };
    });

    res.json(items);
  } catch (err) {
    console.error('GET /api/menu-items error:', err);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// POST /api/contact — save contact form submission (optionally linked to Clerk user)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    // Get Clerk user ID if authenticated
    const clerkUserId = (req as any).auth?.userId ?? null;

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      res.status(400).json({ error: 'A valid email is required' });
      return;
    }

    const { rows } = await pool.query(
      'INSERT INTO contacts (name, email, message, clerk_user_id) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
      [name.trim(), email.trim(), message?.trim() || '', clerkUserId]
    );

    console.log(`📩 Contact form submission #${rows[0].id} from ${email}`);
    res.status(201).json({
      success: true,
      id: rows[0].id,
      createdAt: rows[0].created_at,
    });
  } catch (err) {
    console.error('POST /api/contact error:', err);
    res.status(500).json({ error: 'Failed to save contact form' });
  }
});

// POST /api/orders — submit order (requires authentication)
app.post('/api/orders', requireAuth(), async (req, res) => {
  try {
    const { orderNumber, items, subtotal } = req.body;
    const clerkUserId = (req as any).auth.userId;

    if (!orderNumber || typeof orderNumber !== 'string') {
      res.status(400).json({ error: 'Order number is required' });
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'At least one item is required' });
      return;
    }
    if (typeof subtotal !== 'number' || subtotal <= 0) {
      res.status(400).json({ error: 'Valid subtotal is required' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO orders (order_number, clerk_user_id, items, subtotal, status)
       VALUES ($1, $2, $3, $4, 'confirmed')
       RETURNING id, order_number, created_at`,
      [orderNumber, clerkUserId, items, subtotal]
    );

    console.log(`📦 Order #${rows[0].order_number} confirmed (user=${clerkUserId})`);
    res.status(201).json({
      success: true,
      id: rows[0].id,
      orderNumber: rows[0].order_number,
      createdAt: rows[0].created_at,
    });
  } catch (err) {
    console.error('POST /api/orders error:', err);
    res.status(500).json({ error: 'Failed to submit order' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback — serve index.html for any non-API route (client-side routing)
if (fs.existsSync(distPath)) {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── Start ───────────────────────────────────────────────────────

async function start() {
  await migrate();
  const server = app.listen(PORT, () => {
    console.log(`\n🧀 Sauce n' Cheese API running on http://localhost:${PORT}`);
    console.log(`   GET  /api/health`);
    console.log(`   GET  /api/menu-items`);
    console.log(`   POST /api/contact`);
    console.log(`   POST /api/orders (protected)\n`);
  });

  const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    server.close();
    await pool.end();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();
