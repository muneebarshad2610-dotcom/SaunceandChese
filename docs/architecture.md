# Architecture Document — Sauce n' Cheese

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | React | 19.x | With JSX, hooks (useState, useEffect), no class components |
| Bundler | Vite | 6.x | Dev server on port 3000, HMR via `@vitejs/plugin-react` |
| Language | TypeScript | ~5.8.2 | `tsc --noEmit` used for linting |
| Styling | Tailwind CSS | 4.1.14 | Via `@tailwindcss/vite` plugin, CSS-first config |
| Animations | Motion | 12.x | framer-motion successor, `motion/react` import |
| Icons | Lucide React | 0.546.x | Tree-shakeable SVG icons |
| Fonts | Google Fonts | — | Poppins (sans), Bebas Neue (retro), Kalam (handwritten) |
| Auth (Frontend) | @clerk/react | ^6.12.2 | ClerkProvider, Show, SignInButton, SignUpButton, UserButton, useAuth |
| Auth (Backend) | @clerk/backend | ^3.11.4 | Custom middleware using `verifyToken()` directly (NOT @clerk/express) |
| Server | Express | ^4.21.2 | REST API on port 3001, CORS, JSON body parsing |
| Database | PostgreSQL | — | Hosted on Railway, connection via DATABASE_URL |
| DB Driver | pg (node-postgres) | ^8.22.0 | Connection pool in src/db/pool.ts |

---

## Auth

**Implemented — Clerk v6 (`@clerk/react`) + custom backend middleware using `@clerk/backend`.**

- **Frontend**: `ClerkProvider` wraps the app in `main.tsx`. Auth controls use the `Show` component.
- **API calls**: `useAuth().getToken()` → `Authorization: Bearer <token>`
- **Backend**: Custom `requireAuth` middleware uses `verifyToken(token, { secretKey })` from `@clerk/backend`.
 - **Role check**: `isAdminUser()` accepts `'admin'` or `'manager'` roles. `isKitchenUser()` accepts `'kitchen'`, `'admin'`, or `'manager'` roles. All via Clerk `public_metadata.role`.

### Environment Variables

| Variable | Used In | Required | Default |
|----------|---------|----------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend `main.tsx` | Yes | — |
| `CLERK_SECRET_KEY` | Backend `server.ts` | Yes | — |
| `DATABASE_URL` | `server.ts`, `src/db/pool.ts` | Yes | — |
| `PORT` | `server.ts` | No | 3001 |
| `CORS_ORIGINS` | `server.ts` | No | `http://localhost:3000,http://localhost:5173` |
| `VITE_API_URL` | Frontend `useMenuItems.ts`, `App.tsx` | No | `http://localhost:3001` |

---

## Database

**PostgreSQL** hosted on Railway (via `DATABASE_URL`). Connection managed by `pg` (node-postgres) connection pool in `src/db/pool.ts`.

### Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `menu_items` | Product catalog (name, category, product_category, prices, variants JSONB, description, image) | Active — managed via admin panel |
| `contacts` | Contact form submissions (name, email, message, clerk_user_id) | Active |
| `orders` | Order records (order_number, clerk_user_id, items JSONB, subtotal, status, table_id, guest_name, split_bill) | Active — 5 statuses + tableside fields |
| `addons` | Sauces, drinks, extras (type, name, price, is_active, sort_order) | Active — seeded with defaults |
| `tables` | Table management for QR ordering (table_number, qr_token, capacity, is_active) | Active — 8 seeded tables with UUID QR tokens |

### Auto-migration

On server startup, `server.ts` auto-runs `schema.sql` (idempotent `CREATE TABLE IF NOT EXISTS`) and `seed.sql` (inserts only if table is empty for menu_items, tables, addons).

---

## API Endpoints

### Public (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/menu-items` | Returns all products |
| GET | `/api/addons` | Active add-ons (sauces, drinks, extras) |
| GET | `/api/table/:qrToken` | Lookup table info by QR token |
| POST | `/api/orders/table` | Place order from table (guest name + items) |
| POST | `/api/contact` | Saves contact form |

### Protected (requireAuth)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/orders` | Create order (delivery) |
| GET | `/api/orders` | User's orders |
| GET | `/api/admin/check` | Check admin/manager role |
| GET | `/api/kitchen/check` | Check kitchen role |

