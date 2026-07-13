# Product Requirements Document — Sauce n' Cheese

## Overview

Sauce n' Cheese is a **full-stack React + Express application** serving as a branded marketing + menu showcase with online ordering for a retro-style fast-food restaurant in Karachi, Pakistan. Features **Clerk authentication** (v6), **PostgreSQL database**, **custom auth middleware**, **page-based routing** (`/`, `/menu`, `/orders`, `/admin`), and a **complete admin system** with product/deal CRUD, user/role management, and add-on management.

---

## Target Users

- **End customers** in Karachi — browse menu, place orders, view history
- **Admins/Managers** — manage orders, products, add-ons, and user roles

---

## Features

### Working

- **Page-based routing**: `/` (branding), `/menu` (products + deals), `/orders` (history), `/admin` (dashboard)
- **Hero, Story, Instagram marquee, Locations/Contact** sections
- **Menu filter tabs** with real product data from PostgreSQL
- **QuickView modal** with cheese-pull, sauce, size, quantity customization — addons fetched dynamically from API
- **Shopping cart** with localStorage persistence, auth gate on checkout
- **Checkout flow**: confirmation → delivery form → order submission → success modal with kitchen tracker
- **Contact form** with client + server validation
- **Clerk auth** — sign-in/sign-up via modal, protected checkout
- **Order history** (`/orders`) — users view past orders with status tracking
- **Admin dashboard** (`/admin`) — tabbed interface:
  - **Orders tab**: View/filter/search all orders, update status (confirmed → preparing → out_for_delivery → delivered/cancelled)
  - **Products tab**: Create/edit/delete menu items and deals (name, category, price, sizes, description, image)
  - **Users tab**: List Clerk users, change roles (user/manager/admin)
  - **Add-ons tab**: Manage sauces, drinks, and extras (create/edit/delete, active/inactive toggle)
- **Manager role** — same access as admin (`'manager'` in Clerk public_metadata.role)
- **Error boundaries**, skeleton loading, SEO/OG tags, lazy loading, responsive layout

### Backend

- **Express server** with auto-migration and seed on startup
- **Custom auth middleware** using `verifyToken()` from `@clerk/backend`
- **16 API endpoints**: public (health, menu-items, contact, addons), protected (orders), admin/manager (orders/admin, menu-items CRUD, users, addons CRUD)
- **4 database tables**: menu_items (13 seeded), contacts, orders, addons (9 seeded)
- **Admin/manager role check** via Clerk `public_metadata.role`

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
- **Cart uses hardcoded addon prices** — useCart.ts references static constants, not dynamic API data
