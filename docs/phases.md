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

## Phase 2: Menu & Cart UX [Done] — UI only, no data

- [x] Menu section layout with filter tabs (All/Classic/Special/Hot Deals)
- [x] Menu item card design (image, name, description, price, customize/quick-add buttons)
- [x] Hot Deals section layout with deal cards
- [x] Quick View product customization modal (cheese pull level, sauce type, size, quantity)
- [x] Interactive cheese-pull SVG visualizer with drag interaction
- [x] Shopping cart drawer (items list, quantity controls, subtotal, remove)
- [x] Cart persistence in localStorage
- [x] Order success modal with mock receipt and "Live Kitchen Tracker"

## Phase 3: Contact & Feedback [Done]

- [x] Contact form UI (name, email, message fields)
- [x] Client-side validation and success toast
- [x] **Backend submission** — POST /api/contact saves to PostgreSQL contacts table
- [x] **Server-side validation** — email regex, name/email required checks
- [ ] **Email notification or CRM integration** — entries are stored in DB but not forwarded

## Phase 4: Real Product Data [Done]

- [x] **Populate menu items with real products** — 13 items in PostgreSQL via seed.sql (5 classic, 5 special, 3 deals)
- [x] Images assigned for each item (Unsplash food photography)
- [x] Real prices, descriptions, categories set
- [x] Size variants implemented for pizza items (small/regular/large with pricing)
- [x] Items served via GET /api/menu-items endpoint

## Phase 5: Backend Integration [Done]

- [x] **Express server created** (server.ts) with auto-migration and seed on startup
- [x] **API endpoints**: GET /api/menu-items, POST /api/contact, GET /api/health
- [x] **PostgreSQL database connected** — hosted on Railway, connection via DATABASE_URL
- [x] **Database schema** (3 tables: menu_items, contacts, orders) auto-applied on startup
- [x] **CORS configured** — read from CORS_ORIGINS env var, dev fallback to localhost
- [x] **Input validation** — email format regex, required field checks on contact form
- [x] Environment variables managed via .env and dotenv
- [ ] **Gemini API integration** — @google/genai is still unused
- [ ] **Cart operations / order submission** API endpoints
- [ ] Environment variable wiring for `APP_URL`

## Phase 6: Payments [Not Started]

- [ ] Integrate a payment provider (Razorpay, Stripe, or local Pakistan payment processor)
- [ ] Real checkout flow with payment confirmation
- [ ] Order confirmation emails/SMS

## Phase 7: Auth & User Accounts [Not Started]

- [ ] **Clerk integration** — install `@clerk/clerk-react`, wrap app with `<ClerkProvider>`, configure env vars (`VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- [ ] **Sign-in / Sign-up UI** — Clerk pre-built components or custom pages with `<SignIn />`, `<SignUp />`
- [ ] **Protected routes** — wrap checkout, order history, and profile behind Clerk's `<Protect />` or route guards
- [ ] **Backend session verification** — verify Clerk session tokens in Express middleware for API routes
- [ ] **User profile page** — name, email, saved addresses, order history
- [ ] **Order history per user** — store orders keyed to Clerk user ID
- [ ] **Saved addresses and preferences** — per-user settings persisted to backend

## Phase 8: Polish & Quality [Not Started]

- [ ] Error boundaries
- [ ] Loading/skeleton states
- [ ] Unit tests
- [ ] SEO metadata and Open Graph tags
- [ ] Image optimization and lazy loading
- [ ] Accessibility audit
- [ ] Proper page title ("Sauce n' Cheese" instead of "My Google AI Studio App")
- [ ] Fix cheese-pull drag drift bug
- [ ] Remove unused dependencies (`express`, `@google/genai`, `dotenv`, `tsx`) or build them out
- [ ] Remove unused icon imports
