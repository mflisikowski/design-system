# 24: Edit a Client without losing work

**What to build:** Let a User edit an existing Client through the shared form contract without refetches overwriting dirty values and with safe non-optimistic persistence, feedback, cache synchronization, and focus restoration.

**Blocked by:** 22: Qualify and release 0.3.0.

**Status:** resolved

- [x] ClientForm supports create and edit modes without duplicating validation or changing Add Client behavior.
- [x] Background refetches preserve dirty values and reconcile confirmed data safely.
- [x] Successful and failed updates produce the approved cache, focus, Alert, and Toast outcomes.
- [x] Existing Add Client scenarios remain green after the shared-form change.

## Comments

### 2026-09-22 — Implemented

- Added the shared ClientForm create/edit contract with the same Zod validation, dirty-state
  handling, confirmed-value reconciliation, unchanged-submit protection for edit mode, and
  accessible failure focus behavior.
- Added the PATCH repository boundary and local MSW persistence with typed field errors,
  retryable failures, updated timestamps, and non-optimistic update semantics.
- Added Edit Client with dirty-dismissal confirmation, pending dismissal protection, detail/list
  cache synchronization, active-query revalidation, success Toast and announcement, and trigger
  focus restoration.
- Added E2E coverage for unchanged edits, dirty dismissal, success persistence, update retry,
  pending behavior, and Add Client regression coverage.
- `CI=1 TURBO_CONCURRENCY=2 corepack pnpm verify` passed: 29 Turbo tasks, 50 CRM E2E tests
  passed with 5 existing scenario guards skipped; 31 Node tests and 20 browser tests passed.
