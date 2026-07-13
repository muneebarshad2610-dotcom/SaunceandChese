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

## [2026-07-14] — Tableside QR ordering + Kitchen display system

- **What was completed**:
  - **Tables DB**: `tables` table with auto-generated QR tokens, seeded 8 sample tables, `table_id`/`guest_name`/`split_bill` on orders
  - **Table CRUD API**: GET/POST/PATCH/DELETE /api/tables (admin/manager) + GET /api/table/:token (public QR lookup)
  - **Table ordering API**: POST /api/orders/table (public, guest name + items → kitchen)
  - **Kitchen API**: GET /api/kitchen/orders + PATCH /api/kitchen/orders/:id/status (kitchen role only)
  - **Kitchen check API**: GET /api/kitchen/check (auth) + role whitelist now accepts 'kitchen'
  - **TableOrder.tsx**: Public QR landing page with full menu, customization, cart, order placement
  - **KitchenView.tsx**: Dark-themed kitchen display with auto-refresh, status flow, urgency alerts
  - **AdminTables.tsx**: Table management UI with QR URL copy
  - **AdminDashboard.tsx**: Added Tables tab
  - **AdminUsers.tsx**: Added Kitchen role option
  - **Navbar.tsx**: Kitchen link gated by isKitchen prop
  - **App.tsx**: Routes for /kitchen and /table/:token
- **Files touched**: server.ts, src/db/schema.sql, src/db/seed.sql, src/App.tsx, src/types/index.ts, src/pages/TableOrder.tsx (new), src/pages/KitchenView.tsx, src/pages/AdminTables.tsx, src/pages/AdminDashboard.tsx, src/pages/AdminUsers.tsx, src/components/layout/Navbar.tsx, docs/
- **Known issues / TODO**: Split bill UI not implemented. No QR image download. No kitchen sound alert. No printable tickets. Payments not integrated. Cart uses hardcoded prices.

## [2026-07-14] — Product categories + dynamic variants

- **What was completed**:
  - **Product categories**: `product_category` column on `menu_items` — free-text food categories (Pizza, Burger, Broast, etc.) set in AdminProducts, displayed as badges and used as filter tabs in MenuSection
  - **Dynamic variants**: `variants` JSONB column — flexible variant groups with options + price adjustments. Replaces hardcoded size system. QuickViewModal dynamically renders variant buttons. Backward compatible with old data.
  - **Price calculation**: Base price + variant option premiums. `CartItem` now stores `selectedVariants`.
  - **AdminProducts**: Added product category input (with autocomplete) and full variant group/option editor.
  - **Server**: All 3 menu-item endpoints handle `product_category` and `variants`. Old `prices` format auto-converts.
- **Files touched**: src/db/schema.sql, src/types/index.ts, server.ts, src/pages/AdminProducts.tsx, src/components/sections/MenuSection.tsx, src/components/modals/QuickViewModal.tsx, src/hooks/useCart.ts, src/components/modals/CartDrawer.tsx, src/pages/AdminOrders.tsx, src/pages/KitchenView.tsx, src/pages/OrderHistory.tsx, src/pages/TableOrder.tsx, docs/