### Admin/Manager only

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/orders/admin` | All orders |
| PATCH | `/api/orders/:id/status` | Update order status |
| POST/PUT/DELETE | `/api/menu-items[/:id]` | Product CRUD |
| GET/POST/PUT/DELETE | `/api/addons[/:id]` | Add-on CRUD |
| GET | `/api/addons/admin` | All add-ons (incl. inactive) |
| GET/POST/PATCH/DELETE | `/api/tables[/:id]` | Table CRUD with QR tokens |
| GET | `/api/users` | List Clerk users |
| PATCH | `/api/users/:id/role` | Update user role (user/manager/kitchen/admin) |

### Kitchen role only

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/kitchen/orders` | Active orders (confirmed/preparing) |
| PATCH | `/api/kitchen/orders/:id/status` | Update status (preparing/ready/delivered) |

---

## Payments

**Not implemented.** The checkout flow generates a random order ID and records it in the database, but no payment processor is called.

---

## Hosting

- **Railway** deployment
- GitHub repo: `github.com/muneebarshad2610-dotcom/SaunceandChese`

---

## App Flow

**SPA with History API routing.** Pages switched via `window.history.pushState()`.

```
Pages:
  /              → Hero + StorySection + InstagramMarquee + LocationsSection + Footer
  /menu          → MenuSection + DealsSection + Footer
  /orders        → OrderHistory (requires sign-in)
  /admin         → AdminDashboard (admin/manager) → tabs: Orders, Products, Users, Add-ons, Tables
  /kitchen       → KitchenView (kitchen role) — standalone full-screen display
  /table/:token  → TableOrder (public) — QR ordering page, no auth

Shared shell (renderShell): Navbar, Footer, QuickViewModal, CartDrawer, CheckoutConfirmModal, CheckoutForm, PaymentModal, OrderSuccessModal
Standalone pages (no shell): /kitchen, /table/:token, /terms, /privacy
```

---

## Folder Structure

```
/
├── index.html                  # Entry HTML with SEO/OG tags
├── package.json                # Dependencies and scripts
├── server.ts                   # Express server with custom Clerk auth + PostgreSQL
├── src/
│   ├── main.tsx                # App entry — ClerkProvider wraps <App />
│   ├── App.tsx                 # Orchestrator with page routing + shared shell
│   ├── types/
│   │   └── index.ts            # Shared interfaces + addon helpers (fetchAddons, clearAddonCache)
│   ├── hooks/
│   │   ├── useCart.ts          # Cart state + localStorage persistence
│   │   └── useMenuItems.ts     # Fetch menu items from API
│   ├── pages/
│   │   ├── AdminDashboard.tsx   # Tabbed admin (Orders, Products, Users, Add-ons, Tables)
│   │   ├── AdminOrders.tsx      # Order management (view, filter, update status)
│   │   ├── AdminProducts.tsx    # Product/deal CRUD
│   │   ├── AdminUsers.tsx       # User list + role management (user/manager/kitchen/admin)
│   │   ├── AdminAddons.tsx      # Add-on management (sauces, drinks, extras)
│   │   ├── AdminTables.tsx      # Table management with QR codes
│   │   ├── KitchenView.tsx      # Kitchen display with live order tickets
│   │   ├── TableOrder.tsx       # Public QR ordering page (no auth)
│   │   ├── OrderHistory.tsx     # User's past orders view
│   │   ├── TermsOfService.tsx   # Terms of service page
│   │   └── PrivacyPolicy.tsx    # Privacy policy page
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   ├── layout/  (Navbar, Footer)
│   │   ├── sections/ (Hero, Story, Menu, Deals, Marquee, Locations)
│   │   ├── modals/ (QuickView, CartDrawer, CheckoutConfirm, CheckoutForm, PaymentModal, OrderSuccess)
│   │   └── ui/ (MenuCard, DealCard, SkeletonCard)
│   └── db/
│       ├── pool.ts             # PostgreSQL connection pool
│       ├── schema.sql          # Database schema (5 tables + migrations)
│       └── seed.sql            # Seed data for menu items, tables, add-ons
```
