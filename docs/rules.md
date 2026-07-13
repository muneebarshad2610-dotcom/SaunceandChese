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

- **Modular**: `App.tsx` is a thin orchestrator (~100 lines); UI split into `layout/`, `sections/`, `modals/`, `ui/` subdirectories under `src/components/`
- **State management**: Local `useState` hooks, with shared logic extracted into custom hooks (`useCart`, `useMenuItems`) under `src/hooks/`
- **Side effects**: Contained within hooks — `useCart` handles localStorage persistence, `useMenuItems` handles API fetching
- **Modals**: Each modal owns its own internal state via `useState` + `useEffect` for initialization; controlled via `isOpen`/`null` pattern from parent
- **Event handling**: Handlers wrapped in `useCallback` when passed as props to child components to avoid unnecessary re-renders
- **Type definitions**: Shared interfaces in `src/types/index.ts` — imported by all components and hooks

### Styling Approach

- **Tailwind CSS v4** with CSS-first configuration (`@theme` directive in `index.css`)
- **Custom utility classes** defined in `index.css`: `retro-shadow`, `retro-shadow-sm`, `retro-shadow-gold`, `retro-shadow-red`, `blob-mask`
- **CSS animations** via `@keyframes`: `marquee` (30s linear infinite), `float` (5s ease-in-out)
- **Inline styles** used sparingly for dynamic values (e.g., `style={{ backgroundColor: ... }}` for sauce color, `style={{ y: -pullHeight }}` for cheese drag)
- **Hardcoded color values** throughout JSX: `bg-[#FDF5E6]`, `text-[#C41E3A]`, `border-[#FFB81C]`, etc.
- **Typography**: Three font families via CSS `@import` — `font-sans` (Poppins), `font-retro` (Bebas Neue), `font-handwritten` (Kalam)

### Animation Patterns

- **Motion (motion/react)**: Used for enter/exit animations on modals and menu grid
- **AnimatePresence**: Wraps conditionally-rendered modals and menu items
- **Spring physics**: Modal transitions use `type: 'spring'` with custom damping/stiffness
- **WhileHover/WhileInView**: Hover scale on logo, viewport-triggered animations on deal cards
- **CSS animations**: Marquee uses pure CSS `@keyframes` for performance

### Data Patterns

- **Empty state UI**: Every data-driven section has a polished empty/placeholder state (menu, deals, cart)
- **localStorage persistence**: Cart saved/loaded via `JSON.parse/stringify` under key `snc_cart`
- **API calls**: Fetch from Express backend (`/api/menu-items`, `/api/contact`, `/api/orders`) with Clerk Bearer token for protected endpoints
- **External image URLs**: All images from `images.unsplash.com` with `referrerPolicy="no-referrer"`

### Clerk Auth Patterns

- **`@clerk/react` v6** — use `Show` component (`when="signed-in"` / `when="signed-out"`) instead of v5's `SignedIn`/`SignedOut`
- **Imports**: `ClerkProvider`, `Show`, `SignInButton`, `SignUpButton`, `UserButton`, `useAuth` from `@clerk/react`
- **Server-side**: `clerkMiddleware()`, `requireAuth()` from `@clerk/express`
- **Protected API calls**: `useAuth().getToken()` → `Authorization: Bearer <token>`

---

## Known Issues / Technical Debt (Avoid Making Worse)

1. **~~Empty hardcoded menu data~~** **[FIXED]** — 13 real products seeded in PostgreSQL.

2. **~~Cheese-pull drag drift~~** **[FIXED]** — Now uses `useRef` + `info.point.y` instead of accumulative `info.offset.y`.

3. **~~Single monolithic component~~** **[FIXED]** — Refactored into 14 components across `layout/`, `sections/`, `modals/`, and `ui/` directories.

4. **~~Unused dependencies~~** **[FIXED]** — `@google/genai`, `railway`, `@clerk/clerk-react` removed.

5. **~~Unused icon imports~~** **[FIXED]** — Cleaned up in the refactoring pass.

6. **~~Fake checkout~~** **[FIXED]** — Orders are now submitted to `POST /api/orders` with Clerk authentication and stored in PostgreSQL.

7. **~~Contact form submits nowhere~~** **[FIXED]** — Submits to `POST /api/contact`, saves to PostgreSQL with error display to user.

8. **~~No error boundaries~~** **[FIXED]** — `ErrorBoundary` component wraps the app with retro-styled fallback UI.

9. **~~Design.Md vs actual code mismatch~~** **[FIXED]** — Design.Md now correctly lists Bebas Neue (`font-retro`) and Poppins (`font-sans`).

10. **~~Placeholder title tag~~** **[FIXED]** — Title is "Sauce n' Cheese — Karachi's Gooiest Feast" with full SEO/OG meta tags.

11. **~~No image optimization~~** **[FIXED]** — `loading="lazy"` added to all below-fold images.

12. **No payment processing**: Checkout generates a mock order. No real payment is processed.

13. **No order history page**: Orders are stored in DB with `clerk_user_id` but no UI exists to view them.

14. **No tests**: Zero unit, integration, or e2e tests exist.

15. **No PWA support**: No service worker or manifest for offline/progressive capabilities.

---

## Standard Boundaries

- **Never touch `.env` files** — environment variables managed in Railway dashboard or local `.env` (gitignored)
- **Never restructure folders** — current `src/` structure is established; component splitting should be done carefully
- **Never add new dependencies without asking** — justify any new dependency
- **Always match existing patterns** for styling (Tailwind with custom utilities), animations (Motion), and Clerk auth (Show, useAuth)
