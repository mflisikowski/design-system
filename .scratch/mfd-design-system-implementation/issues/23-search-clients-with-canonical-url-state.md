# 23: Search Clients with canonical URL state

**What to build:** Let a User search Clients by organization, contact, or email through a canonical reloadable URL while results remain stable during debounce, requests, empty outcomes, and failures.

**Blocked by:** 22: Qualify and release 0.3.0.

**Status:** ready-for-agent

- [ ] Search normalization, debounce, URL updates, stale-response protection, retained results, and counts match the approved behavior.
- [ ] Loading, error, cleared query, and No results states are distinguishable and accessible.
- [ ] Search Field owns only reusable input behavior; routing, fetching, and query orchestration remain application-owned.
- [ ] Search Field completes registry, docs, Figma, behavioral, accessibility, and clean-install requirements.
