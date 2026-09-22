# 27: Prevent unsafe Client deletion

**What to build:** Prevent deletion of a Client that still owns any Project, explain the blocking relationship, and allow final Client deletion only after dependencies are removed, without cascading data loss.

**Blocked by:** 26: Delete a Project safely.

**Status:** resolved

- [x] A Client with any Project cannot be deleted and receives actionable, accessible blocked-deletion feedback.
- [x] No deletion path cascades from Client to Project, including stale-data and retry paths.
- [x] Deleting an eligible Client is atomic, reconciles caches, and navigates to the approved safe destination.
- [x] Failure and rollback outcomes preserve domain integrity and focus.

## Comments

### 2026-09-22 — Implemented

- Added typed Client deletion outcomes for successful, blocked-by-Project, stale, and infrastructure-failure paths.
- Added an atomic local MSW dependency guard that preserves Projects on every Client deletion path.
- Added the accessible Client deletion guard, destructive confirmation, pending protection, retryable failure, stale recovery, cache reconciliation, list navigation, heading focus, and polite announcements.
- Added repository and Playwright coverage for dependency blocking, server-detected conflicts, retry, stale records, pending dismissal, persistence, focus, and all eight theme contexts.
- Verification: `pnpm verify` passed with 29/29 tasks successful, including 77 passing CRM E2E tests, 38 repository tests, and 20 browser tests.
