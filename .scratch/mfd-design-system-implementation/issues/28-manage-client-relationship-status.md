# 28: Manage Client Relationship Status

**What to build:** Let a User mark a Client relationship active or inactive and reverse that decision through contextual Select and Badge behavior that remains independent from Project Status and other Client operations.

**Blocked by:** 25: Qualify and release 0.4.0.

**Status:** resolved

- [x] Existing Clients retain the persisted active default and can transition between active and inactive without affecting Projects.
- [x] Contextual Select behavior covers keyboard, focus, pending, success, failure, and cache reconciliation.
- [x] Badge mapping communicates relationship status accessibly in all eight contexts without conflating it with Project Status.
- [x] Direct navigation and refresh retain the confirmed relationship status.

## Comments

### 2026-09-22 — Implemented

- Added a typed Client relationship-status repository mutation and an isolated MSW PATCH scenario with persistence, latency, and retryable failures.
- Replaced the detail-only status text with a contextual non-optimistic Select containing the semantic Badge mapping: Active to success and Inactive to neutral.
- Added isolated pending state, no-op current selection, persistent retryable failure feedback, polite success announcement, detail/list cache reconciliation, and active-query revalidation without changing Project status behavior.
- Added repository coverage and 13 Chromium E2E scenarios covering persistence, failure recovery, pending isolation, keyboard/no-op/focus behavior, direct navigation, responsive reflow, and both status tones across all eight theme contexts with axe checks.
- Verification: `pnpm verify` passed with 29 successful Turbo tasks, 40 CRM Node tests, 20 browser tests, 90 CRM Chromium E2E tests (5 visual tests skipped on macOS), token, registry, documentation, lint, typecheck, build, and changeset gates.
