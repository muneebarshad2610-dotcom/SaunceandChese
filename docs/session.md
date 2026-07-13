# Session Handoff Log

## Session 0 — [2026-07-13] — docs reverse-engineered

- Read-only pass. Created docs/ directory with 7 documentation files.

## Session 1 — [2026-07-13] — Refactored into modular components

- Split App.tsx into 14 components, 2 hooks, types file. Fixed title, state reset.

## Session 2 — [2026-07-13] — Built Express backend with PostgreSQL (Phase 3 + 4)

- Created Express server with auto-migration, PostgreSQL database with 3 tables and 13 seeded menu items, GET /api/menu-items and POST /api/contact endpoints.

## Session 3 — [2026-07-13] — Complete rebuild with Clerk auth + production-ready features

- **Task given at start of session**: "Continue making it prod ready" → then "Delete it all except docs, create again with Clerk auth"
- **What I changed**:
  - Deleted all old source code (src/, server.ts, index.html, login-helper.cjs, README.md, metadata.json)
  - Installed Clerk deps: `@clerk/clerk-react`, `@clerk/express`, later migrated to `@clerk/react` v6
  - Created `server.ts` — Express server with auto-migration on startup
  - Created database layer: `src/db/pool.ts`, `src/db/schema.sql`, `src/db/seed.sql`
  - Created React frontend with ClerkProvider, Show, useAuth
  - All UI components (Hero, Story, Menu, Deals, Marquee, Locations, Footer)
  - All modals (QuickView, CartDrawer, OrderSuccess)
  - ErrorBoundary, SkeletonCard, loading skeletons, SEO/OG tags, lazy loading
  - Clerk CLI initialized and logged in
  - Cleaned up unused dependencies
  - Committed and pushed

## Session 4 — [2026-07-13] — Railway deployment fixes + DB migration fix

- Added static file serving, fixed start script, moved tsx to deps
- Fixed DB migration with ALTER TABLE IF NOT EXISTS for clerk_user_id
- Committed and pushed

## Session 5 — [2026-07-13] — Order management system (admin dashboard + order history)

- Built AdminOrders, OrderHistory, CheckoutForm, OrderSuccessModal
- Added API routes: GET /api/orders, GET /api/orders/admin, PATCH /api/orders/:id/status, GET /api/admin/check
- Updated App.tsx with page routing for orders/admin

## Session 6 — [2026-07-13] — Fix JSON items serialization + remove cart adjust buttons

- Fixed `invalid input syntax for type json` error — explicit JSON.stringify() with try/catch
- Removed quantity +/- buttons from CartDrawer

## Session 7 — [2026-07-14] — Auth rewrite + proper page routing

- **Task given at start of session**: Fix "clerkUserId is null/undefined" error on POST /api/orders
- **What I changed**:
  - **Server-side auth rewrite**: Replaced buggy `@clerk/express` (`clerkMiddleware` + `requireAuth`) with a custom `requireAuth` middleware using `verifyToken(token, { secretKey })` from `@clerk/backend`. The old middleware had a bug where `req.auth` could be `undefined` instead of always being set. The custom middleware:
    - Extracts token from `Authorization: Bearer <token>` header
    - Guards against `null`, `undefined`, literal `"null"`/`"undefined"` strings, and tokens shorter than 10 chars
    - Calls `verifyToken(token, { secretKey })` to verify the Clerk JWT directly
    - Always sets `req.auth = { userId: payload.sub }` on success
    - Always returns 401 with clear error on failure
  - **Frontend null-token guards**: Added `if (!token) return/throw` checks on `getToken()` calls in:
    - `App.tsx` — handleConfirmCheckout, admin check
    - `AdminOrders.tsx` — checkAdmin, fetchOrders, updateStatus
    - `OrderHistory.tsx` — fetchOrders
  - **Page routing refactor**: Split the single scroll-page into proper URL-based pages:
    - `/` — Hero, Story, InstagramMarquee, Locations (brand/marketing)
    - `/menu` — MenuSection, DealsSection (products + deals)
    - `/orders` — OrderHistory
    - `/admin` — AdminOrders
    - All pages share a `renderShell()` with Navbar, Footer, and all modals
  - **Navbar update**: Replaced anchor links (`#menu`, `#story`, etc.) with proper page navigation buttons using History API
  - **Hero CTAs**: Changed from `<a href="#menu">` to `<button onClick>` that navigates to `/menu`

- **Files touched**: server.ts, src/App.tsx, src/pages/AdminOrders.tsx, src/pages/OrderHistory.tsx, src/components/layout/Navbar.tsx, src/components/sections/Hero.tsx, docs/

- **What's working now**:
  - Backend auth is reliable — uses `verifyToken()` from `@clerk/backend` directly
  - Frontend guards against null tokens everywhere
  - Proper page routing: `/`, `/menu`, `/orders`, `/admin`
  - Users see only the data they need per page
  - Everything from previous sessions still works

- **What's broken / unfinished**:
  - **Payments** — no payment processor integrated (mock checkout only)
  - **User profile page** — Clerk provides basic UserButton, no custom page
  - **Tests** — no unit, integration, or e2e tests
  - **Clerk production instance** — currently running on dev instance
