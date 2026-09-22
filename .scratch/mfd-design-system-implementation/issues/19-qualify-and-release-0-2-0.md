# 19: Qualify and release 0.2.0

**What to build:** Qualify Client details and Projects as an immutable release with verified navigation, caches, statuses, accessibility, installation, and migration guidance.

**Blocked by:** 18: Change Project Status accessibly.

**Status:** ready-for-agent

- [ ] All ten approved second-tracer scenarios pass across the required browser and theme matrices.
- [ ] Select and Badge install cleanly and every Project Status remains accessible in all eight contexts.
- [x] Migration and changelog content explain the new contracts without silently altering 0.1.0 behavior.
- [ ] The approved release pipeline completes successfully for 0.2.0.

## Comments

### 2026-09-22 — Implemented

- Added the immutable 0.2.0 readiness record, package changelogs, documentation migration guidance,
  and the next-release marker without changing the 0.1.0 contracts or snapshot.
- Extended registry contract verification to cover Breadcrumb, Page Header, Badge, and Select
  installation metadata and immutable artifacts.
- Recorded the complete ten-scenario acceptance matrix and owner-controlled manual and publication
  gates in `docs/releases/0.2.0-readiness.md`.
- Local automated evidence was completed with `corepack pnpm verify` (29 Turbo tasks successful),
  including Chromium behavior, all eight Project Status theme contexts, and registry clean-install.
- `verify:release` was attempted but is host-blocked before Firefox tests by Firefox Nightly's
  `Could not find profile folder`; CI must provide the required Firefox/WebKit matrix before release.
- External publication, Figma publication, deployment promotion, and owner permission checks remain
  owner-controlled.
