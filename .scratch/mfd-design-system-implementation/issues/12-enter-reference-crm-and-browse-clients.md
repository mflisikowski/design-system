# 12: Enter Reference CRM and browse Clients

**What to build:** Let a User enter the fixed demo session, navigate the accessible application shell, and browse deterministic Client data through loading, error, empty, and populated list states.

**Blocked by:** 08: Prove registry-to-consumer installation; 09: Enforce design-system lint policy; 10: Publish the documentation shell; 11: Synchronize repository tokens into Figma.

**Status:** resolved

- [x] Protected routing, return-to behavior, sign out, the visible App Shell, and skip navigation work as specified.
- [x] Client data uses the approved domain types, validation, repository boundary, local persistence, reset, latency, errors, and deterministic seed.
- [x] Client list states and the application-owned ClientTable behave accessibly in all approved contexts.
- [x] Public elements introduced by this slice include registry metadata, documentation, Figma anatomy, behavior tests, and clean-install coverage.

## Comments

### 2026-09-21 — Reference CRM entry and client browsing completed

- Added the fixed demo-session entry, protected return-to routing, sign out, accessible skip navigation, and the authenticated Reference CRM shell.
- Added the validated Client domain model, HTTP-shaped MSW boundary, repository abstraction, deterministic local seed, persistence/reset behavior, latency, and explicit error and empty scenarios.
- Added accessible loading, error, empty, and populated client-list states with narrow-viewport behavior and automated accessibility coverage.
- Added Button, Icon/IconButton, Link, Alert, Empty State, and Table to the public registry with canonical source, Reference CRM installations, component documentation, repository-authored Figma anatomy guidance, behavior tests, and clean-install validation. Creating the owner-controlled DS Core Library and DS Reference CRM files remains the explicit external prerequisite recorded in `docs/open-decisions.md`; no Figma publication is claimed here.
- Verified the complete workspace quality gate: formatting, linting, type checking, builds, unit and browser tests, Chromium end-to-end and accessibility checks, token validation, registry boundary checks, and clean consumer installation.
