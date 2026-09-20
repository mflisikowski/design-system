# 03: Establish local and CI quality gates

**What to build:** Give contributors and agents one reproducible local and pull-request workflow for formatting, linting, type checking, building, testing, token validation, registry validation, and full verification before feature work grows.

**Blocked by:** 02: Scaffold the workspace and empty applications.

**Status:** ready-for-agent

- [ ] Root quality commands execute successfully with placeholder coverage where product behavior does not exist yet.
- [ ] Pull-request CI uses least-privilege permissions and cannot publish artifacts.
- [ ] Changeset validation is path-aware and does not require public changesets for documentation-only or internal-only work.
- [ ] The existing lint spike is retained as a compatibility fixture or archived only after equivalent automated coverage exists.
