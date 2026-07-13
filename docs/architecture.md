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
- **Role check**: `isAdminUser()` accepts both `'admin'` and `'manager'` roles via Clerk `public_metadata.role`.

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
| `menu_items` | Product catalog (name, category, prices, description, image) | Active — 13 seed items |
| `contacts` | Contact form submissions (name, email, message, clerk_user_id) | Active |
| `orders` | Order records (order_number, clerk_user_id, items JSONB, subtotal, status) | Active — 5 statuses |
| `addons` | Sauces, drinks, extras (type, name, price, is_active, sort_order) | Active — seeded with defaults |

### Auto-migration

On server startup, `server.ts` auto-runs `schema.sql` (idempotent `CREATE TABLE IF NOT EXISTS`) and `seed.sql` (inserts only if table is empty).

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Health check |
| GET | `/api/menu-items` | None | Returns all products |
| POST | `/api/menu-items` | Admin/manager | Create product |
| PUT | `/api/menu-items/:id` | Admin/manager | Update product |
| DELETE | `/api/menu-items/:id` | Admin/manager | Delete product |
| POST | `/api/contact` | None | Saves contact form |
| POST | `/api/orders` | `requireAuth` | Create order |
| GET | `/api/orders` | `requireAuth` | User's orders |
| GET | `/api/orders/admin` | Admin/manager | All orders |
| PATCH | `/api/orders/:id/status` | Admin/manager | Update order status |
| GET | `/api/admin/check` | `requireAuth` | Check admin/manager role |
| GET | `/api/users` | Admin/manager | List Clerk users |
| PATCH | `/api/users/:id/role` | Admin/manager | Update user role |
| GET | `/api/addons` | None | Active add-ons |
| GET | `/api/addons/admin` | Admin/manager | All add-ons (incl. inactive) |
| POST | `/api/addons` | Admin/manager | Create add-on |
| PUT | `/api/addons/:id` | Admin/manager | Update add-on |
| DELETE | `/api/addons/:id` | Admin/manager | Delete add-on |

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
  /       → Hero + StorySection + InstagramMarquee + LocationsSection + Footer
  /menu   → MenuSection + DealsSection + Footer
  /orders → OrderHistory (requires sign-in)
  /admin  → AdminDashboard (admin/manager) → tabs: Orders, Products, Users, Add-ons

All pages share via renderShell(): Navbar, Footer, QuickViewModal, CartDrawer, CheckoutConfirmModal, CheckoutForm, OrderSuccessModal
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
│   │   ├── AdminDashboard.tsx   # Tabbed admin (Orders, Products, Users, Add-ons)
│   │   ├── AdminOrders.tsx      # Order management (view, filter, update status)
│   │   ├── AdminProducts.tsx    # Product/deal CRUD
│   │   ├── AdminUsers.tsx       # User list + role management
│   │   ├── AdminAddons.tsx      # Add-on management (sauces, drinks, extras)
│   │   └── OrderHistory.tsx     # User's past orders view
│   ├── components/
│   │   ├── ErrorBoundary.tsx
│   │   ├── layout/  (Navbar, Footer)
│   │   ├── sections/ (Hero, Story, Menu, Deals, Marquee, Locations)
│   │   ├── modals/ (QuickView, CartDrawer, CheckoutConfirm, CheckoutForm, OrderSuccess)
│   │   └── ui/ (MenuCard, DealCard, SkeletonCard)
│   └── db/
│       ├── pool.ts             # PostgreSQL connection pool
│       ├── schema.sql          # Database schema (4 tables + migrations)
│       └── seed.sql            # Seed data for menu items + add-ons
```
