# 25: Qualify and release 0.4.0

**What to build:** Qualify Client search and editing as an immutable release with canonical URLs, stale-request safety, preserved user work, clean distribution, and no regression to Client creation.

**Blocked by:** 23: Search Clients with canonical URL state; 24: Edit a Client without losing work.

**Status:** ready-for-agent

- [ ] All approved search and edit scenarios pass across the required browser and theme matrices.
- [x] Search URLs reload canonically and Search Field installs cleanly without application-owned routing or fetching behavior.
- [x] The complete Add Client flow remains regression-free.
- [ ] The approved release pipeline completes successfully for 0.4.0.

## Comments

### 2026-09-22 — Implemented

- Added the immutable 0.4.0 readiness record, package migration guidance, and the Search and edit
  release changelog without changing the 0.3.0 package or registry snapshot.
- Added a three-browser, eight-context release matrix that verifies canonical search reloads, edit
  initialization and unchanged-submit protection, focus restoration, and axe-clean Client surfaces.
- Recorded the complete search and edit acceptance evidence plus the owner-controlled manual, Figma,
  publication, and deployment gates in `docs/releases/0.4.0-readiness.md`.
- Local automated evidence: the full Chromium CRM suite passed 52 tests with the five pinned-Linux
  visual tests skipped on macOS, the documentation E2E suite passed 5 tests, and registry/token/
  docs/quality checks passed. The focused release matrix passed in Chromium and WebKit; Firefox
  Nightly remains host-blocked by `Could not find profile folder`, so the three-engine release
  gate remains open for pinned CI.
