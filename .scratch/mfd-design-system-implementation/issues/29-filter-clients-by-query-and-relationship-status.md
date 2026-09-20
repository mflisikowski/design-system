# 29: Filter Clients by query and relationship status

**What to build:** Let a User combine text search and Client Relationship Status in a canonical reloadable URL, with accurate counts and empty-state explanations that identify the active criteria.

**Blocked by:** 23: Search Clients with canonical URL state; 28: Manage Client Relationship Status.

**Status:** ready-for-agent

- [ ] The application-owned Filter Bar composes canonical `q` and `status` parameters without moving routing or fetching ownership into public components.
- [ ] Changing, clearing, navigating, and reloading filters produces stable queries and protects against stale responses.
- [ ] Counts and No results feedback describe the active criteria and remain accessible across all eight contexts.
- [ ] Client Relationship Status filtering remains independent from Project Status.
