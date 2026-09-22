# 17: Add and browse Projects for a Client

**What to build:** Let a User view a Client's Projects and add a Project through the approved responsive form while Client and Project loading or failure states remain independent.

**Blocked by:** 16: Navigate Client details safely.

**Status:** resolved

- [x] Project domain and repository behavior enforce ownership by exactly one Client and use deterministic local fixtures.
- [x] Client details and Project data expose independent loading, empty, error, and populated states.
- [x] Add Project validates, persists, updates the correct cache, restores focus, and provides accessible feedback.
- [x] Direct navigation and refresh preserve the approved Client and Project state.

## Comments

### 2026-09-22 — Implemented

- Added the Project domain, deterministic fixtures, nested HTTP-shaped MSW handlers, local persistence, ownership checks, date validation, and project query keys.
- Added independent Projects loading, empty, error, and populated states to Client details, including responsive ProjectTable rendering and direct refresh persistence.
- Added Add Project with responsive Dialog behavior, validation, server-error recovery, dirty dismissal protection, focus restoration, cache updates, and polite success feedback.
- Added repository and Chromium end-to-end coverage for ownership, validation, retry, focus, persistence, independent states, and 320px reflow.
- Verified the complete `pnpm verify` gate: 29 Turbo tasks successful, including 30 Chromium E2E tests and all registry/token checks.
