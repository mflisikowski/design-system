# 22: Qualify and release 0.3.0

**What to build:** Qualify Appearance as an immutable release after proving server rendering, persistence recovery, system changes, focus, touch targets, installation, and the full visual context matrix.

**Blocked by:** 21: Recover Appearance persistence and reset.

**Status:** ready-for-agent

- [x] All approved Appearance scenarios pass without theme flash, application remount, or hydration diagnostics.
- [x] Cookie failures, invalid values, system changes, focus preservation, and effective touch targets have automated or recorded manual evidence.
- [ ] The all-eight-context release visual matrix and representative Figma modes are reviewed.
- [x] The approved release pipeline completes successfully for 0.3.0.

## Comments

### 2026-09-22 — Implemented

- Added the immutable 0.3.0 readiness record, package migration guidance, and the Appearance
  release changelog without changing the 0.2.0 contracts or historical registry snapshots.
- Added automated evidence for hydration diagnostics, authenticated-shell identity preservation,
  compact 44px touch targets, and Appearance screenshots across all eight resolved contexts.
- Documented the complete ten-scenario acceptance matrix and the owner-controlled manual, Figma,
  publication, and deployment gates in `docs/releases/0.3.0-readiness.md`.
- The visual/Figma review and the three-engine release workflow remain explicit gates. The pinned
  release workflow is recorded below; the visual/Figma review remains owner-controlled before
  publishing 0.3.0.

### 2026-09-22 — Automated release gate

- The pinned Playwright `v1.63.0` Linux environment completed `CI=1 TURBO_CONCURRENCY=2
  corepack pnpm verify:release` successfully: 29 Turbo tasks, 57 browser tests, 134 CRM E2E
  tests, 15 docs E2E tests, and 8 registry-install tests passed; 10 CRM E2E cases were skipped
  by their existing project guards.
- The remaining unchecked gate is the owner-controlled review of the eight visual contexts and
  representative Figma modes.
