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

- **Frontend**: `ClerkProvider` wraps the app in `main.tsx`. Auth controls use the `Show` component:
  - `<Show when="signed-out">` renders `SignInButton` + `SignUpButton`
  - `<Show when="signed-in">` renders `UserButton`
- **Protected checkout**: CartDrawer checks `isSignedIn` prop — shows "Sign In to Checkout" if not authenticated
- **API calls**: `useAuth().getToken()` fetches a Clerk session JWT, sent as `Authorization: Bearer <token>`
- **Backend**: Custom `requireAuth` middleware uses `verifyToken(token, { secretKey })` from `@clerk/backend` directly. This was done because `@clerk/express` v2.1.40 had a bug where `req.auth` could be `undefined` instead of always being set. The custom middleware:
  - Extracts token from `Authorization: Bearer <token>` header
  - Guards against `null`, `undefined`, and literal `"null"`/`"undefined"` string tokens
  - Calls `verifyToken(token, { secretKey })` to verify the JWT
  - Sets `req.auth = { userId: payload.sub }` on success
  - Returns 401 on failure with clear error message

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
| `menu_items` | Product catalog (name, category, prices, description, image, modifiers) | Active — 13 seed items |
| `contacts` | Contact form submissions (name, email, message, clerk_user_id) | Active |
| `orders` | Order records (order_number, clerk_user_id, items JSONB, subtotal, status) | Active — written via API |

### Auto-migration

On server startup, `server.ts` auto-runs `schema.sql` (idempotent `CREATE TABLE IF NOT EXISTS`) and `seed.sql` (inserts only if table is empty).

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Health check |
| GET | `/api/menu-items` | None | Returns all products from PostgreSQL |
| POST | `/api/contact` | None | Saves contact form (optionally linked to Clerk user) |
| POST | `/api/orders` | Custom `requireAuth` | Creates order record linked to Clerk user |
| GET | `/api/orders` | Custom `requireAuth` | Returns current user's orders |
| GET | `/api/orders/admin` | Custom `requireAuth` + admin check | Returns ALL orders (admin only) |
| PATCH | `/api/orders/:id/status` | Custom `requireAuth` + admin check | Updates order status (admin only) |
| GET | `/api/admin/check` | Custom `requireAuth` | Checks if current user has admin role |

### Items JSON Serialization

`POST /api/orders` explicitly `JSON.stringify()`s the items array before passing to the PostgreSQL query to avoid edge cases in the `pg` library's JSONB type handler. A try/catch guard provides a `400` response if serialization fails.

---

## Payments

**Not implemented.** The checkout flow generates a random order ID and records it in the database, but no payment processor is called. Future integration with Stripe/Razorpay is needed for real payment processing.

---

## Hosting

- The app is configured for **Railway** deployment
- GitHub repo: `github.com/muneebarshad2610-dotcom/SaunceandChese`
- No AI Studio, Vercel, or Netlify config files

---

## App Flow

**Single-page application (SPA) with History API routing.** No client-side routing library. Pages are switched via `window.history.pushState()` in App.tsx.

```
Pages:
  /       → Hero + StorySection + InstagramMarquee + LocationsSection + Footer
  /menu   → MenuSection + DealsSection + Footer
  /orders → OrderHistory (requires sign-in)
  /admin  → AdminOrders (requires admin role)

All pages share via renderShell():
  ├─ Navbar (with Clerk auth buttons + page navigation)
  ├─ Footer
  ├─ QuickViewModal
  ├─ CartDrawer
  ├─ CheckoutConfirmModal
  ├─ CheckoutForm
  ├─ OrderSuccessModal
```

### User journey
1. User lands on `/` → sees Hero + brand story
2. Clicks "Sink Your Teeth In" → navigates to `/menu`
3. Filters items, clicks "Customize" → QuickView modal opens
4. Customizes cheese pull, sauce, size → adds to cart → cart drawer opens
5. Reviews items in cart (remove with trash button, quantity shown as label)
6. If signed out: sees "Sign In to Checkout" button → signs in via Clerk modal
7. If signed in: clicks "Checkout Now" → confirmation prompt → delivery details form → order submitted → success modal
8. Cart cleared, order recorded in database
9. Can view past orders at `/orders`, admins can manage at `/admin`

---

## Folder Structure

```
/
├── index.html                  # Entry HTML with SEO/OG tags
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config — React + Tailwind plugins
├── server.ts                   # Express server with custom Clerk auth + PostgreSQL
├── .env.example                # Template for Clerk + PostgreSQL env vars
├── .gitignore
├── Design.Md                   # Design specification
├── docs/                       # Project documentation
│   ├── prd.md
│   ├── architecture.md
│   ├── phases.md
│   ├── memory.md
│   ├── session.md
│   ├── rules.md
│   └── info.md
├── src/
│   ├── main.tsx                # App entry — ClerkProvider wraps <App />
│   ├── App.tsx                 # Orchestrator with page routing + Clerk auth + shared shell
│   ├── index.css               # Tailwind CSS imports, custom theme, keyframes
│   ├── env.d.ts                # Vite env variable type declarations
│   ├── types/
│   │   └── index.ts            # Shared interfaces (MenuItem, CartItem, etc.)
│   ├── hooks/
│   │   ├── useCart.ts          # Cart state + localStorage persistence
│   │   └── useMenuItems.ts     # Fetch menu items from API
│   ├── pages/
│   │   ├── OrderHistory.tsx        # User's past orders view
│   │   └── AdminOrders.tsx         # Admin dashboard — view all orders + update status
│   ├── components/
│   │   ├── ErrorBoundary.tsx   # Error boundary with retro fallback UI
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # Sticky nav with page links + Clerk auth + cart badge
│   │   │   └── Footer.tsx      # Brand footer with location/social
│   │   ├── sections/
│   │   │   ├── Hero.tsx         # Brand hero with CTA to /menu
│   │   │   ├── StorySection.tsx
│   │   │   ├── MenuSection.tsx  # Filter tabs + skeleton loading
│   │   │   ├── DealsSection.tsx # Hot deals + skeleton loading
│   │   │   ├── InstagramMarquee.tsx
│   │   │   └── LocationsSection.tsx # Address + contact form with error display
│   │   ├── modals/
│   │   │   ├── QuickViewModal.tsx   # Product customization (cheese-pull fixed)
│   │   │   ├── CartDrawer.tsx       # Cart with Clerk auth gate on checkout
│   │   │   ├── CheckoutConfirmModal.tsx  # Confirmation prompt before delivery form
│   │   │   ├── CheckoutForm.tsx     # Delivery details form before order submission
│   │   │   └── OrderSuccessModal.tsx
│   │   └── ui/
│   │       ├── MenuCard.tsx
│   │       ├── DealCard.tsx
│   │       └── SkeletonCard.tsx
│   └── db/
│       ├── pool.ts             # PostgreSQL connection pool
│       ├── schema.sql          # Database schema (menu_items, contacts, orders)
│       └── seed.sql            # 13 seed menu items
```
