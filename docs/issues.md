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

### 3. No `aria-label` on Some Icon-Only Buttons
- **Fix**: Remaining icon-only buttons need `aria-label`.

### 4. Hardcoded CSS Colors Not Using Theme Tokens
- **Files**: All `.tsx` files — `bg-[#C41E3A]`, `text-[#FFB81C]`, etc. used hundreds of times.
- **Fix**: Define color tokens in tailwind config and reference by name.

### 5. JSON Parse Fallback Silently Swallows Errors
- **Files**: `App.tsx:212,250`, `AdminProducts.tsx:181`, `AdminTables.tsx:97`, `AdminAddons.tsx:124`, `TableOrder.tsx:158`
- **Pattern**: `await res.json().catch(() => ({}))` — returns `{}` on invalid JSON, then `.error` is `undefined`, masking real server errors.
- **Fix**: Check `Content-Type` or let JSON parse throw and handle in catch.

### 6. KitchenView Web Audio Context Created Without User Gesture
- **File**: `src/pages/KitchenView.tsx:51-61`
- **Problem**: `new AudioContext()` in `useEffect` — modern browsers block it without user interaction.
- **Fix**: Create on first user click/tap, or use a resume-on-interaction pattern.

### 7. No Pagination on Orders / Users API
- **File**: `server.ts:331-353,356-382,619-643`
- **Problem**: Returns all orders/users with no limit. Will become slow as DB grows.
- **Fix**: Add `LIMIT`/`OFFSET` with page query params.

---

## 🟡 Medium

### 16. CartDrawer Uses Index-Based Keys
- **File**: `src/components/modals/CartDrawer.tsx:77`
- **Fix**: Use a stable unique key per cart item.

### 17. No Loading State for Admin Page Transitions
- **Files**: AdminProducts, AdminOrders, AdminTables — component mounts show skeleton/loading, but switching tabs re-mounts without loading indicator.
- **Fix**: Share loading state across admin tab switches.

### 18. Mock Payment Gateway 5% Random Failure Not Configurable
- **File**: `src/services/payment.ts:16-18`
- **Fix**: Make failure rate configurable via env var or only with specific card numbers.

### 19. No Scroll Lock When Modals Are Open
- **Files**: All modal components
- **Problem**: Background page scrolls behind modals.
- **Fix**: Set `overflow: hidden` on `document.body` when any modal is open.

### 20. KitchenView Limits Display to First 5 Items Per Order
- **File**: `src/pages/KitchenView.tsx:209`
- **Problem**: `order.items.slice(0, 5)` — items beyond 5 are invisible. No "show all" option.
- **Fix**: Add expand/collapse for items.

### 21. Rate Limiter Lost on Server Restart
- **File**: `server.ts:1000-1010`
- **Problem**: In-memory `Map` resets on restart, allowing a table to immediately send 10 more orders.
- **Fix**: Use DB-backed rate limiting or Redis.

### 22. No Input Validation on `deliveryNotes` Length
- **File**: `server.ts:268,311`
- **Fix**: Add max length validation.

### 23. Console Statements in Production Code (19 occurrences)
- **Fix**: Remove or replace with a logging service.

### 24. Tawk.to Loaded on All Pages (Kitchen, Admin, etc.)
- **File**: `index.html:51-63`
- **Fix**: Only initialize on public-facing pages or lazy-load.

### 25. CheckoutFlow: No Way to Edit Delivery Details After Payment
- **File**: `src/App.tsx`
- **Problem**: Once payment modal opens, user cannot go back to edit delivery address without canceling entirely.
- **Fix**: Add a "Back" button in PaymentModal to return to checkout form.

### 26. No Keyboard Shortcuts for Admin/Kitchen Power Users
- **Problem**: Kitchen staff must click buttons for every status update. Admin power users navigate entirely by click.
- **Fix**: Add keyboard shortcuts (e.g., Enter=next status, 1-5=select order).

---

## 🟢 Low

### 27. `dist/` Directory Committed to Git
### 28. `server.log` Committed to Git
### 29. Empty `scripts/` Directory
### 30. `Design.Md` Uses `.Md` Instead of `.md`
### 31. `activeCategory` Function Defined But Never Used (`TableOrder.tsx:50-54`)
### 32. Hardcoded Phone Number in 5 Locations (`03318025998`)
### 33. Shutdown Race Condition in `server.ts:1180-1185`
### 34. Indentation Inconsistencies in `server.ts:299-314`
### 35. `base_cheese`/`base_sauce` Defaults Hardcoded in Route Handlers
### 36. MenuSection Shows "Kitchen Updating!" Empty State for All Filters When Empty
### 37. No Confirmation Dialog for Order Status Changes in AdminOrders
### 38. OrderHistory Auto-Fetches Every Mount With No Cache
### 39. AdminProducts Loads on Every Tab Switch (No Cache)

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
