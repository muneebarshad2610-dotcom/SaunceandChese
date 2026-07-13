import express from 'express';
import cors from 'cors';
import { createClerkClient, verifyToken } from '@clerk/backend';
import pool from './src/db/pool';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Resolve Clerk keys — the publishable key from VITE_* (shared with frontend)
// or CLERK_PUBLISHABLE_KEY (server-only name). Both are the same value.
const clerkPublishableKey =
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  '';

const clerkSecretKey = process.env.CLERK_SECRET_KEY || '';

if (!clerkPublishableKey) {
  console.error('❌ VITE_CLERK_PUBLISHABLE_KEY environment variable is required');
  console.error('   Get your publishable key from https://dashboard.clerk.com/last-active?path=api-keys');
  process.exit(1);
}

if (!clerkSecretKey) {
  console.error('❌ CLERK_SECRET_KEY environment variable is required');
  console.error('   Get your secret key from https://dashboard.clerk.com/last-active?path=api-keys');
  process.exit(1);
}

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' }));

// ─── Custom auth middleware (uses @clerk/backend verifyToken directly) ─
// We don't rely on @clerk/express middleware because v2.1.40 has a bug
// where req.auth can be undefined instead of always being set.

function extractToken(req: any): string | null {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  // Guard against getToken() returning null/undefined which becomes "Bearer null"
  if (!token || token === 'null' || token === 'undefined' || token.length < 10) return null;
  return token;
}

