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
- **No API calls**: Zero fetch/axios/XMLHttpRequest calls anywhere in the code
- **External image URLs**: All images from `images.unsplash.com` with `referrerPolicy="no-referrer"`

---

## Known Issues / Technical Debt (Avoid Making Worse)

1. **Empty hardcoded menu data**: `const MENU_ITEMS: MenuItem[] = []` — the entire product catalog is missing. All menu and deals UI renders "Kitchen Updating!" / "New Deals Preparing!" placeholders. This is the single biggest gap between what the UI supports and what actually works.

2. **Cheese-pull drag drift**: The `onPan` handler for the cheese-pull interaction accumulates `pullHeight` relative to the last drag position rather than using absolute pointer position. Each drag session starts from where the previous one ended, causing position drift. Should use `info.point.y` instead of `info.offset.y` for the baseline, or reset the delta each frame.

3. ~~**Single monolithic component**: `App.tsx` is ~1300 lines. Every section (hero, story, menu, deals, marquee, locations, footer, cart, modals, success modal) is in one component.~~ **[FIXED]** — Refactored into 14 components across `layout/`, `sections/`, `modals/`, and `ui/` directories plus 2 custom hooks. App.tsx is now ~100 lines.

4. **Unused dependencies**: `express`, `@google/genai`, `dotenv`, `tsx` are in `package.json` dependencies but are unused. They bloat the install and create confusion about the project's architecture.

5. **Unused icon imports**: `Heart`, `ChevronRight`, `TrendingUp`, `Send` are imported from `lucide-react` but never rendered.

6. **Fake checkout**: The "Checkout Now" button generates a random order ID and clears localStorage. There is no actual order processing, payment, or fulfillment. The "Live Kitchen Tracker" is purely decorative animation. If this is intended as a real ordering app, this needs backend integration.

7. **Contact form submits nowhere**: The form validates required fields client-side and shows a success toast, but data is discarded. No API endpoint is called.

8. **No error boundaries**: If any component throws during render, the entire app will unmount (blank page).

9. **Design.Md vs actual code mismatch**: `Design.Md` describes Space Grotesk (`font-retro`) and Inter (`font-sans`) as the typefaces, but the actual CSS imports Poppins (`font-sans`) and Bebas Neue (`font-retro`).

10. ~~**Placeholder title tag**: `index.html` title is "My Google AI Studio App" — not the actual brand name ("Sauce n' Cheese").~~ **[FIXED]** — Title updated to "Sauce n' Cheese — Karachi's Gooiest Feast" with meta description.

11. **No image optimization**: Hero and menu images load at full resolution from Unsplash with no lazy loading or responsive sizes.

---

## Standard Boundaries

- **Never touch `.env` files** — environment variables for this project are managed by Google AI Studio's secrets panel
- **Never restructure folders** — the current flat `src/` structure with a single component is the established pattern; component splitting should be done carefully with buy-in
- **Never add new dependencies without asking** — some existing deps are already unused; any new dependency should be justified
- **Always match existing patterns** for styling (Tailwind with custom utilities), animations (Motion), and state (useState + localStorage)
