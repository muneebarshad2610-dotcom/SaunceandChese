# Development Phases — Sauce n' Cheese

---

## Phase 1: Brand & Marketing Pages [Done]

- [x] Hero section with brand name, tagline, CTAs
- [x] "Our Story" narrative section with imagery
- [x] Locations section with hardcoded address, phone, maps link
- [x] Instagram brand marquee with food imagery
- [x] Footer with brand info and social link
- [x] Retro-brutalist visual design system (colors, fonts, shadows, animations)
- [x] Responsive layout (mobile through desktop)

## Phase 2: Menu & Cart UX [Done]

- [x] Menu section layout with filter tabs (All/Classic/Special)
- [x] Menu item card design (image, name, description, price, customize/quick-add buttons)
- [x] Hot Deals section layout with deal cards
- [x] Quick View product customization modal (cheese pull level, sauce type, size, quantity)
- [x] Interactive cheese-pull SVG visualizer with drag interaction
- [x] Shopping cart drawer (items list, quantity controls, subtotal, remove)
- [x] Cart persistence in localStorage
- [x] Order success modal with receipt and "Live Kitchen Tracker"

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
- [x] Database schema (3 tables: menu_items, contacts, orders) auto-applied
- [x] CORS configured — read from CORS_ORIGINS env var
- [x] Input validation — email format regex, required field checks
- [x] Environment variables managed via .env and dotenv
- [x] POST /api/orders endpoint — creates order records in database
- [x] Order submission linked to authenticated Clerk user
- [ ] Payment processing integration

## Phase 6: Payments [Not Started]

- [ ] Integrate a payment provider (Razorpay, Stripe, or local Pakistan payment processor)
- [ ] Real checkout flow with payment confirmation
- [ ] Order confirmation emails/SMS

## Phase 7: Auth & User Accounts [Done]

- [x] Clerk integration — installed `@clerk/react` v6, wraps app with `<ClerkProvider>`
- [x] Sign-in / Sign-up UI — Clerk pre-built components (`SignInButton`, `SignUpButton`, `UserButton`)
- [x] Protected checkout — cart drawer shows "Sign In to Checkout" if not authenticated
- [x] Backend session verification — Clerk `requireAuth()` middleware on POST /api/orders
- [x] Orders stored with `clerk_user_id` — tied to authenticated user
- [ ] User profile page — Clerk provides UserButton but no custom profile page
- [ ] Order history page — data exists in DB but no UI to view past orders
- [ ] Saved addresses and preferences — per-user settings not yet implemented

## Phase 8: Polish & Quality [Done]

- [x] Error boundaries — ErrorBoundary component wraps the app
- [x] Loading/skeleton states — SkeletonCard for menu and deals
- [x] SEO metadata and Open Graph tags — full OG/Twitter card meta tags
- [x] Image optimization and lazy loading — `loading="lazy"` on all below-fold images
- [x] Proper page title — "Sauce n' Cheese — Karachi's Gooiest Feast"
- [x] Fix cheese-pull drag drift bug — using `useRef` + `info.point.y`
- [x] Remove unused dependencies — `@google/genai`, `railway` removed
- [ ] Unit tests — not yet implemented
- [ ] Accessibility audit — not yet conducted
- [ ] PWA / service worker — not yet implemented