async function requireAuth(req: any, res: any, next: any) {
  const token = extractToken(req);
  if (!token) {
    console.error('Auth failed: no valid token in Authorization header');
    res.status(401).json({ error: 'Authentication required — no valid session token' });
    return;
  }

  try {
    const payload = await verifyToken(token, { secretKey: clerkSecretKey });
    req.auth = { userId: payload.sub };
    next();
  } catch (err) {
    console.error('Auth failed: token verification error —', err instanceof Error ? err.message : err);
    res.status(401).json({ error: 'Authentication required — invalid or expired token' });
  }
}

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
        product_category, variants,
        description, image,
        created_at, updated_at
      FROM menu_items
      ORDER BY id
    `);

    const items = rows.map((row: any) => {
      const hasSizes = row.small !== null && row.regular !== null && row.large !== null;
      let variants = row.variants;
      if ((!variants || variants.length === 0) && hasSizes) {
        variants = [
          {
            name: 'Size',
            required: true,
            options: [
              { name: 'Small',  price: Number(row.small) - Number(row.price) },
              { name: 'Regular', price: Number(row.regular) - Number(row.price) },
              { name: 'Large',   price: Number(row.large) - Number(row.price) },
            ],
          },
        ];
      }
      return {
        id: row.id,
        name: row.name,
        category: row.category,
        productCategory: row.product_category || 'Pizza',
        price: hasSizes ? 0 : Number(row.price),
        prices: hasSizes
          ? {
              small: Number(row.small),
              regular: Number(row.regular),
              large: Number(row.large),
            }
          : undefined,
        variants: variants?.length > 0 ? variants : undefined,
        description: row.description,
        image: row.image,
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

// ─── Clerk Admin Helper ──────────────────────────────────────────

const clerkClient = createClerkClient({ secretKey: clerkSecretKey });

async function getUserRole(clerkUserId: string): Promise<string | null> {
  try {
    const user = await clerkClient.users.getUser(clerkUserId);
    return (user.publicMetadata as Record<string, unknown>)?.role as string || 'user';
  } catch {
    return null;
  }
}

async function isAdminUser(clerkUserId: string): Promise<boolean> {
  const role = await getUserRole(clerkUserId);
  return role === 'admin' || role === 'manager';
}

async function isKitchenUser(clerkUserId: string): Promise<boolean> {
  const role = await getUserRole(clerkUserId);
  return role === 'kitchen' || role === 'admin' || role === 'manager';
}

async function requireAdminOrManager(req: any, res: any): Promise<string | null> {
  const clerkUserId = req.auth?.userId;
  if (!clerkUserId) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  const allowed = await isAdminUser(clerkUserId);
  if (!allowed) {
    res.status(403).json({ error: 'Admin or manager role required' });
    return null;
  }
  return clerkUserId;
}

async function requireKitchen(req: any, res: any): Promise<string | null> {
  const clerkUserId = req.auth?.userId;
  if (!clerkUserId) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  const isKitchen = await isKitchenUser(clerkUserId);
  if (!isKitchen) {
    res.status(403).json({ error: 'Kitchen role required' });
    return null;
  }
  return clerkUserId;
}

// ─── Order Routes ─────────────────────────────────────────────────  // POST /api/orders — submit order (requires authentication)
  app.post('/api/orders', requireAuth, async (req, res) => {
    try {
      const auth = (req as any).auth;
      if (!auth) {
        console.error('POST /api/orders failed: req.auth is missing entirely. Token may be invalid or missing.');
        res.status(401).json({ error: 'Authentication required — no valid session token' });
        return;
      }

      const clerkUserId = auth.userId ?? null;

      if (!clerkUserId) {
        console.error('POST /api/orders failed: clerkUserId is null/undefined — auth:', JSON.stringify(auth));
        res.status(401).json({ error: 'Authentication required — user ID not found' });
        return;
      }

      const { orderNumber, items, subtotal, customerName, customerPhone, deliveryAddress, deliveryNotes } = req.body;

      // Normalize items if they arrive as a JSON string (safety for double-stringification)
      const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;

      if (!orderNumber || typeof orderNumber !== 'string') {
        res.status(400).json({ error: 'Order number is required' });
        return;
      }
      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        res.status(400).json({ error: 'At least one item is required' });
        return;
      }
      if (typeof subtotal !== 'number' || subtotal <= 0) {
        res.status(400).json({ error: 'Valid subtotal is required' });
        return;
      }

      if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 1) {
        res.status(400).json({ error: 'Customer name is required' });
        return;
      }
      if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim().length < 1) {
        res.status(400).json({ error: 'Customer phone is required' });
        return;
      }
      if (!deliveryAddress || typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 1) {
        res.status(400).json({ error: 'Delivery address is required' });
        return;
      }

    // Serialize items to JSON string explicitly to avoid pg JSONB serialization edge cases
    let itemsJson: string;
    try {
      itemsJson = JSON.stringify(parsedItems);
    } catch {
      res.status(400).json({ error: 'Invalid items data — failed to serialize' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO orders (order_number, clerk_user_id, customer_name, customer_phone, delivery_address, delivery_notes, items, subtotal, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed')
       RETURNING id, order_number, created_at`,[orderNumber, clerkUserId, customerName.trim(), customerPhone.trim(), deliveryAddress.trim(), (deliveryNotes || '').trim(), itemsJson,
        subtotal,
      ]
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
    console.error('Items payload type:', typeof req.body?.items, 'isArray:', Array.isArray(req.body?.items));
    res.status(500).json({ error: 'Failed to submit order' });
  }
});

