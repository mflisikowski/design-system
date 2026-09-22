# 29: Filter Clients by query and relationship status

**What to build:** Let a User combine text search and Client Relationship Status in a canonical reloadable URL, with accurate counts and empty-state explanations that identify the active criteria.

**Blocked by:** 23: Search Clients with canonical URL state; 28: Manage Client Relationship Status.

**Status:** resolved

- [x] The application-owned Filter Bar composes canonical `q` and `status` parameters without moving routing or fetching ownership into public components.
- [x] Changing, clearing, navigating, and reloading filters produces stable queries and protects against stale responses.
- [x] Counts and No results feedback describe the active criteria and remain accessible across all eight contexts.
- [x] Client Relationship Status filtering remains independent from Project Status.

## Comments

### 2026-09-22 — Implemented

- Added the application-owned Client Filter Bar with canonical `q` and `status` URL state, immediate status changes, atomic clearing, invalid-status canonicalization, and responsive 320px layout.
- Extended the Client repository and MSW API with independent relationship-status filtering and AND semantics, while adding the status dimension to React Query keys for stale-response safety.
- Added criterion-aware result counts and No results recovery copy, plus focused Node and Chromium coverage for direct URLs, reloads, status/search combinations, stale responses, accessibility across eight theme contexts, and narrow reflow.
- `corepack pnpm verify` passed: 29 Turbo tasks, 41 Reference CRM Node tests, 20 browser tests, 97 Chromium E2E tests passed with 5 visual tests skipped, build, lint, token, registry, and changeset gates passed.
