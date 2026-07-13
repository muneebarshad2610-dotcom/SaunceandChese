# Project Memory

## [2026-07-13] — Reverse-engineered docs from existing codebase

- **What was completed**: Full read-only audit. Generated 7 documentation files from actual source code analysis.
- **Files touched**: All docs/ files
- **Known issues**: Frontend-only prototype, empty menu, no backend, no auth, no payments.

## [2026-07-13] — Refactored monolithic App.tsx into modular component architecture

- **What was completed**: Split ~1300-line App.tsx into 14 components, 2 hooks, shared types. Fixed index.html title, QuickViewModal state reset, removed dead code.
- **Files touched**: All components/, hooks/, types/, App.tsx (rewritten), index.html, env.d.ts, docs/

## [2026-07-13] — Built Express backend with PostgreSQL (Phase 3 + 4)

- **What was completed**: Created Express server with auto-migration, PostgreSQL database with 3 tables and 13 seeded menu items, GET /api/menu-items and POST /api/contact endpoints.
- **Files touched**: server.ts, src/db/, .env, .gitignore, package.json, docs/

## [2026-07-13] — COMPLETE REBUILD with Clerk Auth (current state)

- **What was completed**: 
  - Deleted all old source code (except docs/ and Design.md)
  - Fresh rebuild with full-stack architecture:
    - Express server with Clerk session verification (clerkMiddleware + requireAuth)
    - PostgreSQL database with `clerk_user_id` on contacts and orders tables
    - 4 API endpoints (health, menu-items, contact, orders)
    - React frontend with ClerkProvider, Show, SignInButton, SignUpButton, UserButton, useAuth
    - Auth gate on checkout — must sign in to place orders
    - All UI components (Hero, Story, Menu, Deals, Marquee, Locations, Footer)
    - All modals (QuickView with cheese-pull fix, CartDrawer with auth gate, OrderSuccess)
    - ErrorBoundary, SkeletonCard, loading skeletons, SEO/OG tags, lazy loading
  - Clerk CLI initialized with app_3GSN1PxJfx14wV2WxNTxBsq9kfh
  - Clerk doctor passes all checks
  - Migrated from @clerk/clerk-react v5 to @clerk/react v6
  - Removed unused dependencies (@google/genai, railway)
  - All docs updated to reflect current state
  - Committed and pushed to GitHub

- **Files touched**: All src/, server.ts, index.html, package.json, .env.example, .gitignore, docs/
- **Known issues / TODO**: Payments not integrated. Order history page not built. No tests yet.
