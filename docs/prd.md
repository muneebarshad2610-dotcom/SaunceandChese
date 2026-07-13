# Product Requirements Document — Sauce n' Cheese

## Overview

Sauce n' Cheese is a **full-stack React + Express application** that serves as a branded marketing + menu showcase with online ordering for a retro-style fast-food restaurant based in Karachi, Pakistan. The app features **Clerk authentication** (v6), a **PostgreSQL database** backend, **custom auth middleware** using `@clerk/backend`, and a retro-brutalist visual design system with **page-based routing** (`/`, `/menu`, `/orders`, `/admin`).

---

## Target Users

- **End customers** in Karachi looking for a late-night food ordering experience
- Users can browse the menu as guests, but must **sign in via Clerk** to place orders
- Authenticated users get personalized order history tied to their Clerk account

---

## Features

### Working

- **Hero section with brand messaging** — static promotional banner with CTA buttons that navigate to `/menu`
- **"Our Story" brand narrative section** — static content with imagery
- **Retro-styled navigation bar** — sticky header with page navigation (Home, Menu, My Orders, Admin), Clerk sign-in/sign-up buttons, user profile button, and shopping cart badge
- **Page-based routing** — History API routing with 4 pages:
  - `/` — Hero, Story, Instagram marquee, Locations/Contact
  - `/menu` — Menu filter tabs + Hot Deals with real product data from PostgreSQL
  - `/orders` — Order history page (signed-in users only)
  - `/admin` — Admin order management dashboard (admin role only)
- **Menu filter tabs** — "All Cravings", "Classic Flavours", "Special Flavours" toggles
- **Product quick-view modal** with:
  - Cheese-pull level slider (1-5) with interactive draggable SVG visualizer (drift bug fixed)
  - Sauce type selector (4 options: Liquid Gold, Secret Lava, White Truffle Melt, Ghost Pepper Glaze)
  - Pizza size selector (small/regular/large, with dynamic pricing)
  - Quantity selector (+/-)
  - "Add to Cravings Basket" button
- **Shopping cart drawer** — right-side slide-out panel with:
  - Cart items with images, modifiers (size, cheese level), remove button (trash icon)
  - Static quantity labels (no +/- adjust buttons)
  - Subtotal calculation
  - Empty cart state
  - Cart persistence via `localStorage` (`snc_cart` key)
  - **Auth gate**: "Sign In to Checkout" shown when not authenticated
- **Checkout flow**:
  - Requires Clerk authentication
  - Confirmation prompt → delivery details form → order submission → success modal
  - Null-token guard: throws clear error if `getToken()` returns null
  - Generates order ID (SNC-XXXXXX), shows "Order Locked In!" success modal
  - "Live Kitchen Tracker" with animated steps
  - Clears the cart
- **Contact form** — name, email, message fields with client + server validation
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

### Order Management

- **Order history page** (`/orders`) — authenticated users can view their past orders with status tracking
- **Admin orders dashboard** (`/admin`) — view ALL orders, filter by status, update order status (requires `role: 'admin'` in Clerk public_metadata)
- **Checkout form** — delivery details modal (name, phone, address, delivery notes) before order submission
- **Order success modal** — confirmation with order ID, animated "Live Kitchen Tracker" steps

### Backend

- **Express server** with auto-migration and seed on startup
- **PostgreSQL database** hosted on Railway
- **Custom auth middleware** — uses `verifyToken(token, { secretKey })` from `@clerk/backend` directly (NOT `@clerk/express` which had a bug)
- **API endpoints**:
  - `GET /api/health` — health check
  - `GET /api/menu-items` — public, returns all products
  - `POST /api/contact` — public, saves submissions (optionally linked to Clerk user)
  - `POST /api/orders` — protected, creates order records
  - `GET /api/orders` — protected, returns current user's orders
  - `GET /api/orders/admin` — protected + admin check, returns ALL orders
  - `PATCH /api/orders/:id/status` — protected + admin check, updates order status
  - `GET /api/admin/check` — protected, checks if current user has admin role
- **Admin role check** via Clerk `public_metadata.role === 'admin'` (no separate DB table)
- **Items JSON serialization** — explicitly `JSON.stringify()` for pg JSONB column with try/catch guard
- **Input validation** — email regex, required field checks
- **CORS configured** — read from `CORS_ORIGINS` env var

### Database Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `menu_items` | Product catalog (13 seeded items) | Active |
| `contacts` | Contact form submissions (linked to Clerk user ID) | Active |
| `orders` | Order records (order_number, clerk_user_id, items JSONB, subtotal, status, customer info) | Active — 5 statuses: confirmed, preparing, out_for_delivery, delivered, cancelled |

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
- **User profile page** — Clerk provides UserButton but no custom profile page
- **Unit / integration / e2e tests**
- **PWA / service worker**
- **Analytics or monitoring**
- **Clerk production instance** — currently running on dev instance
