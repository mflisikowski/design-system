# 25: Qualify and release 0.4.0

**What to build:** Qualify Client search and editing as an immutable release with canonical URLs, stale-request safety, preserved user work, clean distribution, and no regression to Client creation.

**Blocked by:** 23: Search Clients with canonical URL state; 24: Edit a Client without losing work.

**Status:** ready-for-agent

- [ ] All approved search and edit scenarios pass across the required browser and theme matrices.
- [ ] Search URLs reload canonically and Search Field installs cleanly without application-owned routing or fetching behavior.
- [ ] The complete Add Client flow remains regression-free.
- [ ] The approved release pipeline completes successfully for 0.4.0.
