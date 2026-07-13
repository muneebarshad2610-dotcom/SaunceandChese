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

## Phase 3: Contact & Feedback [Partial]

- [x] Contact form UI (name, email, message fields)
- [x] Client-side validation and success toast
- [ ] **Backend submission** — form data is discarded; no API endpoint exists
- [ ] **Email notification or CRM integration** for contact form submissions

## Phase 4: Real Product Data [Not Started — Critical Gap]

- [ ] **Populate `MENU_ITEMS` with actual products** — currently empty; entire menu is unusable
- [ ] Add images for each item (replace Unsplash placeholders)
- [ ] Set real prices, descriptions, categories
- [ ] Determine which items have size variants (prices with small/regular/large) vs fixed price

## Phase 5: Backend Integration [Not Started]

- [ ] **Create a backend server** (Express is already in deps but unused)
- [ ] **API endpoints** for menu items, cart operations, order submission
- [ ] **Database** for products, orders, contacts (none exists)
- [ ] **Gemini API integration** (@google/genai is in deps but unused — metadata declares `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`)
- [ ] Environment variable wiring for `GEMINI_API_KEY` and `APP_URL` (defined in `.env.example` but never consumed in code)

## Phase 6: Payments [Not Started]

- [ ] Integrate a payment provider (Razorpay, Stripe, or local Pakistan payment processor)
- [ ] Real checkout flow with payment confirmation
- [ ] Order confirmation emails/SMS

## Phase 7: Auth & User Accounts [Not Started]

- [ ] Login/signup system
- [ ] Order history per user
- [ ] Saved addresses and preferences

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
