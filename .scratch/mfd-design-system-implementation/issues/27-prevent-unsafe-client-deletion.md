# 27: Prevent unsafe Client deletion

**What to build:** Prevent deletion of a Client that still owns any Project, explain the blocking relationship, and allow final Client deletion only after dependencies are removed, without cascading data loss.

**Blocked by:** 26: Delete a Project safely.

**Status:** ready-for-agent

- [ ] A Client with any Project cannot be deleted and receives actionable, accessible blocked-deletion feedback.
- [ ] No deletion path cascades from Client to Project, including stale-data and retry paths.
- [ ] Deleting an eligible Client is atomic, reconciles caches, and navigates to the approved safe destination.
- [ ] Failure and rollback outcomes preserve domain integrity and focus.
