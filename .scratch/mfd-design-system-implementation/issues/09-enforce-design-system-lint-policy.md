# 09: Enforce design-system lint policy

**What to build:** Make the approved design-system rules executable through actionable lint diagnostics for application code and appropriate overrides for registry source.

**Blocked by:** 05: Generate and validate token artifacts.

**Status:** resolved

- [x] Every approved rule has valid and invalid fixtures with the intended error or warning severity.
- [x] Diagnostics explain how to use semantic tokens and respect registry and application ownership boundaries.
- [x] Narrow inline exception syntax is tested and cannot suppress more than the justified scope.
- [x] The documented ESLint fallback threshold is exercised without enabling the fallback prematurely.

## Comments

### 2026-09-21 — executable lint policy completed

- Published the strict shared Oxlint preset with all six approved `@shadcn/lint` rules and actionable MFD guidance; the repository-local canonical `registry/` override disables only `no-restyle`.
- Added valid and invalid fixtures for every rule, including severity assertions and application-versus-registry ownership coverage.
- Added a parser-backed `oxlint-disable-next-line` exception check with mandatory reasons, a reviewed repository baseline, bypass regression coverage, and unused-directive failures.
- Exercised every documented ESLint fallback condition while keeping ESLint absent.
- Verified the complete workspace with `pnpm verify`, including builds, tests, Browser Mode, E2E, tokens, registry installation, and changeset policy.
