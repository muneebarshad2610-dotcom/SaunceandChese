# Project Memory

## [2026-07-13] — Reverse-engineered docs from existing codebase

- **What was completed**: Full read-only audit. Generated 7 documentation files from actual source code analysis.
- **Files touched**: All docs/ files
- **Known issues**: Frontend-only prototype, empty menu, no backend, no auth, no payments.

## [2026-07-13] — Refactored monolithic App.tsx into modular component architecture

- **What was completed**: Split ~1300-line App.tsx into 14 components, 2 hooks, shared types. Fixed index.html title, QuickViewModal state reset, removed dead code.
- **Files touched**: All components/, hooks/, types/, App.tsx (rewritten), index.html, env.d.ts, docs/

## [2026-07-13] — Built Express backend with PostgreSQL (Phase 3 + 4)

- **What was completed**:
  - Created Express server (server.ts) with auto-migration and seed on startup
  - Connected to Railway PostgreSQL database via pg connection pool
  - Created database schema (3 tables: menu_items, contacts, orders)
  - Seeded 13 real menu items with proper categories, prices, sizes, descriptions, images
  - GET /api/menu-items transforms DB rows to frontend MenuItem shape
  - POST /api/contact saves submissions with server-side email validation
  - CORS configurable via CORS_ORIGINS env var
  - Updated package.json with server scripts (dev:server, dev:all with concurrently)
  - Created .env with DATABASE_URL and VITE_API_URL (gitignored)
- **Files touched**: server.ts (created), src/db/pool.ts (created), src/db/schema.sql (created), src/db/seed.sql (created), .env (created), .gitignore (updated), package.json (updated), docs/phases.md (updated), docs/architecture.md (updated)
- **Known issues / TODO**: Cart operations / order submission API still needed. Cheese-pull drag drift unfixed. Clerk auth not yet implemented. Gemini API unused.
