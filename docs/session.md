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

## Session 15 — [2026-07-14] — Session token system + invoice generator

- **Session token protection**: TableOrder generates a UUID session token on first visit (stored in localStorage), sent with every order. Server enforces it — blocked sessions get 403. Admin has `POST /api/admin/block-session` endpoint to flag abuse.
- **Rate limiting**: 10 orders per table per 30 min (in-memory). Prevents spam without bothering legit guests.
- **Invoice generator**: "Print Invoice" button on expanded order in AdminOrders — opens a new window with a branded receipt and triggers print dialog.
- **Files touched**: src/pages/TableOrder.tsx, src/pages/AdminOrders.tsx, src/types/index.ts, server.ts, src/db/schema.sql, docs/

## Session 14 — [2026-07-14] — Complete remaining phases (excluding Payment)

- **Split bill UI**: Added toggle in TableOrder confirmation modal, sends `splitBill` in request.
- **QR code generation**: Added "Download QR" button in AdminTables using Google Charts QR API.
- **Kitchen sound alert**: Added Web Audio API chime when new orders arrive in KitchenView.
- **Printable kitchen tickets**: Added print button + @media print CSS in KitchenView.
- **User profile page**: Created ProfilePage.tsx with Clerk account info and address management.
- **Saved addresses**: Added `saved_addresses` table, GET/POST/DELETE /api/addresses endpoints, and full CRUD UI on profile page.
- **Files touched**: src/pages/TableOrder.tsx, src/pages/KitchenView.tsx, src/pages/AdminTables.tsx, src/pages/ProfilePage.tsx (new), src/App.tsx, src/components/layout/Navbar.tsx, src/db/schema.sql, server.ts, docs/

## Session 13 — [2026-07-14] — Fix broken marquee image URLs

- **Fixed two broken marquee images**: Replaced 404 Unsplash URLs with verified working food photos.
- **Files touched**: src/components/sections/InstagramMarquee.tsx

## Session 12 — [2026-07-14] — Fix broken cheese pull images

- **Fixed Hero cheese pull image**: Replaced broken burger image with working pizza cheese pull image. Updated badge text to "Freshly Pulled Cheese".
- **Fixed Instagram Marquee images**: Replaced all 6 carousel images with reliable Unsplash URLs.
- **Files touched**: src/components/sections/Hero.tsx, src/components/sections/InstagramMarquee.tsx

## Session 11 — [2026-07-14] — Allow managers/admins to access kitchen

- **Updated kitchen access**: Modified `isKitchenUser()` to accept 'admin', 'manager', and 'kitchen' roles. Updated App.tsx to check kitchen access for all users (not just non-admins).
- **Files touched**: server.ts, src/App.tsx

## Session 10 — [2026-07-14] — Bug fixes for table ordering

- **Fixed guest name input issue** in TableOrder.tsx: The input field was conditionally rendered based on `guestName` state, causing it to disappear after typing one character. Replaced with separate `editingGuestName` state for proper input visibility control.
- **Fixed table order display issue** in admin dashboard: Admin orders API endpoint now includes `table_id`, `guest_name`, and `split_bill` fields in the response, so table orders properly show which table they belong to.
- **Files touched**: src/pages/TableOrder.tsx, server.ts, docs/issues.md

## Session 9 — [2026-07-14] — Tableside QR ordering + Kitchen display system

- **Task given**: Tableside ordering (guests scan QR → menu → place order), QR management by manager, kitchen display for kitchen role (restricted, set by manager)
- **What I changed**:
  - **Database**:
    - Added `tables` table (table_number, qr_token, capacity, is_active) with auto-generated QR tokens
    - Added `table_id`, `guest_name`, `split_bill` columns to `orders` table
    - Added indexes on `orders.table_id` and `tables.qr_token`
    - Seeded 8 sample tables with UUID-based QR tokens
  - **Server API**:
    - Table CRUD: `GET/POST/PATCH/DELETE /api/tables` (admin/manager only)
    - QR lookup: `GET /api/table/:qrToken` (public, returns table info)
    - Table order: `POST /api/orders/table` (public, no auth, just guest name + items)
    - Kitchen orders: `GET /api/kitchen/orders` (kitchen role, active orders only)
    - Kitchen status: `PATCH /api/kitchen/orders/:id/status` (kitchen role, flow: preparing → ready → delivered)
    - Kitchen check: `GET /api/kitchen/check` (auth, checks kitchen role)
    - Role whitelist: `PATCH /api/users/:id/role` now accepts `'kitchen'`
  - **Frontend**:
    - **TableOrder.tsx** (new): Public QR landing page — guest enters name, browses full menu, customizes items (sauce, drink, extra cheese, sizes), cart management, confirmation modal, order success page. No sign-in required.
    - **KitchenView.tsx** (new): Full-screen kitchen display with dark theme, auto-refresh (10s), order tickets with status colors (confirmed=yellow, preparing=blue, ready=green), urgent order pulsing (>15 min), new-order alert animation, item details, status progression buttons
    - **AdminTables.tsx** (new): Table management — create/edit/delete tables, auto-generated QR tokens, copy QR URLs to clipboard
    - **AdminDashboard.tsx**: Added Tables tab with QrCode icon
    - **AdminUsers.tsx**: Added Kitchen role option (user/manager/kitchen/admin) with ChefHat icon and emerald color scheme
    - **Navbar.tsx**: Added Kitchen link gated by `isKitchen` prop (only appears for kitchen-role users)
    - **App.tsx**: Added `/kitchen` and `/table/:token` routes with standalone pages (no shell)

