# Coding Rules & Conventions — Sauce n' Cheese

*Inferred from existing code — not prescribed.*

---

## Observed Patterns

### Naming Conventions

- **Components**: PascalCase — named exports used for components (e.g., `Navbar`, `Hero`, `MenuSection`, `QuickViewModal`)
- **Variables/functions**: camelCase (`setIsCartOpen`, `updateCartAndStorage`)
- **Types/interfaces**: PascalCase (`MenuItem`, `CartItem`)
- **CSS classes**: Tailwind utility classes exclusively; custom utilities use kebab-case (`retro-shadow`, `blob-mask`, `animate-marquee`)
- **Event handlers**: `handle` prefix for form events (`handleContactSubmit`), descriptive names for others (`openQuickView`, `quickAddToCart`)

### Component Structure

- **Modular**: `App.tsx` is a thin orchestrator with `renderShell()` shared layout; UI split into `layout/`, `sections/`, `modals/`, `ui/` subdirectories under `src/components/`
- **State management**: Local `useState` hooks, with shared logic extracted into custom hooks (`useCart`, `useMenuItems`) under `src/hooks/`
- **Modals**: Each modal owns its own internal state via `useState` + `useEffect` for initialization; controlled via `isOpen`/`null` pattern from parent
- **Event handling**: Handlers wrapped in `useCallback` when passed as props to child components
- **Type definitions**: Shared interfaces in `src/types/index.ts`

### Styling Approach

- **Tailwind CSS v4** with CSS-first configuration (`@theme` directive in `index.css`)
- **Custom utility classes**: `retro-shadow`, `retro-shadow-sm`, `retro-shadow-gold`, `retro-shadow-red`, `blob-mask`
- **CSS animations**: `marquee` (30s linear infinite), `float` (5s ease-in-out)
- **Typography**: `font-sans` (Poppins), `font-retro` (Bebas Neue), `font-handwritten` (Kalam)

### Data Patterns

- **Empty state UI**: Every data-driven section has a polished empty/placeholder state
- **localStorage persistence**: Cart saved/loaded via `JSON.parse/stringify` under key `snc_cart`
- **API calls**: Fetch from Express backend with Clerk Bearer token for protected endpoints
- **External image URLs**: From `images.unsplash.com` with `referrerPolicy="no-referrer"`

### Clerk Auth Patterns

- **`@clerk/react` v6** — use `Show` component instead of v5's `SignedIn`/`SignedOut`
- **Imports**: `ClerkProvider`, `Show`, `SignInButton`, `SignUpButton`, `UserButton`, `useAuth` from `@clerk/react`
- **Server-side**: Custom `requireAuth` middleware using `verifyToken(token, { secretKey })` from `@clerk/backend`. **Do NOT use `@clerk/express`**.
- **Role check**: `isAdminUser()` accepts `'admin'` and `'manager'` roles. `isKitchenUser()` accepts `'kitchen'` role.
- **Protected API calls**: `useAuth().getToken()` → always null-check: `if (!token) throw/return`

### Admin Patterns

- **AdminDashboard.tsx** is the tabbed container — hoists admin/manager access check
- **Admin tab components** (AdminOrders, AdminProducts, AdminUsers, AdminAddons, AdminTables) expect `onNavigateHome` prop if they need back navigation, or rely on the dashboard tab bar
- **CRUD modals**: Create/edit forms use `AnimatePresence` + spring animations, consistently styled with the rest of the app
- **Admin API calls**: Protected via `requireAdminOrManager()` which returns 403 for non-admins

### Add-on Management

- **DB table**: `addons` (type: sauce/drink/extra, name, price, is_active, sort_order)
- **Public API**: `GET /api/addons` returns active only, ordered by type/sort_order
- **Frontend fetch**: `fetchAddons()` in `types/index.ts` with module-level caching + `clearAddonCache()` for cache invalidation after mutations
- **Fallback**: If API fails, hardcoded defaults from `SAUCE_OPTIONS`, `DRINK_OPTIONS`, `EXTRA_CHEESE_PRICE` are used

