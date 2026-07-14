# Issues & Bug Tracker

## 🔴 Critical

### 1. No `strict: true` in tsconfig
- **File**: `tsconfig.json`
- **Problem**: Missing `strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`. Allows `any` types and null/undefined bugs to pass compilation.
- **Fix**: Enable strict mode and fix resulting type errors.

---

## 🟠 High

### 2. Widespread `any` Types (20+ occurrences)
- **Files**: `server.ts:44,54,122,222,236,626`, `AdminOrders.tsx:12,172,174,499,517`, `OrderHistory.tsx:302,322`, etc.
- **Fix**: Replace `any` with proper types (`Request`, `Response`, `CartItem[]`, etc.).

### 3. Hardcoded CSS Colors Not Using Theme Tokens
- **Files**: All `.tsx` files — `bg-[#C41E3A]`, `text-[#FFB81C]`, etc. used hundreds of times.
- **Fix**: Define color tokens in tailwind config and reference by name.

### 4. JSON Parse Fallback Silently Swallows Errors
- **Files**: `App.tsx:212,250`, `AdminProducts.tsx:181`, `AdminTables.tsx:97`, `AdminAddons.tsx:124`, `TableOrder.tsx:158`
- **Pattern**: `await res.json().catch(() => ({}))` — returns `{}` on invalid JSON, then `.error` is `undefined`, masking real server errors.
- **Fix**: Check `Content-Type` or let JSON parse throw and handle in catch.

### 5. KitchenView Web Audio Context Created Without User Gesture
- **File**: `src/pages/KitchenView.tsx:51-61`
- **Problem**: `new AudioContext()` in `useEffect` — modern browsers block it without user interaction.
- **Fix**: Create on first user click/tap, or use a resume-on-interaction pattern.

### 6. No Pagination on Orders / Users API
- **File**: `server.ts:331-353,356-382,619-643`
- **Problem**: Returns all orders/users with no limit. Will become slow as DB grows.
- **Fix**: Add `LIMIT`/`OFFSET` with page query params.

### 7. Table Order Session Tokens Not Server-Generated
- **File**: `server.ts:1062`, `TableOrder.tsx:40-48`
- **Problem**: Session token is generated client-side via `crypto.randomUUID()` in localStorage. Server never validates the token came from a legitimate QR scan.
- **Fix**: Generate session token server-side on first QR page load, return as cookie/response.

### 8. User Role Lookup Calls Clerk API on Every Request (No Cache)
- **File**: `server.ts:203-214`
- **Problem**: Every admin/kitchen request makes a sync HTTP call to Clerk to fetch role. Adds latency; breaks if Clerk is down.
- **Fix**: Extract role from Clerk JWT claims, or cache locally with TTL.

---

## 🟡 Medium

### 9. CartDrawer Uses Index-Based Keys
- **File**: `src/components/modals/CartDrawer.tsx:77`
- **Fix**: Use a stable unique key per cart item.

### 10. No Loading State for Admin Page Transitions
- **Files**: AdminProducts, AdminOrders, AdminTables — component mounts show skeleton/loading, but switching tabs re-mounts without loading indicator.
- **Fix**: Share loading state across admin tab switches.

### 11. KitchenView Limits Display to First 5 Items Per Order
- **File**: `src/pages/KitchenView.tsx:209`
- **Problem**: `order.items.slice(0, 5)` — items beyond 5 are invisible. No "show all" option.
- **Fix**: Add expand/collapse for items.

### 12. Rate Limiter Lost on Server Restart
- **File**: `server.ts`
- **Problem**: In-memory `Map` resets on restart, allowing a table to immediately send 10 more orders.
- **Fix**: Use DB-backed rate limiting or Redis.

### 13. No Input Validation on `deliveryNotes` Length
- **File**: `server.ts:268,311`
- **Fix**: Add max length validation.

### 14. Tawk.to Loaded on All Pages (Kitchen, Admin, etc.)
- **File**: `index.html:51-63`
- **Fix**: Only initialize on public-facing pages or lazy-load.

