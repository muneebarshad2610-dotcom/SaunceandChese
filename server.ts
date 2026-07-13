import express from 'express';
import cors from 'cors';
// dotenv already loaded via src/db/pool.ts
import pool from './src/db/pool';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' }));

// ─── Auto-run schema + seed on startup ────────────────────────────

async function migrate() {
  try {
    const schemaPath = path.resolve('src/db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schemaSql);
    console.log('✅ Schema applied');

    const seedPath = path.resolve('src/db/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');

    // Only seed if table is empty
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

// ─── API Routes ──────────────────────────────────────────────────

// GET /api/menu-items — returns all menu items
app.get('/api/menu-items', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        name,
        category,
        price,
        price_small  AS "small",
        price_regular AS "regular",
        price_large   AS "large",
        description,
        image,
        base_cheese   AS "baseCheese",
        base_sauce    AS "baseSauce",
        created_at,
        updated_at
      FROM menu_items
      ORDER BY id
    `);

    // Transform rows to match frontend MenuItem shape
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

// POST /api/contact — save contact form submission
// Basic email regex
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      res.status(400).json({ error: 'A valid email is required' });
      return;
    }

    const { rows } = await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING id, created_at',
      [name.trim(), email.trim(), message?.trim() || '']
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

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start ───────────────────────────────────────────────────────

async function start() {
  await migrate();
  const server = app.listen(PORT, () => {
    console.log(`\n🧀 Sauce n' Cheese API running on http://localhost:${PORT}`);
    console.log(`   GET  /api/health`);
    console.log(`   GET  /api/menu-items`);
    console.log(`   POST /api/contact\n`);
  });

  // Graceful shutdown
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
