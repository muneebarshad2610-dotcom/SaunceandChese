# Project Memory

## [2026-07-13] — Reverse-engineered docs from existing codebase

- **What was completed**: Full read-only audit. Generated 7 documentation files from actual source code analysis.
- **Files touched**: All docs/ files
- **Known issues**: Frontend-only prototype, empty menu, no backend, no auth, no payments.

## [2026-07-13] — Refactored monolithic App.tsx into modular component architecture

- **What was completed**: Split ~1300-line App.tsx into 14 components, 2 hooks, shared types. Fixed index.html title, QuickViewModal state reset, removed dead code.
- **Files touched**: All components/, hooks/, types/, App.tsx (rewritten), index.html, env.d.ts, docs/

## [2026-07-13] — Built Express backend with PostgreSQL (Phase 3 + 4)

- **What was completed**: Created Express server with auto-migration, PostgreSQL database with 3 tables and 13 seeded menu items, GET /api/menu-items and POST /api/contact endpoints.
- **Files touched**: server.ts, src/db/, .env, .gitignore, package.json, docs/

## [2026-07-13] — COMPLETE REBUILD with Clerk Auth

- **What was completed**: Full-stack rebuild with Clerk auth, Express server, PostgreSQL, all UI components, modals, error boundaries, SEO.
- **Files touched**: All src/, server.ts, index.html, package.json, .env.example, .gitignore, docs/
- **Known issues / TODO**: Payments not integrated. Order history page not built. No tests yet.

## [2026-07-13] — Railway deployment fixes + DB migration fix

- **What was completed**: Static file serving, start script fix, tsx moved to deps, DB migration fix.
- **Files touched**: server.ts, package.json, vite.config.ts, .env, .env.example, src/db/schema.sql, docs/
- **Known issues / TODO**: Payments not integrated.

## [2026-07-13] — Order management system (admin dashboard + order history)

- **What was completed**: Built AdminOrders, OrderHistory, CheckoutForm, OrderSuccessModal, added API routes.
- **Files touched**: server.ts, src/App.tsx, src/pages/AdminOrders.tsx, src/pages/OrderHistory.tsx, src/components/modals/CheckoutForm.tsx, src/components/modals/OrderSuccessModal.tsx, src/components/modals/CartDrawer.tsx, docs/
- **Known issues / TODO**: Payments not integrated.

## [2026-07-13] — Fix: JSON items serialization for pg + remove cart adjust feature

- **What was completed**: Fixed JSONB serialization error, removed cart qty adjust buttons.
- **Files touched**: server.ts, src/App.tsx, src/components/modals/CartDrawer.tsx, docs/
- **Known issues / TODO**: Payments not integrated.

## [2026-07-14] — Auth rewrite + proper page routing

- **What was completed**:
  - **Auth rewrite**: Replaced buggy `@clerk/express` middleware with custom `verifyToken()` from `@clerk/backend`. Added null-token guards throughout frontend.
  - **Page routing**: Split single scroll-page into `/`, `/menu`, `/orders`, `/admin` with History API routing. Each page shows only relevant data.
  - **Navbar/Hero**: Updated navigation to use page-based routing instead of anchor links.
- **Files touched**: server.ts, src/App.tsx, src/pages/AdminOrders.tsx, src/pages/OrderHistory.tsx, src/components/layout/Navbar.tsx, src/components/sections/Hero.tsx, docs/
- **Known issues / TODO**: Payments not integrated. No tests. No Clerk production instance configured.