- **Files touched**: server.ts, src/db/schema.sql, src/db/seed.sql, src/App.tsx, src/types/index.ts, src/pages/TableOrder.tsx (new), src/pages/KitchenView.tsx, src/pages/AdminTables.tsx, src/pages/AdminDashboard.tsx, src/pages/AdminUsers.tsx, src/components/layout/Navbar.tsx, docs/

- **What's working now**:
  - Guests scan QR code → see table-specific landing page → browse menu → customize + order → sent to kitchen
  - Manager can create/edit/delete tables with auto-generated QR tokens
  - Kitchen staff (kitchen role) see live orders auto-refreshing every 10s with status controls
  - Kitchen role restricted — only users set by admin/manager via AdminUsers can access
  - Kitchen link only appears for kitchen-role users
  - Orders from tables are stored with table_id and guest_name for tracking

- **What's broken / unfinished**:
  - **Split bill** — `split_bill` column exists but UI not implemented on TableOrder page
  - **QR code image generation** — no downloadable QR PNG, admin can only copy URL
  - **Kitchen sound alert** — no audio notification for new orders
  - **Printable kitchen tickets** — kitchen orders shown on screen, no print layout
  - **Payments** — still not integrated
  - **Cart addon pricing** — useCart.ts still uses hardcoded constants
## Session 16 — [2026-07-14] — Product categories + dynamic variants

- **Product categories**: Added `product_category` column (VARCHAR) to `menu_items` — free-text food categories like Pizza, Burger, Broast, Pasta, etc. AdminProducts has a category input with autocomplete suggestions. MenuSection now shows dynamic product category filter tabs instead of hardcoded type tabs. AdminOrders/OrderHistory/KitchenView/CartDrawer display the category badge.
- **Dynamic variants**: Added `variants` JSONB column to `menu_items` — flexible variant groups with options and price adjustments (e.g., Size: Small/Medium/Large, Spice: Mild/Hot/Extra Hot). Replaces hardcoded small/regular/large size system. QuickViewModal dynamically renders variant buttons based on the product's variant config. Backward compatible — old `price_small/regular/large` data auto-generates a "Size" variant on read.
- **Price calculation**: Item price = base price (or old `prices[size]`) + variant option premiums. `useCart.addToCart` computes variant premium, stores `selectedVariants` on `CartItem`.
- **QuickViewModal**: Now has both legacy size selector (for old data) and dynamic variant selectors side-by-side. Shows variant option names with price adjustments.
- **AdminProducts**: Added product category input (with datalist suggestions), variant group editor (add/remove groups, add/remove options with name + price), expanded detail view shows variant structure.
- **Server**: GET /api/menu-items includes `product_category` and `variants`. Old `prices` format auto-converts to variants. POST/PUT accept `product_category` and `variants`.
- **Schema migrations**: `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS product_category VARCHAR(100)`, `ADD COLUMN IF NOT EXISTS variants JSONB`.
- **New types**: `ProductVariant`, `ProductVariantOption`, `selectedVariants` on `CartItem`/`AddToCartOptions`.
- **Files touched**: src/db/schema.sql, src/types/index.ts, server.ts, src/pages/AdminProducts.tsx, src/components/sections/MenuSection.tsx, src/components/modals/QuickViewModal.tsx, src/hooks/useCart.ts, src/components/modals/CartDrawer.tsx, src/pages/AdminOrders.tsx, src/pages/KitchenView.tsx, src/pages/OrderHistory.tsx, src/pages/TableOrder.tsx, docs/