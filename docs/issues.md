# Issues & Bug Tracker

## 🔴 Critical

### 1. Payment "Success" Shown Before Order Is Created
- **Files**: `src/components/modals/PaymentModal.tsx:70-76`, `src/App.tsx:180-235`
- **Problem**: PaymentModal shows a success animation and fires `onSuccess()` *before* the POST to `/api/orders`. If the API call fails (network, validation, server error), the user sees "Payment Successful!" followed by an `alert()` saying "Failed to place order." The success UI is irreversible.
- **Fix**: Create the order on the server first, then show payment success only after both the payment and order creation succeed.

### 2. Order Creation Uses Client-Generated ID, Ignores Server Response
- **File**: `src/App.tsx:194-233`
- **Problem**: The `POST /api/orders` response (which contains the real DB `id`) is never read. `lastOrderDetails` uses a local `SNC-`+random string. The confirmation screen shows a made-up ID unrelated to the actual DB record.
- **Fix**: Read `res.json()` and use the server's returned ID.

### 3. Stale Closure in `handlePaymentSuccess`
- **File**: `src/App.tsx:200-208`
- **Problem**: The callback captures `cart`, `cartSubtotal`, and `cartItemCount` at render time. If the cart changes between starting checkout and payment completing, stale data is submitted.
- **Fix**: Use a ref to snapshot cart state when checkout begins, or read from the pending order ref.

### 4. No `strict: true` in tsconfig
- **File**: `tsconfig.json`
- **Problem**: Missing `strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`. Allows `any` types and null/undefined bugs to pass compilation.
- **Fix**: Enable strict mode and fix resulting type errors.

---

## 🟠 High

### 5. Widespread `any` Types (20+ occurrences)
- **Files**: `server.ts:44,54,122,222,236,626`, `AdminOrders.tsx:12,172,174,499,517`, `OrderHistory.tsx:302,322`, etc.
- **Fix**: Replace `any` with proper types (`Request`, `Response`, `CartItem[]`, etc.).

### 6. `alert()` Used for Error Feedback (12 occurrences)
- **Files**: `App.tsx:219`, `AdminAddons.tsx:90,132`, `AdminOrders.tsx:113,132,140`, `AdminProducts.tsx:142,189`, `AdminTables.tsx:67,103`, `AdminUsers.tsx:79`, `TableOrder.tsx:170`
- **Fix**: Replace with a toast/notification component.

### 7. No `aria-label` on Icon-Only Buttons
- **Files**: Navbar (cart toggle, mobile nav), CartDrawer (close, remove), QuickViewModal (close), CheckoutForm (close), etc.
- **Fix**: Add `aria-label` attributes to all icon-only `<button>` elements.

### 8. Duplicate `API_BASE` Declarations (14 files)
- **Files**: `App.tsx:30`, `useMenuItems.ts:4`, `types/index.ts:136`, all admin pages, etc.
- **Fix**: Export from a single constants file.

### 9. `express.json()` Body Limit Too Small (10KB)
- **File**: `server.ts:38`
- **Problem**: Complex orders with many items + addons + variants may exceed 10KB and fail silently with 413.
- **Fix**: Increase to `1mb` or remove limit.

### 10. Hardcoded CSS Colors Not Using Theme Tokens
- **Files**: All `.tsx` files — `bg-[#C41E3A]`, `text-[#FFB81C]`, etc. used hundreds of times.
- **Fix**: Define color tokens in tailwind config and reference by name.

### 11. JSON Parse Fallback Silently Swallows Errors
- **Files**: `App.tsx:212,250`, `AdminProducts.tsx:181`, `AdminTables.tsx:97`, `AdminAddons.tsx:124`, `TableOrder.tsx:158`
- **Pattern**: `await res.json().catch(() => ({}))` — returns `{}` on invalid JSON, then `.error` is `undefined`, masking real server errors.
- **Fix**: Check `Content-Type` or let JSON parse throw and handle in catch.

### 12. ErrorBoundary Uses `(this as any)` to Access State and Props
- **File**: `src/components/ErrorBoundary.tsx:17,29-30`
- **Fix**: Use proper class property declarations.

### 13. KitchenView Web Audio Context Created Without User Gesture
- **File**: `src/pages/KitchenView.tsx:51-61`
- **Problem**: `new AudioContext()` in `useEffect` — modern browsers block it without user interaction.
- **Fix**: Create on first user click/tap, or use a resume-on-interaction pattern.

### 14. No Pagination on Orders / Users API
- **File**: `server.ts:331-353,356-382,619-643`
- **Problem**: Returns all orders/users with no limit. Will become slow as DB grows.
- **Fix**: Add `LIMIT`/`OFFSET` with page query params.

### 15. Footer Links Cause Full Page Reload
- **File**: `src/components/layout/Footer.tsx:62-67`
- **Problem**: `<a href="/terms">` triggers browser navigation, losing React state (cart, auth).
- **Fix**: Use `<button onClick={() => navigate('terms')}>`.

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
