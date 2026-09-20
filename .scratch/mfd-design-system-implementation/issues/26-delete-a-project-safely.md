# 26: Delete a Project safely

**What to build:** Let a User delete a Project from its Client context through an explicit destructive confirmation while repository outcomes, stale data, failures, and post-deletion focus remain safe and understandable.

**Blocked by:** 25: Qualify and release 0.4.0.

**Status:** ready-for-agent

- [ ] Project deletion returns typed atomic outcomes and never affects its owning Client or sibling Projects.
- [ ] Alert Dialog communicates the exact destructive context and handles pending, cancellation, success, failure, and stale records.
- [ ] Focus moves to the approved surviving target after deletion and remains safe when surrounding data changes.
- [ ] Destructive use adds regression coverage to the existing public Alert Dialog contract.