### 15. No Keyboard Shortcuts for Admin/Kitchen Power Users
- **Problem**: Kitchen staff must click buttons for every status update. Admin power users navigate entirely by click.
- **Fix**: Add keyboard shortcuts (e.g., Enter=next status, 1-5=select order).

### 16. Clerk Session Revocation Not Checked
- **File**: `server.ts:54-69`
- **Problem**: JWT verified for signature/expiry but not checked against Clerk for session revocation. Revoked sessions usable until JWT expiry (~1 hour).
- **Fix**: For sensitive operations, check session status via Clerk API.

### 17. No CSRF Protection
- **File**: `server.ts:34-37`
- **Problem**: Permissive CORS + no anti-CSRF tokens. `POST /api/orders/table` has no auth at all.
- **Fix**: Tighten CORS to production origin only; add CSRF for cookie-based flows.

---

## 🟢 Low

### 18. `dist/` Directory Committed to Git
### 19. `server.log` Committed to Git
### 20. `activeCategory` Function Defined But Never Used (`TableOrder.tsx:50-54`)
### 21. Hardcoded Phone Number in 5 Locations (`03318025998`)
### 22. Shutdown Race Condition in `server.ts:1180-1185`
### 23. Indentation Inconsistencies in `server.ts:299-314`
### 24. `base_cheese`/`base_sauce` Defaults Hardcoded in Route Handlers
### 25. MenuSection Shows "Kitchen Updating!" Empty State for All Filters When Empty
### 26. No Confirmation Dialog for Order Status Changes in AdminOrders
### 27. OrderHistory Auto-Fetches Every Mount With No Cache
### 28. AdminProducts Loads on Every Tab Switch (No Cache)
### 29. `@clerk/express` Installed But Unused
### 30. No Rate Limiting on `POST /api/contact`

---

## Fixed (Historical)

- Guest name input in TableOrder — disappearing after one character. Fixed with separate `editingGuestName` state.
- Table orders not showing table info in admin. Fixed by including `table_id`, `guest_name`, `split_bill` in admin order query.
- Hero cheese pull image broken. Fixed with working pizza cheese pull URL.
- Instagram Marquee images returning 404. Fixed all 6 with verified Unsplash URLs.
- Payment success shown before order creation — fixed. Order is created on server first, then success is shown.
- Order ID from server ignored — fixed. `res.json()` is now read and the server ID is used.
- Stale closure in handlePaymentSuccess — fixed. Cart state is snapshotted via ref at checkout start.
- `alert()` used for error feedback (12 occurrences) — replaced with toast notification system.
- No `aria-label` on Navbar icon buttons — fixed. Added to cart toggle, hamburger, close buttons.
- Duplicate `API_BASE` in 14 files — fixed. Single source in `src/lib/constants.ts`.
- `express.json()` body limit 10KB — fixed. Increased to 1MB.
- ErrorBoundary `(this as any)` access — fixed. Proper class property declarations.
- Footer links cause full page reload — fixed. Uses `onNavigate` callback instead of `<a href>`.
- No scroll lock when modals open — fixed. `useScrollLock` hook applied to all modals.
- Empty `scripts/` directory — removed.
- `Design.Md` uses `.Md` — renamed to `design.md`.
- Mock payment gateway — removed entirely. No payment processing in app.
- Console statements in production code (19 occurrences) — gated behind `import.meta.env.DEV`.
- ErrorBoundary exposes error.message to users — gated behind DEV mode.
- PUT/PATCH endpoints missing input validation — fixed for menu-items, tables, addons.
- No `aria-label` on Navbar icon buttons — fixed.
- No scroll lock when modals open — fixed.
- Admin auth returns 403 instead of 401 — fixed with `requireAdminOrManager()`.
- PII leaked in server logs — redacted (email, clerkUserId, sessionToken).
- `session_token` exposed in user-facing API — removed from GET /api/orders.
- No JSON parse error handler — added global SyntaxError handler returning 400.
- Mobile drawer behind navbar/hero — fixed with z-index reordering + render outside `<nav>`.
