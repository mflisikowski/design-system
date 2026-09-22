# 30: Qualify and release 0.5.0

**What to build:** Qualify deletion, Client Relationship Status, and combined filtering as the final version 1 milestone after proving domain integrity, accessibility, context coverage, clean distribution, and recovery behavior.

**Blocked by:** 27: Prevent unsafe Client deletion; 29: Filter Clients by query and relationship status.

**Status:** ready-for-agent

- [ ] All approved deletion and filtering scenarios pass across the required browser and theme matrices.
- [x] Deletion never cascades, stale data resolves safely, and all error or rollback paths preserve domain integrity.
- [x] Filtering and both status concepts remain independent and accessible throughout the full context matrix.
- [ ] Clean installs, manual verification, Figma review, changelog, migration notes, and the approved 0.5.0 release pipeline complete successfully.

## Comments

### 2026-09-22 — Implementation in progress

- Added `deletion-filtering-release.spec.ts`, covering the no-cascade Client deletion guard and
  combined relationship filtering across all eight resolved theme contexts with axe checks and
  canonical reload assertions. The release Playwright configuration runs the suite in Chromium,
  Firefox, and WebKit.
- Prepared coordinated `0.5.0` package metadata, changelogs, registry metadata, and the durable
  `registry/snapshots/v/0.5.0/` archive through `corepack pnpm version-packages`.
- Added the 0.5.0 readiness record and documentation migration notes. Manual verification, Figma
  review, external publication, and deployment promotion remain owner-controlled gates.

### 2026-09-22 — Browser matrix evidence

- The focused release matrix passed in Chromium and WebKit: 4 tests passed across both engines,
  covering all eight resolved theme contexts with axe checks and canonical reload assertions.
- Firefox Nightly could not start its temporary profile on this macOS host (`Could not find profile
  folder`). The pinned Linux `verify:release` workflow remains required evidence for the Firefox leg
  and the complete three-engine release gate.

### 2026-09-22 — Verification evidence

- Release-mode `CHANGESET_RELEASE_PR=true CI=1 TURBO_CONCURRENCY=2 corepack pnpm verify` passed all
  29 Turbo tasks, including 99 CRM Chromium E2E tests with 5 existing visual skips, 20 browser
  component tests, 41 CRM Node tests, 14 docs tests, and 8 registry clean-install tests.
- `verify:release` was attempted and stopped at the host Firefox Nightly profile failure before the
  remaining three-engine tasks could complete. The pinned Linux release workflow remains required.
