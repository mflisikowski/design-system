# 08: Prove registry-to-consumer installation

**What to build:** Prove the complete distribution path with one canonical sample item that builds into latest and version-addressable registry output, installs into clean consumers, and is consumed by Reference CRM without private source imports.

**Blocked by:** 06: Prove runtime themes and contrast; 07: Establish browser and flow test harnesses.

**Status:** ready-for-agent

- [ ] The sample item declares exact package, external, and registry dependencies plus maturity and installation metadata.
- [ ] Clean installation succeeds in both new-project and existing-project fixtures.
- [ ] Reference CRM consumes a committed installed copy and fails on private registry-source imports or primitive drift.
- [ ] Release artifacts can be packed and inspected without publishing.
