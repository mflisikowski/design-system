# 07: Establish browser and flow test harnesses

**What to build:** Provide deterministic unit, browser-component, end-to-end, accessibility, visual-regression, and manual verification harnesses that later tracer slices can use without inventing infrastructure per component.

**Blocked by:** 03: Establish local and CI quality gates.

**Status:** resolved

- [x] Node tests, browser component tests, end-to-end tests, MSW fixtures, and axe checks run through the shared quality workflow.
- [x] Pull requests use Chromium while release verification supports Chromium, Firefox, and WebKit.
- [x] Linux Chromium screenshot baselines are deterministic and cannot be silently updated or globally masked.
- [x] Manual verification templates cover screen readers, zoom, touch, contrast, RTL, long content, and reduced motion.

## Comments

### 2026-09-21 — browser and flow harnesses completed

Added explicit Node Vitest, Vitest Browser Mode, and Playwright Test seams to the shared Turborepo quality workflow. The Reference CRM fixture proves reusable MSW handlers in Node and in a real Chromium component test; the running-application suite proves routing, a stable-state WCAG A/AA axe scan, and exact screenshot comparison.

Pull-request verification installs and runs Chromium only. A separate read-only manual release workflow installs Chromium, Firefox, and WebKit and runs both browser-component and end-to-end suites across all three engines, while screenshots remain Chromium-only.

The committed screenshot baselines were generated with `mcr.microsoft.com/playwright:v1.63.0-noble` pinned by digest. Pull-request coverage includes the key screen and representative Atlas Light Comfortable and Bloom Dark Compact theme-fixture states. Playwright fixes deterministic rendering inputs, applies no global pixel tolerance, and sets `updateSnapshots: none`; visual assertions run only in the pinned Linux CI environment and the documented explicit Linux container command is the only update path.

Added a reusable manual verification record for screen reader behavior, zoom and reflow, touch, rendered contrast and non-color cues, RTL, long/localized content, reduced motion, and cognitive completion review.

Verified the complete `pnpm verify` workflow with 19 successful Turbo tasks, including Node tests, Chromium Browser Mode, application build, three Chromium Playwright tests, axe, screenshot comparison, token validation, and all existing repository gates.
