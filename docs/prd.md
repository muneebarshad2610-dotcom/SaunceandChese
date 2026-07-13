# Product Requirements Document — Sauce n' Cheese

## Overview

Sauce n' Cheese is a **full-stack React + Express application** that serves as a branded marketing + menu showcase with online ordering for a retro-style fast-food restaurant based in Karachi, Pakistan. The app features **Clerk authentication** (v6), a **PostgreSQL database** backend, and a retro-brutalist visual design system.

---

## Target Users

- **End customers** in Karachi looking for a late-night food ordering experience
- Users can browse the menu as guests, but must **sign in via Clerk** to place orders
- Authenticated users get personalized order history tied to their Clerk account

---

## Features

### Working

- **Hero section with brand messaging** — static promotional banner with CTA links to menu/deals sections
- **"Our Story" brand narrative section** — static content with imagery
- **Retro-styled navigation bar** — sticky header with Clerk sign-in/sign-up buttons, user profile button, and shopping cart badge
- **Menu filter tabs** — "All Cravings", "Classic Flavours", "Special Flavours" toggles with real product data from PostgreSQL
- **Product quick-view modal** with:
  - Cheese-pull level slider (1-5) with interactive draggable SVG visualizer (drift bug fixed)
  - Sauce type selector (4 options: Liquid Gold, Secret Lava, White Truffle Melt, Ghost Pepper Glaze)
  - Pizza size selector (small/regular/large, with dynamic pricing)
  - Quantity selector (+/-)
  - "Add to Cravings Basket" button
- **Shopping cart drawer** — right-side slide-out panel with:
  - Cart items with images, modifiers (size, cheese level), quantity controls (+/-), remove button
  - Subtotal calculation
  - Empty cart state
  - Cart persistence via `localStorage` (`snc_cart` key)
  - **Auth gate**: "Sign In to Checkout" shown when not authenticated
- **Checkout flow** — clicking "Checkout Now":
  - Requires Clerk authentication (gated by `isSignedIn`)
  - Sends order to `POST /api/orders` with Bearer token from Clerk
  - Generates order ID (SNC-XXXXXX), shows "Order Locked In!" success modal
  - Displays "Live Kitchen Tracker" with animated steps
  - Clears the cart
- **Contact form** — name, email, message fields with:
  - Client-side validation
  - Server-side email validation (POST /api/contact)
  - Error display to user (no longer silently swallowed)
  - Auto-dismissing success/error messages
- **Locations section** — hardcoded address for KAECHS Block 5, Karachi
- **Instagram brand marquee** — horizontally scrolling image strip
- **Footer** — brand info, address, hours, social link
- **Clerk authentication** — sign-in/sign-up via modal, persistent sessions, user profile button
- **Error Boundaries** — catches runtime errors with branded fallback UI
- **Loading skeleton states** — for menu items and deals while data loads
- **SEO / Open Graph meta tags** — OG image, Twitter card, description, keywords
- **Image lazy loading** — all images below the fold use `loading="lazy"`
- **Retro-brutalist visual design** — Tailwind theme with three-color palette (Crimson Red #C41E3A, Golden Yellow #FFB81C, Alabaster Cream #FDF5E6)
- **Responsive layout** — mobile-first grid with breakpoints

### Backend

- **Express server** with auto-migration and seed on startup
- **PostgreSQL database** hosted on Railway
- **API endpoints**:
  - `GET /api/menu-items` — public, returns all products
  - `POST /api/contact` — public, saves submissions (optionally linked to Clerk user)
  - `POST /api/orders` — protected (requires Clerk auth), creates order records
  - `GET /api/health` — health check
- **Clerk session verification** via `@clerk/express` middleware
- **Input validation** — email regex, required field checks
- **CORS configured** — read from `CORS_ORIGINS` env var

### Database Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `menu_items` | Product catalog (13 seeded items) | Active |
| `contacts` | Contact form submissions (linked to Clerk user ID) | Active |
| `orders` | Order records (order_number, clerk_user_id, items JSONB, subtotal) | Active |

### Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | — |
| `CLERK_SECRET_KEY` | Yes | — |
| `DATABASE_URL` | Yes | — |
| `PORT` | No | 3001 |
| `CORS_ORIGINS` | No | localhost:3000,5173 |
| `VITE_API_URL` | No | http://localhost:3001 |

### Missing / Not Implemented

- **Payment processing** — Stripe/Razorpay not yet integrated
- **Order history page** — not built yet (data exists in DB)
- **User profile page** — Clerk provides UserButton but no custom profile page
- **Unit / integration / e2e tests**
- **PWA / service worker**
- **Analytics or monitoring**
