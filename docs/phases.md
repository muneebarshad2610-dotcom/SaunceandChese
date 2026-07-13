# Development Phases — Sauce n' Cheese

---

## Phase 1: Brand & Marketing Pages [Done]

- [x] Hero section with brand name, tagline, CTAs
- [x] "Our Story" narrative section with imagery
- [x] Locations section with hardcoded address, phone, maps link
- [x] Instagram brand marquee with food imagery (horizontal scrolling carousel — all images verified working)
- [x] Footer with brand info and social link
- [x] Retro-brutalist visual design system (colors, fonts, shadows, animations)
- [x] Responsive layout (mobile through desktop)

## Phase 2: Menu & Cart UX [Done]

- [x] Menu section layout with filter tabs (All/Classic/Special)
- [x] Menu item card design (image, name, description, price, customize/quick-add buttons)
- [x] Hot Deals section layout with deal cards
- [x] Quick View product customization modal (sauce type, size, quantity, addons)
- [x] Shopping cart drawer (items list, subtotal, remove button, quantity labels)
- [x] Cart persistence in localStorage
- [x] Order success modal with receipt and "Live Kitchen Tracker"
- [x] Hero section with animated cheese pull image (gentle rotation animation)

## Phase 3: Contact & Feedback [Done]

- [x] Contact form UI (name, email, message fields)
- [x] Client-side validation and success toast
- [x] Backend submission — POST /api/contact saves to PostgreSQL contacts table
- [x] Server-side validation — email regex, name/email required checks
- [x] User-facing error messages (not silently swallowed)
- [ ] Email notification or CRM integration — entries stored in DB but not forwarded

## Phase 4: Real Product Data [Done]

- [x] Populate menu items with real products — 13 items in PostgreSQL via seed.sql
- [x] Images assigned for each item (Unsplash food photography)
- [x] Real prices, descriptions, categories set
- [x] Size variants for pizza items (small/regular/large with pricing)
- [x] Items served via GET /api/menu-items endpoint

## Phase 5: Backend Integration [Done]

- [x] Express server created (server.ts) with auto-migration and seed on startup
- [x] API endpoints: GET /api/menu-items, POST /api/contact, GET /api/health
- [x] PostgreSQL database connected — hosted on Railway
- [x] Database schema auto-applied (menu_items, contacts, orders, addons, tables)
- [x] CORS configured — read from CORS_ORIGINS env var
- [x] Input validation — email format regex, required field checks
- [x] Environment variables managed via .env and dotenv
- [x] POST /api/orders endpoint — creates order records in database
- [x] GET /api/orders — returns current user's orders
- [x] GET /api/orders/admin — returns all orders (admin/manager only)
- [x] PATCH /api/orders/:id/status — update order status (admin/manager only)
- [x] GET /api/admin/check — checks if current user has admin/manager role
- [x] Admin/manager role check via Clerk public_metadata.role
- [x] Items JSON serialization fix — explicit JSON.stringify() for pg JSONB column
- [x] Order submission linked to authenticated Clerk user
- [x] Custom auth middleware — replaced buggy @clerk/express with verifyToken() from @clerk/backend
- [x] Null-token guards on all frontend getToken() calls
- [x] Product CRUD — POST/PUT/DELETE /api/menu-items (admin/manager only)
- [x] User management — GET /api/users, PATCH /api/users/:id/role (admin/manager only)
- [x] Add-on CRUD — GET/POST/PUT/DELETE /api/addons (public GET, admin for mutations)
- [ ] Payment processing integration

## Phase 5b: Order Management UI [Done]

- [x] Order history page — users can view their past orders with status tracking
- [x] Admin orders dashboard — view all orders, filter by status, update order status
- [x] Checkout form — delivery details (name, phone, address, notes) before submission
- [x] Order success modal — confirmation with order ID + animated kitchen tracker

## Phase 5c: Product & Add-on Management UI [Done]

- [x] Admin dashboard — tabbed interface (Orders, Products, Users, Add-ons, Tables)
- [x] Product CRUD — AdminProducts.tsx with create/edit modal, search, category filter, image preview
- [x] Add-on management — AdminAddons.tsx with sauces, drinks, extras CRUD
- [x] Dynamic add-on fetch — QuickViewModal fetches from API with hardcoded fallback
- [x] Add-on cache invalidation — clearAddonCache() after mutations

## Phase 5d: User & Role Management [Done]

