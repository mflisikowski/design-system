# 30: Qualify and release 0.5.0

**What to build:** Qualify deletion, Client Relationship Status, and combined filtering as the final version 1 milestone after proving domain integrity, accessibility, context coverage, clean distribution, and recovery behavior.

**Blocked by:** 27: Prevent unsafe Client deletion; 29: Filter Clients by query and relationship status.

**Status:** ready-for-agent

- [ ] All approved deletion and filtering scenarios pass across the required browser and theme matrices.
- [ ] Deletion never cascades, stale data resolves safely, and all error or rollback paths preserve domain integrity.
- [ ] Filtering and both status concepts remain independent and accessible throughout the full context matrix.
- [ ] Clean installs, manual verification, Figma review, changelog, migration notes, and the approved 0.5.0 release pipeline complete successfully.
