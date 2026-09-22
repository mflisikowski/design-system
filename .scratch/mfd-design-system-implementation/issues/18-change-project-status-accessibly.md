# 18: Change Project Status accessibly

**What to build:** Let a User see and change any Project Status from its current value to any other approved value, with accessible status communication and no coupling to Client Relationship Status.

**Blocked by:** 17: Add and browse Projects for a Client.

**Status:** resolved

- [ ] Planned, active, on-hold, and completed states render through the approved Badge mapping in all eight contexts.
- [ ] The status Select supports the specified keyboard, focus, pending, success, and failure behavior.
- [ ] Warning tokens are exercised by the on-hold state and pass actual rendered contrast checks.
- [ ] Select and Badge complete their registry, documentation, Figma, tests, accessibility, and clean-install definition of done.

## Comments

### 2026-09-22 — Implemented

- Added canonical Badge and Select registry components with semantic status tones, contextual Select naming, keyboard behavior, pending state, and reduced-motion support.
- Replaced the Project status display with a controlled Select and mapped Badge for all approved statuses, including non-optimistic success, toast, persistent failure Alert, and retry behavior.
- Added the PATCH repository and MSW boundary, status transition coverage, browser and E2E accessibility coverage, documentation, Figma notes, changeset metadata, and clean-install registry artifacts.
- Verified with `pnpm verify`.
