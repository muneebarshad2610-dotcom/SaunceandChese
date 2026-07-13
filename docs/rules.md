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
- **Role check**: `isAdminUser()` accepts both `'admin'` and `'manager'` roles
- **Protected API calls**: `useAuth().getToken()` → always null-check: `if (!token) throw/return`

### Admin Patterns

- **AdminDashboard.tsx** is the tabbed container — hoists admin/manager access check
- **Admin tab components** (AdminOrders, AdminProducts, AdminUsers, AdminAddons) expect `onNavigateHome` prop if they need back navigation, or rely on the dashboard tab bar
- **CRUD modals**: Create/edit forms use `AnimatePresence` + spring animations, consistently styled with the rest of the app
- **Admin API calls**: Protected via `requireAdminOrManager()` which returns 403 for non-admins

### Add-on Management

- **DB table**: `addons` (type: sauce/drink/extra, name, price, is_active, sort_order)
- **Public API**: `GET /api/addons` returns active only, ordered by type/sort_order
- **Frontend fetch**: `fetchAddons()` in `types/index.ts` with module-level caching + `clearAddonCache()` for cache invalidation after mutations
- **Fallback**: If API fails, hardcoded defaults from `SAUCE_OPTIONS`, `DRINK_OPTIONS`, `EXTRA_CHEESE_PRICE` are used

### Page Routing

- **History API** — no client-side routing library
- Pages: `'home' | 'menu' | 'orders' | 'admin'`
- `navigate(page)` sets state + calls `window.history.pushState()` for URL sync
- `renderShell(children)` wraps all pages with Navbar, Footer, and shared modals

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

---

## Standard Boundaries

- **Never touch `.env` files**
- **Never restructure folders** without justification
- **Never add new dependencies without asking**
- **Always match existing patterns** for styling (Tailwind), animations (Motion), and Clerk auth (`verifyToken` from `@clerk/backend`)
