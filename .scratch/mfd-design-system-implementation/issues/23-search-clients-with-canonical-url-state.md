# 23: Search Clients with canonical URL state

**What to build:** Let a User search Clients by organization, contact, or email through a canonical reloadable URL while results remain stable during debounce, requests, empty outcomes, and failures.

**Blocked by:** 22: Qualify and release 0.3.0.

**Status:** resolved

- [x] Search normalization, debounce, URL updates, stale-response protection, retained results, and counts match the approved behavior.
- [x] Loading, error, cleared query, and No results states are distinguishable and accessible.
- [x] Search Field owns only reusable input behavior; routing, fetching, and query orchestration remain application-owned.
- [x] Search Field completes registry, docs, Figma, behavioral, accessibility, and clean-install requirements.

## Comments

### 2026-09-22 — Implemented

- Added the reusable native Search Field contract with controlled and uncontrolled values,
  submit, clear, Escape, loading, sizing, accessibility, registry, documentation, Figma handoff,
  and consumer installation coverage.
- Added app-owned canonical Client search orchestration: normalized organization/contact/email
  matching, 300ms debounce, immediate Enter and clear navigation, reloadable `q` URL state,
  stale-response protection, retained rows, counts, no-results recovery, and retryable failures.
- `CI=1 TURBO_CONCURRENCY=2 corepack pnpm verify` passed: 29 Turbo tasks, 47 CRM E2E tests
  passed with 5 existing scenario guards skipped, 20 browser tests, 29 Node tests, docs,
  token, and registry clean-install gates passed.
- External Figma publication/manual review and the 0.4.0 release remain owner-controlled gates
  for ticket 25.
