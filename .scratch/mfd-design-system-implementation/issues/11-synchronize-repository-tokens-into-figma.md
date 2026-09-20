# 11: Synchronize repository tokens into Figma

**What to build:** Provide a local, one-way Figma synchronization workflow that previews repository-owned token changes, applies managed values explicitly, and prunes stale managed values only through a separate confirmed operation.

**Blocked by:** 06: Prove runtime themes and contrast.

**Status:** ready-for-agent

- [ ] Check reports creates, updates, unchanged entries, conflicts, and stale managed entries without modifying the file.
- [ ] Apply uses canonical token paths, records manifest metadata, resolves managed conflicts in favor of the repository, and never publishes the library.
- [ ] Prune is separately confirmed and never runs implicitly during Apply.
- [ ] Re-importing the same manifest is a no-op and representative values match all approved modes.
