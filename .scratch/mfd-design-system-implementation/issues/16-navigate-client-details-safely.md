# 16: Navigate Client details safely

**What to build:** Let a User navigate directly from the Client list to a Client details page, retain clear hierarchy and return paths, and receive a safe outcome when the requested Client does not exist.

**Blocked by:** 15: Qualify and release 0.1.0.

**Status:** resolved

- [x] Direct and in-app navigation resolve the same Client details state and unknown identifiers are handled explicitly.
- [x] Breadcrumb, Link, and Page Header expose the approved semantics, focus behavior, and responsive presentation.
- [x] New public contracts include registry, docs, Figma, behavior, accessibility, and clean-install coverage without silently changing 0.1.0 APIs.

## Comments

### 2026-09-21 — Implemented

- Added Client details navigation from the table, direct dynamic routing, demo-session return-to support, and explicit accessible Not Found handling.
- Added Breadcrumb and Page Header public registry contracts with docs, Figma notes, generated v/0.2.0 artifacts, and clean-install coverage.
- Verified with `pnpm verify` (29/29 Turbo tasks successful).