### Kitchen Display Patterns

- **KitchenView.tsx** is a standalone full-screen page (no renderShell), rendered at `/kitchen`
- **Kitchen role**: Only users with `'kitchen'` Clerk role can access kitchen API endpoints
- **Auto-refresh**: `setInterval(fetchOrders, 10000)` — 10s polling for new orders
- **Status flow**: `confirmed → preparing → ready → delivered` (kitchen controls preparing/ready/delivered)
- **Urgent orders**: Orders in `confirmed` for >15 minutes get a pulsing red ring
- **New-order alert**: `setNewOrderAlert(true)` when order count increases, auto-dismisses after 3s
- **KitchenItem type** (KitchenOrder): includes tableNumber, guestName, orderNumber, items, status, createdAt

### Table Management Patterns

- **DB table**: `tables` (table_number, qr_token UUID, capacity, is_active)
- **QR tokens**: Auto-generated UUIDs on creation via `'table-' + crypto.randomUUID()`
- **Seed tables**: 8 default tables seeded on startup (if tables table is empty)
- **QR URL format**: `[BASE_URL]/table/[qrToken]`
- **Copy to clipboard**: Uses `navigator.clipboard.writeText()` with `prompt()` fallback
- **AdminTables.tsx**: Full CRUD with inline editing, no routing library needed

### QR Ordering Patterns

- **TableOrder.tsx**: Public page (no auth), rendered at `/table/:token` via dynamic routing
- **Guest flow**: Enter name → browse menu → customize (sauce/drink/cheese/size) → cart drawer → confirm modal → order placed → success screen
- **No auth**: Table orders submitted via `POST /api/orders/table` with just guest name
- **Cart scope**: Local `useState` in TableOrder, not global `useCart` hook (table orders are separate from delivery orders)
- **Order number format**: `TBL-` prefix (e.g., `TBL-483921`)

### Page Routing

- **History API** — no client-side routing library
- Pages: `'home' | 'menu' | 'orders' | 'admin' | 'kitchen' | 'terms' | 'privacy'`
- Dynamic pages: `{ type: 'table', token: string }` for `/table/:token`
- `navigate(page)` sets state + calls `window.history.pushState()` for URL sync
- `renderShell(children)` wraps most pages with Navbar, Footer, and shared modals. Standalone pages (kitchen, table, terms, privacy) render without shell.

---

## Known Issues / Technical Debt (Avoid Making Worse)

1-11. **[FIXED]** — Various early issues resolved.

12. **No payment processing**: Checkout generates a mock order. No real payment is processed.

13. **~~No order history page~~** **[FIXED]** — Users can view past orders, admins manage all orders.

14. **~~@clerk/express middleware bug~~** **[FIXED]** — Replaced with custom `verifyToken()` from `@clerk/backend`.

15. **No tests**: Zero unit, integration, or e2e tests exist.

16. **No PWA support**: No service worker or manifest for offline/progressive capabilities.

17. **No Clerk production instance**: Currently running on development instance.

18. **Cart uses hardcoded addon prices**: `useCart.ts`'s `buildAddons()` references static constants, not dynamic API data. Prices may differ between QuickViewModal and cart.

19. **No split bill UI**: `split_bill` column exists on orders table but no frontend implementation.

20. **No QR image download**: Admin can only copy QR URL, no PNG generation for printing.

21. **No kitchen sound alerts**: New orders have a visual bell animation but no audio notification.

22. **No printable kitchen tickets**: Kitchen display is screen-only, no print layout for orders.

---

## Standard Boundaries

- **Never touch `.env` files**
- **Never restructure folders** without justification
- **Never add new dependencies without asking**
- **Always match existing patterns** for styling (Tailwind), animations (Motion), and Clerk auth (`verifyToken` from `@clerk/backend`)
