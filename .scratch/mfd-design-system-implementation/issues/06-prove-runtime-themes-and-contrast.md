# 06: Prove runtime themes and contrast

**What to build:** Demonstrate the generated theme contract in a rendered fixture that applies the three independent root axes, resolves system color scheme correctly, and measures approved semantic pairs on their actual backgrounds.

**Blocked by:** 05: Generate and validate token artifacts.

**Status:** resolved

- [x] A rendered fixture covers all eight resolved contexts with correct root attributes and self-hosted fonts.
- [x] Fixed and system color schemes work without client JavaScript being required for initial resolution.
- [x] Foreground, boundary, focus, selection, and on-solid pairs pass recorded contrast checks or carry narrowly scoped approved exceptions.
- [x] Browser-provided controls receive the correct early `color-scheme` value.

## Comments

### 2026-09-21 — runtime theme and contrast proof completed

- Added generated fixed and media-query-driven system selectors while preserving independent brand, color-scheme preference, and density attributes.
- Added a deterministic contrast report for every resolved context; the token build now fails when an approved foreground, boundary, focus, selection, or on-solid pair misses its threshold.
- Added a rendered Reference CRM fixture covering all eight contexts with self-hosted Latin Extended variable fonts and representative native controls.
- Verified in Chromium that each panel receives its expected fonts, dimensions, colors, and native `color-scheme`, and that the root follows light/dark system preference without rewriting `data-color-scheme="system"`.
- Kept cookie persistence and Theme Provider behavior in ticket 20/P7; this fixture applies the approved default preference tuple and proves the generated pre-hydration CSS contract.
