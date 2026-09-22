# 26: Delete a Project safely

**What to build:** Let a User delete a Project from its Client context through an explicit destructive confirmation while repository outcomes, stale data, failures, and post-deletion focus remain safe and understandable.

**Blocked by:** 25: Qualify and release 0.4.0.

**Status:** resolved

- [x] Project deletion returns typed atomic outcomes and never affects its owning Client or sibling Projects.
- [x] Alert Dialog communicates the exact destructive context and handles pending, cancellation, success, failure, and stale records.
- [x] Focus moves to the approved surviving target after deletion and remains safe when surrounding data changes.
- [x] Destructive use adds regression coverage to the existing public Alert Dialog contract.

## Comments

### 2026-09-22 — Implemented

- Added typed project deletion outcomes and a non-optimistic repository mutation with exact cache updates and active-query revalidation.
- Added contextual destructive confirmation, pending/cancellation guards, infrastructure retry handling, stale-record recovery, success feedback, and deterministic focus fallback.
- Added repository, E2E, theme-matrix, and public Alert Dialog regression coverage.
- Verification: `pnpm verify` passed with 29/29 tasks successful, including 64 passing E2E tests, 34 repository tests, and 20 browser tests.
- Client deletion remains scoped to task 27.
