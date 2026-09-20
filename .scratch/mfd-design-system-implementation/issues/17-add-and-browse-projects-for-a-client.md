# 17: Add and browse Projects for a Client

**What to build:** Let a User view a Client's Projects and add a Project through the approved responsive form while Client and Project loading or failure states remain independent.

**Blocked by:** 16: Navigate Client details safely.

**Status:** ready-for-agent

- [ ] Project domain and repository behavior enforce ownership by exactly one Client and use deterministic local fixtures.
- [ ] Client details and Project data expose independent loading, empty, error, and populated states.
- [ ] Add Project validates, persists, updates the correct cache, restores focus, and provides accessible feedback.
- [ ] Direct navigation and refresh preserve the approved Client and Project state.
