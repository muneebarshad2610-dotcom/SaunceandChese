# Project Memory

## [2026-07-13] — Reverse-engineered docs from existing codebase

- **What was completed**: Full read-only audit. Generated 7 documentation files from actual source code analysis.
- **Files touched**: All docs/ files
- **Known issues**: Frontend-only prototype, empty menu, no backend, no auth, no payments.

## [2026-07-13] — Refactored monolithic App.tsx into modular component architecture

- Split ~1300-line App.tsx into 14 components, 2 hooks, shared types.

## [2026-07-13] — Built Express backend with PostgreSQL (Phase 3 + 4)

- Created Express server, PostgreSQL with 3 tables and 13 seeded menu items.

## [2026-07-13] — COMPLETE REBUILD with Clerk Auth

- Full-stack rebuild with Clerk auth, Express, PostgreSQL, all UI components.

## [2026-07-13] — Railway deployment fixes + DB migration fix

- Static file serving, start script fix, DB migration.

## [2026-07-13] — Order management system (admin dashboard + order history)

- AdminOrders, OrderHistory, CheckoutForm, OrderSuccessModal, API routes.

## [2026-07-13] — Fix: JSON items serialization for pg + remove cart adjust feature

- Fixed JSONB serialization, removed cart qty adjust buttons.

## [2026-07-14] — Auth rewrite + proper page routing

- Custom verifyToken() middleware, page-based routing (/, /menu, /orders, /admin).

## [2026-07-14] — Complete admin system (products, users, add-ons, manager role)

- **What was completed**:
  - **Manager role**: `isAdminUser()` accepts both `'admin'` and `'manager'`
  - **Product CRUD**: API + AdminProducts.tsx — create/edit/delete menu items with prices, sizes, images
  - **User management**: API + AdminUsers.tsx — list Clerk users, change roles via dropdown
  - **Add-on management**: `addons` DB table + CRUD API + AdminAddons.tsx + dynamic QuickViewModal integration
  - **Tabbed admin dashboard**: AdminDashboard.tsx with Orders/Products/Users/Add-ons tabs, hoisted access check
  - **Cache invalidation**: `clearAddonCache()` exported, called after addon mutations
- **Files touched**: server.ts, src/db/schema.sql, src/db/seed.sql, src/App.tsx, src/types/index.ts, src/pages/AdminDashboard.tsx (new), src/pages/AdminProducts.tsx (new), src/pages/AdminUsers.tsx (new), src/pages/AdminAddons.tsx (new), src/pages/AdminOrders.tsx, src/components/modals/QuickViewModal.tsx, docs/
- **Known issues / TODO**: Payments not integrated. No tests. No Clerk production instance. Cart uses hardcoded addon prices.
