# Product Requirements Document — Sauce n' Cheese

## Overview

Sauce n' Cheese is a **single-page React application** that serves as a branded marketing + menu showcase for a fictional retro-style fast-food restaurant based in Karachi, Pakistan. The app is a **frontend-only prototype** hosted on Google AI Studio. There is no backend server, no database, no payment processing, and no real order fulfillment. All "data" (cart, order confirmations) lives entirely in the browser's localStorage and is generated client-side.

---

## Target Users

- **End customers** in Karachi looking for a late-night food ordering experience
- The UI is designed for **one anonymous, unauthenticated user** — there is no auth, no user accounts, and no personalization

---

## Features (MVP)

### Working

- **Hero section with brand messaging** — static promotional banner with CTA links to menu/deals sections
- **"Our Story" brand narrative section** — static content with imagery
- **Retro-styled navigation bar** — sticky header with shopping cart badge and anchor links
- **Menu filter tabs** — "All Cravings", "Classic Flavours", "Special Flavours", "Hot Deals" toggles (state works, but no items exist to filter)
- **Product quick-view modal** — slide-up modal with:
  - Cheese-pull level slider (1-5)
  - Interactive draggable "cheese pull" SVG visualizer
  - Sauce type selector (4 options: Liquid Gold, Secret Lava, White Truffle Melt, Ghost Pepper Glaze)
  - Pizza size selector (small/regular/large, with dynamic pricing display)
  - Quantity selector (+/-)
  - "Add to Cravings Basket" button
- **Shopping cart drawer** — right-side slide-out panel with:
  - List of cart items with images, modifiers (size, cheese level), quantity controls (+/-), remove button
  - Subtotal calculation
  - Empty cart state with placeholder copy
  - Cart persistence via `localStorage` (`snc_cart` key)
- **Checkout flow (mock)** — clicking "Checkout Now":
  - Generates a random order ID (SNC-XXXXXX)
  - Shows a "Order Locked In!" success modal with fake receipt
  - Displays a "Live Kitchen Tracker" with animated steps
  - Clears the cart
- **Contact/feedback form** — inline form with name, email, message fields and client-side validation; shows success message but does NOT submit data anywhere
- **Locations section** — hardcoded address for KAECHS Block 5, Karachi with phone number, Google Maps link, and hours
- **Instagram brand marquee** — horizontally scrolling image strip with duplicate content for seamless looping
- **Footer** — brand info, address, hours, social link
- **Retro-brutalist visual design** — custom Tailwind theme with three-color palette (Crimson Red #C41E3A, Golden Yellow #FFB81C, Alabaster Cream #FDF5E6), custom utility classes (`retro-shadow`, `blob-mask`, `animate-marquee`)
- **Responsive layout** — mobile-first grid with breakpoints at md, lg breakpoints
- **Framer Motion/page transitions** — AnimatePresence for modals, layout animations for menu grid

### Partial

- **Cart item modifier display** — shows size and cheese level but NOT sauce type selected — [Partial]
- **Cheese-pull drag interaction** — works but has a drift/jank issue on repeated drags (the `pullHeight` accumulates incorrectly instead of using absolute position) — [Partial]

### Stubbed-but-Unused

- **Menu items data** — `MENU_ITEMS` array exists and is fully typed but is **empty** (`const MENU_ITEMS: MenuItem[] = []`). All menu/deals sections display placeholder "Kitchen Updating!" / "New Deals Preparing!" cards
- **Express.js** — listed as a dependency (v4.21.2) but no server code, routes, or `server.js` file exists anywhere in the repo
- **@google/genai** (Gemini API) — listed as a dependency (v2.4.0) but is never imported or used anywhere in the codebase; `metadata.json` declares `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` but no API call exists
- **login-helper.cjs** — a Node.js script for authenticating with a `superdesign` CLI tool; completely unrelated to the main app
- **Unused icon imports** — `Heart`, `ChevronRight`, `TrendingUp`, `Send` are imported from lucide-react but never used in the JSX

### Missing (not stubbed)

- No real backend API or server
- No database
- No user authentication or accounts
- No payment processing
- No real order submission or fulfillment
- No contact form submission to any endpoint
- No error boundaries
- No loading/skeleton states
- No analytics or monitoring
- No tests (unit, integration, or e2e)
- No SEO metadata or Open Graph tags
- No service worker or PWA support
- No image optimization or lazy loading (all images are external Unsplash URLs)

---

## Out of Scope

- Anything requiring a backend, database, payments, or auth is **not implemented** and the code contains no wiring for these features
- The `login-helper.cjs` script is unrelated to the app and can be ignored
- There is no admin panel, no staff portal, and no order management system

---

## Content Needed From Client

TBD
