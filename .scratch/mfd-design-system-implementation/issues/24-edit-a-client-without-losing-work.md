# 24: Edit a Client without losing work

**What to build:** Let a User edit an existing Client through the shared form contract without refetches overwriting dirty values and with safe non-optimistic persistence, feedback, cache synchronization, and focus restoration.

**Blocked by:** 22: Qualify and release 0.3.0.

**Status:** ready-for-agent

- [ ] ClientForm supports create and edit modes without duplicating validation or changing Add Client behavior.
- [ ] Background refetches preserve dirty values and reconcile confirmed data safely.
- [ ] Successful and failed updates produce the approved cache, focus, Alert, and Toast outcomes.
- [ ] Existing Add Client scenarios remain green after the shared-form change.