- [x] Manager role — accepts both 'admin' and 'manager' roles
- [x] Kitchen role — accepts 'kitchen' role for kitchen display access
- [x] User management UI — AdminUsers.tsx with list, search, role dropdown (user/manager/kitchen/admin)
- [x] Role API — PATCH /api/users/:id/role sets public_metadata.role (now accepts 'kitchen')

## Phase 5e: Tableside QR Ordering [Done]

- [x] Tables database table with auto-generated QR tokens (UUID)
- [x] Table CRUD API — GET/POST/PATCH/DELETE /api/tables (admin/manager only)
- [x] Public QR lookup API — GET /api/table/:qrToken (returns table info)
- [x] Public table order API — POST /api/orders/table (no auth, just guest name + items)
- [x] table_id, guest_name, split_bill columns on orders table
- [x] Seeded 8 sample tables on startup
- [x] AdminTables.tsx — create/edit/delete tables, copy QR URLs to clipboard
- [x] AdminDashboard.tsx — Tables tab added
- [x] TableOrder.tsx — public QR landing page with menu browsing, customization, cart, order placement
- [ ] Split bill UI — split_bill column exists but no frontend implementation
- [ ] QR code image generation/download — admin can only copy URL, no PNG download

## Phase 5f: Kitchen Display System [Done]

  - [x] Kitchen role — restricted, set by admin/manager via AdminUsers. Admins and managers can also access kitchen.
  - [x] Kitchen role check API — GET /api/kitchen/check (accepts kitchen/admin/manager)
  - [x] Kitchen orders API — GET /api/kitchen/orders (active confirmed/preparing orders)
  - [x] Kitchen status API — PATCH /api/kitchen/orders/:id/status (preparing → ready → delivered)
  - [x] KitchenView.tsx — full-screen dark-themed display with auto-refresh (10s)
  - [x] Status color coding — confirmed (yellow), preparing (blue), ready (green)
  - [x] Urgent order highlighting — pulsing red ring for orders >15 min
  - [x] New-order alert animation — bell icon + "New Order!" toast
  - [x] Order tickets with table number, guest name, items, elapsed time
  - [x] Status progression buttons — "Start Preparing" → "Mark as Ready" → Completed
  - [x] Navbar Kitchen link — gated by isKitchen prop (kitchen/admin/manager users see it)
- [ ] Kitchen sound alert — no audio notification for new orders
- [ ] Printable kitchen tickets — no print layout for orders

## Phase 6: Payments [Not Started]

- [ ] Integrate a payment provider (Razorpay, Stripe, or local Pakistan payment processor)
- [ ] Real checkout flow with payment confirmation
- [ ] Order confirmation emails/SMS

## Phase 7: Auth & User Accounts [Done]

- [x] Clerk integration — installed `@clerk/react` v6, wraps app with `<ClerkProvider>`
- [x] Sign-in / Sign-up UI — Clerk pre-built components (`SignInButton`, `SignUpButton`, `UserButton`)
- [x] Protected checkout — cart drawer shows "Sign In to Checkout" if not authenticated
- [x] Backend session verification — custom middleware using `verifyToken()` from `@clerk/backend`
- [x] Orders stored with `clerk_user_id` — tied to authenticated user
- [x] Order history page — users can view past orders from their account
- [x] Admin/manager role check via Clerk public_metadata
- [x] Kitchen role check via Clerk public_metadata
- [x] User role management via admin UI (user/manager/kitchen/admin)
- [ ] User profile page — Clerk provides UserButton but no custom profile page
- [ ] Saved addresses and preferences — per-user settings not yet implemented
- [ ] Clerk production instance — currently running on dev instance

## Phase 8: Polish & Quality [Done]

- [x] Error boundaries — ErrorBoundary component wraps the app
- [x] Loading/skeleton states — SkeletonCard for menu and deals
- [x] SEO metadata and Open Graph tags — full OG/Twitter card meta tags
- [x] Image optimization and lazy loading — `loading="lazy"` on all below-fold images
- [x] Proper page title — "Sauce n' Cheese — Karachi's Gooiest Feast"
- [x] Hero cheese pull animation — gentle rotation of cheese pull image
- [x] Remove unused dependencies — `@google/genai`, `railway` removed
- [x] Proper page routing — `/`, `/menu`, `/orders`, `/admin`, `/kitchen`, `/table/:token` via History API
- [ ] Unit tests — not yet implemented
- [ ] Accessibility audit — not yet conducted
- [ ] PWA / service worker — not yet implemented
