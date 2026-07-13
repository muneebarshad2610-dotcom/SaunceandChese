# Session Handoff Log

## Session 0 — [2026-07-13] — docs reverse-engineered

- Read-only pass. Created docs/ directory with 7 documentation files.

## Session 1 — [2026-07-13] — Refactored into modular components

- Split App.tsx into 14 components, 2 hooks, types file. Fixed title, state reset.

## Session 2 — [2026-07-13] — Built Express backend with PostgreSQL (Phase 3 + 4)

- Created Express server with auto-migration, PostgreSQL database with 3 tables and 13 seeded menu items, GET /api/menu-items and POST /api/contact endpoints.

## Session 3 — [2026-07-13] — Complete rebuild with Clerk auth + production-ready features

- Full-stack rebuild with Clerk auth, Express, PostgreSQL, all UI components, modals, error boundaries, SEO.

## Session 4 — [2026-07-13] — Railway deployment fixes + DB migration fix

- Added static file serving, fixed start script, moved tsx to deps, DB migration fix.

## Session 5 — [2026-07-13] — Order management system (admin dashboard + order history)

- Built AdminOrders, OrderHistory, CheckoutForm, OrderSuccessModal, added API routes.

## Session 6 — [2026-07-13] — Fix JSON items serialization + remove cart adjust buttons

- Fixed JSONB serialization error, removed cart qty adjust buttons.

## Session 7 — [2026-07-14] — Auth rewrite + proper page routing

- Replaced buggy @clerk/express with custom verifyToken() from @clerk/backend
- Split single scroll-page into `/`, `/menu`, `/orders`, `/admin` with History API routing
- Updated Navbar/Hero for page-based navigation

## Session 8 — [2026-07-14] — Complete admin system (products, users, add-ons, manager role)

- **Task given**: Admin/manager role, product/deal CRUD, user role management, add-on management
- **What I changed**:
  - **Manager role**: Updated `isAdminUser()` to accept both `'admin'` and `'manager'` roles. Created `requireAdminOrManager()` helper.
  - **Product CRUD API**: Added `POST /api/menu-items`, `PUT /api/menu-items/:id`, `DELETE /api/menu-items/:id` — admin/manager only
  - **User management API**: Added `GET /api/users` (list Clerk users), `PATCH /api/users/:id/role` (update role to user/manager/admin) — admin/manager only
  - **Add-ons system**: 
    - Added `addons` table to schema.sql (type: sauce/drink/extra, name, price, is_active, sort_order)
    - Added seed data for default sauces (Ketchup, Mayo, etc.), drinks (Pepsi, 7 Up, etc.), extras (Extra Cheese)
    - Added CRUD API: `GET /api/addons` (public, active only), `GET/POST/PUT/DELETE /api/addons` (admin/manager)
  - **AdminDashboard.tsx**: Tabbed interface with Orders, Products, Users, Add-ons tabs. Hoisted admin/manager access check with "Access Denied" fallback.
  - **AdminProducts.tsx**: Full CRUD UI for menu items with create/edit modal, search, category filter, image preview, expand/collapse details
  - **AdminUsers.tsx**: User list from Clerk API with search and role dropdown (user/manager/admin)
  - **AdminAddons.tsx**: Add-on management with create/edit/delete, type filter, active/inactive toggle, sort order
  - **QuickViewModal.tsx**: Now fetches add-ons dynamically from `GET /api/addons` with fallback to hardcoded defaults
  - **types/index.ts**: Added `AddonItem` interface, `fetchAddons()` with caching, `clearAddonCache()`, helper functions. Kept backward-compatible `SAUCE_OPTIONS`, `DRINK_OPTIONS`, `EXTRA_CHEESE_PRICE` exports.

- **Files touched**: server.ts, src/db/schema.sql, src/db/seed.sql, src/App.tsx, src/types/index.ts, src/pages/AdminDashboard.tsx (new), src/pages/AdminProducts.tsx (new), src/pages/AdminUsers.tsx (new), src/pages/AdminAddons.tsx (new), src/pages/AdminOrders.tsx, src/components/modals/QuickViewModal.tsx, docs/

- **What's working now**:
  - Manager role works like admin (sees same nav, accesses same API endpoints)
  - Full product/deal CRUD via admin UI
  - User role management via admin UI (promote to manager/admin)
  - Add-on management (sauces, drinks, extras) with dynamic frontend integration
  - QuickViewModal shows dynamically managed add-ons
  - Tabbed admin dashboard with access control

- **What's broken / unfinished**:
  - **Payments** — no payment processor integrated (mock checkout only)
  - **User profile page** — Clerk provides basic UserButton, no custom page
  - **Tests** — no unit, integration, or e2e tests
  - **Clerk production instance** — currently running on dev instance
  - **Cart addon pricing** — useCart.ts still uses hardcoded constants for cart pricing, may differ from dynamically displayed prices
