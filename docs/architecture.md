# Architecture Document — Sauce n' Cheese

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | React | 19.0.1 | With JSX, hooks (useState, useEffect), no class components |
| Bundler | Vite | 6.4.3 | Dev server on port 3000, HMR via `@vitejs/plugin-react` |
| Language | TypeScript | ~5.8.2 | `tsc --noEmit` used for linting |
| Styling | Tailwind CSS | 4.1.14 | Via `@tailwindcss/vite` plugin, CSS-first config |
| Animations | Motion | 12.23.24 | framer-motion successor, `motion/react` import |
| Icons | Lucide React | 0.546.0 | Tree-shakeable SVG icons |
| Fonts | Google Fonts | — | Poppins (sans), Bebas Neue (retro), Kalam (handwritten) — loaded via CSS `@import` |
| Deployment | Google AI Studio | — | Metadata indicates AI Studio app with Cloud Run hosting |

### Dependencies Present but Unused

| Package | Version | Status |
|---------|---------|--------|
| express | ^4.21.2 | Installed but no server code exists |
| @google/genai | ^2.4.0 | Installed but never imported or called |
| dotenv | ^17.2.3 | Installed but never imported |
| tsx | ^4.21.0 | Installed but no scripts use it |

---

## Auth

**None.** There is zero authentication in the codebase. No login/signup UI, no auth provider, no session management, no JWT, no OAuth. The app assumes a single anonymous user with no identity.

---

## Database

**None.** There is no database connection, no ORM (Prisma, Drizzle, etc.), no schema files, and no data persistence beyond the browser's `localStorage` (cart data under key `snc_cart`).

---

## Payments

**None.** The "Checkout Now" button in the cart drawer:
1. Generates a random `SNC-XXXXXX` order ID on the client
2. Clears `localStorage`
3. Shows a confirmation modal with fake receipt details
4. No money changes hands, no payment processor (Stripe, Razorpay, etc.) is called, no order is recorded anywhere

---

## Hosting

- The app is configured for **Google AI Studio** (see `metadata.json` and `.env.example` comments)
- `metadata.json` declares `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`, suggesting it's meant to run on AI Studio's Cloud Run infrastructure
- No Vercel, Netlify, Railway, or other hosting config files exist
- The `README.md` links to an AI Studio app: `https://ai.studio/apps/b4b3cb47-6daa-4790-80a3-d5cb756b0d7c`

---

## App Flow

This is a **single-page application (SPA) with no client-side routing library**. All sections are rendered on one page and navigated via anchor links (`href="#menu"`, `href="#story"`, etc.).

```
Page Load
  └─ React StrictMode Root
       └─ App (single component)
            ├─ Sticky Nav Bar (site-nav)
            ├─ Hero Section
            ├─ Our Story (#story)
            ├─ Menu Section (#menu) — empty items state shown
            ├─ Hot Deals (#hot-deals) — empty deals state shown
            ├─ Instagram Marquee
            ├─ Locations & Contact (#locations)
            └─ Footer
            ├─ [Modal] Quick View Customizer (conditional)
            ├─ [Drawer] Shopping Cart (conditional)
            └─ [Modal] Order Success (conditional)
```

### User journey
1. User lands on hero → scrolls or clicks nav links
2. Clicks "Customize" on a menu item → Quick View modal opens
3. Customizes cheese pull, sauce, size → adds to cart → cart drawer opens
4. Adjusts quantities in cart → clicks "Checkout Now" → success modal with fake tracker
5. Cart is cleared, order "completed"

Since `MENU_ITEMS` is empty, steps 2-4 are currently unreachable through normal interaction.

---

## Folder Structure

```
/
├── index.html                  # Entry HTML — title says "My Google AI Studio App"
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript config (ES2022, bundler resolution)
├── vite.config.ts              # Vite config — React + Tailwind plugins, path alias
├── metadata.json               # Google AI Studio metadata
├── .env.example                # Template for GEMINI_API_KEY and APP_URL
├── .gitignore                  # Ignores node_modules, dist, .env*
├── login-helper.cjs            # Unrelated: superdesign CLI login helper
├── Design.Md                   # Design specification doc (separate from this audit)
├── README.md                   # Generic AI Studio run instructions
├── assets/
│   └── .aistudio/
│       └── .gitignore          # Ignores everything (AI Studio asset placeholder)
├── src/
│   ├── main.tsx                # App entry — renders <App /> in StrictMode
│   ├── App.tsx                 # Orchestrator — wires sections, modals, hooks together
│   ├── index.css               # Tailwind CSS imports, custom theme, keyframes
│   ├── env.d.ts                # Vite env variable type declarations
│   ├── types/
│   │   └── index.ts            # Shared interfaces (MenuItem, CartItem, etc.)
│   ├── hooks/
│   │   ├── useCart.ts          # Cart state + localStorage persistence
│   │   └── useMenuItems.ts     # Fetch menu items from API
│   └── components/
│       ├── layout/
│       │   ├── Navbar.tsx      # Sticky nav with cart badge
│       │   └── Footer.tsx      # Brand footer with location/social
│       ├── sections/
│       │   ├── Hero.tsx        # Hero banner with CTAs
│       │   ├── StorySection.tsx # Brand narrative
│       │   ├── MenuSection.tsx  # Filter tabs + menu card grid
│       │   ├── DealsSection.tsx # Hot deals card grid
│       │   ├── InstagramMarquee.tsx # Infinite scrolling image strip
│       │   └── LocationsSection.tsx # Address + contact form
│       ├── modals/
│       │   ├── QuickViewModal.tsx   # Product customization with cheese-pull
│       │   ├── CartDrawer.tsx       # Slide-over cart panel
│       │   └── OrderSuccessModal.tsx # Receipt + kitchen tracker
│       └── ui/
│           ├── MenuCard.tsx    # Reusable menu item card
│           └── DealCard.tsx    # Reusable deal card
└── docs/                       # Project documentation
```

---

## Environment Variables

Found by grepping for `process.env` references:

| Variable | Used In | Required | Default |
|----------|---------|----------|---------|
| `GEMINI_API_KEY` | `.env.example` only — not referenced in any code | Unclear | `MY_GEMINI_API_KEY` |
| `APP_URL` | `.env.example` only — not referenced in any code | Unclear | `MY_APP_URL` |
| `DISABLE_HMR` | `vite.config.ts` — controls HMR / file watching | No | — |
| `FORCE_COLOR` | `login-helper.cjs` — unrelated to main app | No | `0` |

Note: `GEMINI_API_KEY` and `APP_URL` are only mentioned in `.env.example` and are never actually consumed by any source file.
