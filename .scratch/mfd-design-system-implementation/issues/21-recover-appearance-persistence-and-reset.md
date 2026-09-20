# 21: Recover Appearance persistence and reset

**What to build:** Keep Appearance usable during persistence, roll back only failed changes, retry the intended value, react to operating-system scheme changes, and reset all axes as one safe operation.

**Blocked by:** 20: Configure Appearance across three axes.

**Status:** ready-for-agent

- [ ] An individual save makes only its Radio Group read-only and busy while other axes remain available and focus is retained.
- [ ] Failure rolls back only the failed axis and exposes a persistent retry target; successful individual saves do not emit Toasts.
- [ ] Reset is atomic, cannot race individual saves, and restores the last confirmed tuple on failure.
- [ ] System preference changes, browser `color-scheme`, reduced motion, and transition suppression behave without hydration diagnostics.
