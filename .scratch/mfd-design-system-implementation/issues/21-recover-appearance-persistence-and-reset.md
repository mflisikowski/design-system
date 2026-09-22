# 21: Recover Appearance persistence and reset

**What to build:** Keep Appearance usable during persistence, roll back only failed changes, retry the intended value, react to operating-system scheme changes, and reset all axes as one safe operation.

**Blocked by:** 20: Configure Appearance across three axes.

**Status:** resolved

- [x] An individual save makes only its Radio Group read-only and busy while other axes remain available and focus is retained.
- [x] Failure rolls back only the failed axis and exposes a persistent retry target; successful individual saves do not emit Toasts.
- [x] Reset is atomic, cannot race individual saves, and restores the last confirmed tuple on failure.
- [x] System preference changes, browser `color-scheme`, reduced motion, and transition suppression behave without hydration diagnostics.

## Comments

### 2026-09-22 — Implemented

- Added atomic `persistThemePreferences` server persistence for the Atlas/System/Comfortable reset tuple.
- Extended Theme Provider state with confirmed preferences, reset pending/error/retry state, race protection,
  axis-local rollback, retry targets, and synchronous transition suppression.
- Added the reset action with complete-form busy/read-only behavior, focus preservation, and polite completion
  announcement; individual axis saves remain independent and do not emit Toasts.
- Added reduced-motion CSS behavior and E2E coverage for reset, OS color-scheme changes, server-rendered
  defaults, focus, and browser color-scheme integration.
- Verification: targeted Chromium browser tests passed (9 tests), full Reference CRM browser tests passed
  (18 tests), and task-specific E2E scenarios passed. `pnpm verify` completed every task except the existing
  authenticated-shell skip-link test, where the Next.js development portal receives the first Tab focus.
