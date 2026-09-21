# 14: Protect and recover Add Client interactions

**What to build:** Protect a User's Add Client work from accidental dismissal and provide accessible, retryable recovery from validation and server failures without losing entered values.

**Blocked by:** 13: Add a Client successfully.

**Status:** resolved

- [x] Dirty dismissal uses the approved Alert Dialog behavior and preserves the form when cancellation is chosen.
- [x] Pending submission prevents unsafe dismissal and duplicate actions while retaining understandable focus and announcements.
- [x] Field errors map to the correct controls and server failures remain visible in a persistent retryable Alert.
- [x] All eleven approved Add Client acceptance scenarios pass across the required theme and browser matrix.

## Comments

### 2026-09-21 — Add Client protection and recovery completed

- Added the public compositional Alert Dialog contract with safe initial and restored focus, Escape-as-cancel, no backdrop dismissal, and pending protection.
- Protected dirty Add Client values across Cancel, Close, Escape, and backdrop requests; submission now keeps focus understandable while all unsafe actions are blocked.
- Added case-insensitive duplicate-email validation mapped to Contact email plus persistent retryable server-failure feedback that preserves current values.
- Added public behavior, HTTP-boundary, end-to-end, narrow-screen accessibility, and all-eight-theme keyboard recovery coverage; the release browser command exercises the same scenarios in Chromium, Firefox, and WebKit.
- Added registry metadata, clean-install coverage, public documentation, changeset metadata, and the repository-authored Figma anatomy handoff. Applying and publishing Figma changes remains owner-controlled.

### 2026-09-21 — Review follow-up completed

- Added explicit pristine-dismissal coverage for Cancel, Close, Escape, and backdrop requests alongside the dirty-form protection cases.
- Added long-value reflow, 44 px target, reduced-motion, 200% zoom, and real touch-input checks for the Add Client flow.
- Added pinned Linux Chromium visual-regression baselines for the Add Client and Alert Dialog recovery state in all eight resolved brand, color-scheme, and density contexts.
