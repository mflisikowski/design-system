# 09: Enforce design-system lint policy

**What to build:** Make the approved design-system rules executable through actionable lint diagnostics for application code and appropriate overrides for registry source.

**Blocked by:** 05: Generate and validate token artifacts.

**Status:** ready-for-agent

- [ ] Every approved rule has valid and invalid fixtures with the intended error or warning severity.
- [ ] Diagnostics explain how to use semantic tokens and respect registry and application ownership boundaries.
- [ ] Narrow inline exception syntax is tested and cannot suppress more than the justified scope.
- [ ] The documented ESLint fallback threshold is exercised without enabling the fallback prematurely.