// GET /api/orders — Get current user's orders (requires auth)
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const clerkUserId = (req as any).auth.userId;

    const { rows } = await pool.query(
      `SELECT id, order_number AS "orderNumber", clerk_user_id AS "clerkUserId",
              customer_name AS "customerName", customer_phone AS "customerPhone",
              delivery_address AS "deliveryAddress", delivery_notes AS "deliveryNotes",
              items, subtotal, status, table_id AS "tableId", guest_name AS "guestName", split_bill AS "splitBill",
              session_token AS "sessionToken",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM orders
       WHERE clerk_user_id = $1
       ORDER BY created_at DESC`,
      [clerkUserId]
    );

    res.json(rows);
  } catch (err) {
    console.error('GET /api/orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/admin — Get ALL orders (admin only)
app.get('/api/orders/admin', requireAuth, async (req, res) => {
  try {
    const clerkUserId = (req as any).auth.userId;
    const admin = await isAdminUser(clerkUserId);

    if (!admin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { rows } = await pool.query(
      `SELECT id, order_number AS "orderNumber", clerk_user_id AS "clerkUserId",
              customer_name AS "customerName", customer_phone AS "customerPhone",
              delivery_address AS "deliveryAddress", delivery_notes AS "deliveryNotes",
              items, subtotal, status, table_id AS "tableId", guest_name AS "guestName", split_bill AS "splitBill",
              session_token AS "sessionToken",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM orders
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error('GET /api/orders/admin error:', err);
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// PATCH /api/orders/:id/status — Update order status (admin only)
app.patch('/api/orders/:id/status', requireAuth, async (req, res) => {
  try {
    const clerkUserId = (req as any).auth.userId;
    const admin = await isAdminUser(clerkUserId);

    if (!admin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }

    const { status } = req.body;
    const validStatuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const { rows } = await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, order_number AS "orderNumber", status, updated_at AS "updatedAt"`,
      [status, orderId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    console.log(`📋 Order #${rows[0].orderNumber} status → ${status}`);
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/orders/:id/status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// GET /api/admin/check — Check if current user is admin
app.get('/api/admin/check', requireAuth, async (req, res) => {
  try {
    const clerkUserId = (req as any).auth.userId;
    const admin = await isAdminUser(clerkUserId);
    res.json({ admin });
  } catch (err) {
    console.error('GET /api/admin/check error:', err);
    res.status(500).json({ error: 'Failed to check admin status' });
  }
});

// POST /api/admin/block-session — Block a table session token (admin/manager only)
app.post('/api/admin/block-session', requireAuth, async (req, res) => {
  try {
    const clerkUserId = (req as any).auth.userId;
    const admin = await isAdminUser(clerkUserId);
    if (!admin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    const { sessionToken } = req.body;
    if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.length < 16) {
      res.status(400).json({ error: 'Valid session token is required' });
      return;
    }
    blockedSessions.add(sessionToken);
    console.log(`🚫 Session blocked: ${sessionToken.slice(0, 12)}...`);
    res.json({ success: true, message: 'Session blocked. Future orders from this session will be rejected.' });
  } catch (err) {
    console.error('POST /api/admin/block-session error:', err);
    res.status(500).json({ error: 'Failed to block session' });
  }
});

// GET /api/kitchen/check — Check if current user is kitchen staff
app.get('/api/kitchen/check', requireAuth, async (req, res) => {
  try {
    const clerkUserId = (req as any).auth.userId;
    const kitchen = await isKitchenUser(clerkUserId);
    res.json({ kitchen });
  } catch (err) {
    console.error('GET /api/kitchen/check error:', err);
    res.status(500).json({ error: 'Failed to check kitchen status' });
  }
});

// ─── Menu Items CRUD (admin/manager only) ──────────────────────────

// POST /api/menu-items — Create a new menu item
app.post('/api/menu-items', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const { name, category, price, price_small, price_regular, price_large, product_category, variants, description, image, base_cheese, base_sauce } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    if (!['classic', 'special', 'deal'].includes(category)) {
      res.status(400).json({ error: 'Category must be classic, special, or deal' });
      return;
    }
    if (!description || typeof description !== 'string') {
      res.status(400).json({ error: 'Description is required' });
      return;
    }
    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }

    const basePrice = price_small || price_regular || price_large ? 0 : (parseFloat(price) || 0);
    const variantsJson = variants && Array.isArray(variants) && variants.length > 0 ? JSON.stringify(variants) : '[]';

    const { rows } = await pool.query(
      `INSERT INTO menu_items (name, category, price, price_small, price_regular, price_large, product_category, variants, description, image, base_cheese, base_sauce)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, name, category, created_at`,
      [
        name.trim(),
        category,
        basePrice,
        price_small ? parseFloat(price_small) : null,
        price_regular ? parseFloat(price_regular) : null,
        price_large ? parseFloat(price_large) : null,
        product_category || 'Pizza',
        variantsJson,
        description.trim(),
        image.trim(),
        base_cheese ? parseInt(base_cheese, 10) : 4,
        base_sauce || 'Liquid Gold',
      ]
    );

    console.log(`📦 Menu item created: ${rows[0].name} (${category})`);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/menu-items error:', err);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// PUT /api/menu-items/:id — Update a menu item
app.put('/api/menu-items/:id', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      res.status(400).json({ error: 'Invalid item ID' });
      return;
    }

    const { name, category, price, price_small, price_regular, price_large, product_category, variants, description, image, base_cheese, base_sauce } = req.body;

    const variantsJson = variants && Array.isArray(variants) && variants.length > 0 ? JSON.stringify(variants) : '[]';

    const { rows } = await pool.query(
      `UPDATE menu_items
       SET name = $1, category = $2, price = $3, price_small = $4, price_regular = $5, price_large = $6,
           product_category = $7, variants = $8, description = $9, image = $10, base_cheese = $11, base_sauce = $12, updated_at = NOW()
       WHERE id = $13
       RETURNING id, name, category, updated_at`,
      [
        name.trim(),
        category,
        price ? parseFloat(price) : 0,
        price_small ? parseFloat(price_small) : null,
        price_regular ? parseFloat(price_regular) : null,
        price_large ? parseFloat(price_large) : null,
        product_category || 'Pizza',
        variantsJson,
        description.trim(),
        image.trim(),
        base_cheese ? parseInt(base_cheese, 10) : 4,
        base_sauce || 'Liquid Gold',
        itemId,
      ]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    console.log(`📦 Menu item updated: ${rows[0].name}`);
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/menu-items/:id error:', err);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// DELETE /api/menu-items/:id — Delete a menu item
app.delete('/api/menu-items/:id', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const itemId = parseInt(req.params.id, 10);
    if (isNaN(itemId)) {
      res.status(400).json({ error: 'Invalid item ID' });
      return;
    }

    const { rows } = await pool.query(
      'DELETE FROM menu_items WHERE id = $1 RETURNING id, name',
      [itemId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    console.log(`🗑️ Menu item deleted: ${rows[0].name}`);
    res.json({ success: true, deleted: rows[0] });
  } catch (err) {
    console.error('DELETE /api/menu-items/:id error:', err);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// ─── User Management (admin/manager only) ─────────────────────────

// GET /api/users — List Clerk users
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const { data } = await clerkClient.users.getUserList({ limit: 100 });

    const users = data.map((u: any) => ({
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.emailAddresses?.[0]?.emailAddress || '',
      imageUrl: u.imageUrl,
      role: (u.publicMetadata as Record<string, unknown>)?.role || 'user',
      lastSignInAt: u.lastSignInAt,
      createdAt: u.createdAt,
    }));

    res.json(users);
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/users/:id/role — Update a user's role
app.patch('/api/users/:id/role', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const targetUserId = req.params.id;
    const { role } = req.body;

    if (!role || !['user', 'admin', 'manager', 'kitchen'].includes(role)) {
      res.status(400).json({ error: 'Role must be user, admin, manager, or kitchen' });
      return;
    }

    const updatedUser = await clerkClient.users.updateUser(targetUserId, {
      publicMetadata: { role },
    });

    console.log(`👤 User ${targetUserId} role set to ${role}`);
    res.json({ success: true, userId: targetUserId, role });
  } catch (err) {
    console.error('PATCH /api/users/:id/role error:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// ─── Saved Addresses API ─────────────────────────────────────────

app.get('/api/addresses', requireAuth, async (req, res) => {
  try {
    const clerkUserId = (req as any).auth.userId;
    const { rows } = await pool.query(
      `SELECT id, label, address, phone, is_default AS "isDefault"
       FROM saved_addresses
       WHERE clerk_user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [clerkUserId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/addresses error:', err);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

app.post('/api/addresses', requireAuth, async (req, res) => {
  try {
    const clerkUserId = (req as any).auth.userId;
    const { label, address, phone, isDefault } = req.body;

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      res.status(400).json({ error: 'Valid address is required' });
      return;
    }

    if (isDefault) {
      await pool.query(
        `UPDATE saved_addresses SET is_default = false WHERE clerk_user_id = $1`,
        [clerkUserId]
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO saved_addresses (clerk_user_id, label, address, phone, is_default)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, label, address, phone, is_default AS "isDefault"`,
      [clerkUserId, label || '', address.trim(), phone || '', isDefault || false]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/addresses error:', err);
    res.status(500).json({ error: 'Failed to save address' });
  }
});

app.delete('/api/addresses/:id', requireAuth, async (req, res) => {
  try {
    const clerkUserId = (req as any).auth.userId;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

    const { rowCount } = await pool.query(
      `DELETE FROM saved_addresses WHERE id = $1 AND clerk_user_id = $2`,
      [id, clerkUserId]
    );

    if (rowCount === 0) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/addresses/:id error:', err);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// ─── Add-ons API ────────────────────────────────────────────────

// GET /api/addons — public, returns all active add-ons
app.get('/api/addons', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, type, name, price, is_active AS "isActive", sort_order AS "sortOrder"
       FROM addons
       WHERE is_active = true
       ORDER BY type, sort_order`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/addons error:', err);
    res.status(500).json({ error: 'Failed to fetch add-ons' });
  }
});

// GET /api/addons/admin — all add-ons including inactive (admin/manager only)
app.get('/api/addons/admin', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const { rows } = await pool.query(
      `SELECT id, type, name, price, is_active AS "isActive", sort_order AS "sortOrder"
       FROM addons
       ORDER BY type, sort_order`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/addons/admin error:', err);
    res.status(500).json({ error: 'Failed to fetch add-ons' });
  }
});

// POST /api/addons — create add-on (admin/manager only)
app.post('/api/addons', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const { type, name, price, sort_order } = req.body;
    if (!type || !['sauce', 'drink', 'extra'].includes(type)) {
      res.status(400).json({ error: 'Type must be sauce, drink, or extra' });
      return;
    }
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO addons (type, name, price, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING id, type, name, price, is_active AS "isActive", sort_order AS "sortOrder"`,
      [type, name.trim(), parseFloat(price) || 0, sort_order || 0]
    );

    console.log(`➕ Add-on created: ${rows[0].name} (${type})`);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/addons error:', err);
    res.status(500).json({ error: 'Failed to create add-on' });
  }
});

// PUT /api/addons/:id — update add-on (admin/manager only)
app.put('/api/addons/:id', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const addonId = parseInt(req.params.id, 10);
    if (isNaN(addonId)) {
      res.status(400).json({ error: 'Invalid add-on ID' });
      return;
    }

    const { type, name, price, is_active, sort_order } = req.body;

    const { rows } = await pool.query(
      `UPDATE addons
       SET type = $1, name = $2, price = $3, is_active = $4, sort_order = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, type, name, price, is_active AS "isActive", sort_order AS "sortOrder"`,
      [type, name.trim(), parseFloat(price) || 0, is_active, sort_order || 0, addonId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Add-on not found' });
      return;
    }

    console.log(`✏️ Add-on updated: ${rows[0].name}`);
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/addons/:id error:', err);
    res.status(500).json({ error: 'Failed to update add-on' });
  }
});

// DELETE /api/addons/:id — delete add-on (admin/manager only)
app.delete('/api/addons/:id', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const addonId = parseInt(req.params.id, 10);
    if (isNaN(addonId)) {
      res.status(400).json({ error: 'Invalid add-on ID' });
      return;
    }

    const { rows } = await pool.query(
      'DELETE FROM addons WHERE id = $1 RETURNING id, name',
      [addonId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Add-on not found' });
      return;
    }

    console.log(`🗑️ Add-on deleted: ${rows[0].name}`);
    res.json({ success: true, deleted: rows[0] });
  } catch (err) {
    console.error('DELETE /api/addons/:id error:', err);
    res.status(500).json({ error: 'Failed to delete add-on' });
  }
});

// ─── Table Management (admin/manager only) ──────────────────────

// GET /api/tables — list all tables
app.get('/api/tables', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const { rows } = await pool.query(
      `SELECT id, table_number AS "tableNumber", qr_token AS "qrToken",
              capacity, is_active AS "isActive", created_at AS "createdAt"
       FROM tables ORDER BY table_number`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/tables error:', err);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// POST /api/tables — create a new table
app.post('/api/tables', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const { table_number, capacity } = req.body;
    if (!table_number || typeof table_number !== 'number') {
      res.status(400).json({ error: 'Valid table number is required' });
      return;
    }

    const qrToken = 'table-' + crypto.randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO tables (table_number, qr_token, capacity)
       VALUES ($1, $2, $3)
       RETURNING id, table_number AS "tableNumber", qr_token AS "qrToken", capacity, is_active AS "isActive"`,
      [table_number, qrToken, capacity || 4]
    );

    console.log(`🪑 Table ${table_number} created`);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/tables error:', err);
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// PATCH /api/tables/:id — update table
app.patch('/api/tables/:id', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const tableId = parseInt(req.params.id, 10);
    if (isNaN(tableId)) {
      res.status(400).json({ error: 'Invalid table ID' });
      return;
    }

    const { table_number, capacity, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE tables SET table_number = $1, capacity = $2, is_active = $3 WHERE id = $4
       RETURNING id, table_number AS "tableNumber", qr_token AS "qrToken", capacity, is_active AS "isActive"`,
      [table_number, capacity, is_active, tableId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/tables/:id error:', err);
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// DELETE /api/tables/:id — delete table
app.delete('/api/tables/:id', requireAuth, async (req, res) => {
  try {
    const adminUser = await requireAdminOrManager(req, res);
    if (!adminUser) return;

    const tableId = parseInt(req.params.id, 10);
    if (isNaN(tableId)) {
      res.status(400).json({ error: 'Invalid table ID' });
      return;
    }

    const { rows } = await pool.query('DELETE FROM tables WHERE id = $1 RETURNING id', [tableId]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/tables/:id error:', err);
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

// ─── Table QR / Public Ordering ──────────────────────────────────

// GET /api/table/:qrToken — public, returns table info + menu
app.get('/api/table/:qrToken', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, table_number AS "tableNumber", capacity FROM tables WHERE qr_token = $1 AND is_active = true',
      [req.params.qrToken]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Table not found or inactive' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/table/:qrToken error:', err);
    res.status(500).json({ error: 'Failed to fetch table' });
  }
});

// ─── Table Order Session Tracking & Rate Limiting ──────────────

const blockedSessions = new Set<string>();
const tableOrderRate = new Map<number, number[]>();

function checkTableRate(tableId: number, max = 10, windowMs = 1800000): boolean {
  const now = Date.now();
  const hits = tableOrderRate.get(tableId) || [];
  const recent = hits.filter((t) => now - t < windowMs);
  if (recent.length >= max) return false;
  recent.push(now);
  tableOrderRate.set(tableId, recent);
  return true;
}

// POST /api/orders/table — place order from table (no auth required, just guest name)
app.post('/api/orders/table', async (req, res) => {
  try {
    const { tableId, guestName, items, subtotal, splitBill, sessionToken } = req.body;

    if (!tableId || typeof tableId !== 'number') {
      res.status(400).json({ error: 'Table ID is required' });
      return;
    }
    if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.length < 16) {
      res.status(400).json({ error: 'Valid session token is required — please refresh the QR page' });
      return;
    }
    if (blockedSessions.has(sessionToken)) {
      res.status(403).json({ error: 'Your orders could not be processed. Please scan the QR code again.' });
      return;
    }
    if (!checkTableRate(tableId)) {
      res.status(429).json({ error: 'Too many orders for this table. Please wait a while.' });
      return;
    }
    if (!guestName || typeof guestName !== 'string' || guestName.trim().length < 1) {
      res.status(400).json({ error: 'Guest name is required' });
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

    const orderNumber = 'TBL-' + Math.floor(100000 + Math.random() * 900000);
    let itemsJson: string;
    try {
      itemsJson = JSON.stringify(items);
    } catch {
      res.status(400).json({ error: 'Invalid items data' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO orders (order_number, table_id, guest_name, items, subtotal, status, split_bill, session_token)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', $6, $7)
       RETURNING id, order_number AS "orderNumber", created_at AS "createdAt"`,
      [orderNumber, tableId, guestName.trim(), itemsJson, subtotal, splitBill || false, sessionToken]
    );

    console.log(`📋 Table order #${rows[0].orderNumber} (Table ${tableId}, ${guestName})`);
    res.status(201).json({
      success: true,
      id: rows[0].id,
      orderNumber: rows[0].orderNumber,
      createdAt: rows[0].createdAt,
    });
  } catch (err) {
    console.error('POST /api/orders/table error:', err);
    res.status(500).json({ error: 'Failed to submit table order' });
  }
});

// ─── Kitchen Orders (kitchen role only) ──────────────────────────

// GET /api/kitchen/orders — returns active orders for kitchen display
app.get('/api/kitchen/orders', requireAuth, async (req, res) => {
  try {
    const kitchenUser = await requireKitchen(req, res);
    if (!kitchenUser) return;

    const { rows } = await pool.query(`
      SELECT o.id, o.order_number AS "orderNumber", o.table_id AS "tableId",
             o.guest_name AS "guestName", o.items, o.subtotal, o.status,
             o.created_at AS "createdAt",
             t.table_number AS "tableNumber"
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE o.status IN ('confirmed', 'preparing')
      ORDER BY o.created_at ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error('GET /api/kitchen/orders error:', err);
    res.status(500).json({ error: 'Failed to fetch kitchen orders' });
  }
});

// PATCH /api/kitchen/orders/:id/status — kitchen updates order status
app.patch('/api/kitchen/orders/:id/status', requireAuth, async (req, res) => {
  try {
    const kitchenUser = await requireKitchen(req, res);
    if (!kitchenUser) return;

    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }

    const { status } = req.body;
    const validStatuses = ['preparing', 'ready', 'delivered'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Status must be: preparing, ready, or delivered' });
      return;
    }

    await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, orderId]
    );

    console.log(`🍳 Kitchen order #${orderId} → ${status}`);
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/kitchen/orders/:id/status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
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
    console.log(`   POST /api/orders            (auth)`);
    console.log(`   GET  /api/orders             (auth)`);
    console.log(`   GET  /api/orders/admin       (admin)`);
    console.log(`   PATCH /api/orders/:id/status (admin)`);
    console.log(`   GET  /api/admin/check`);
    console.log(`   GET  /api/kitchen/check`);
    console.log(`   POST /api/menu-items        (admin)`);
    console.log(`   PUT  /api/menu-items/:id    (admin)`);
    console.log(`   DEL  /api/menu-items/:id    (admin)`);
    console.log(`   GET  /api/users             (admin)`);
    console.log(`   PATCH /api/users/:id/role   (admin)`);
    console.log(`   GET  /api/addons             (public)`);
    console.log(`   GET  /api/addons/admin       (admin)`);
    console.log(`   POST /api/addons             (admin)`);
    console.log(`   PUT  /api/addons/:id         (admin)`);
    console.log(`   DEL  /api/addons/:id         (admin)`);
    console.log(`   GET  /api/tables              (admin)`);
    console.log(`   POST /api/tables              (admin)`);
    console.log(`   PATCH /api/tables/:id         (admin)`);
    console.log(`   DEL  /api/tables/:id          (admin)`);
    console.log(`   GET  /api/table/:token        (public)`);
    console.log(`   POST /api/orders/table        (public)`);
    console.log(`   GET  /api/kitchen/orders      (kitchen)`);
    console.log(`   PATCH /api/kitchen/orders/:id/status (kitchen)\n`);
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
