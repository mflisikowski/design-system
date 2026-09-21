# 11: Synchronize repository tokens into Figma

**What to build:** Provide a local, one-way Figma synchronization workflow that previews repository-owned token changes, applies managed values explicitly, and prunes stale managed values only through a separate confirmed operation.

**Blocked by:** 06: Prove runtime themes and contrast.

**Status:** resolved

- [x] Check reports creates, updates, unchanged entries, conflicts, and stale managed entries without modifying the file.
- [x] Apply uses canonical token paths, records manifest metadata, resolves managed conflicts in favor of the repository, and never publishes the library.
- [x] Prune is separately confirmed and never runs implicitly during Apply.
- [x] Re-importing the same manifest is a no-op and representative values match all approved modes.

## Comments

### 2026-09-21 — local repository-to-Figma synchronization completed

- Added a local Figma Design plugin that validates the generated manifest and presents a read-only Check diff with concrete before/after snapshots for managed collections, modes, variables, conflicts, and stale entries.
- Added explicit Apply and separately confirmed Prune operations. Canonical token paths and mode IDs are stored as plugin data, repository values win managed drift, and unmanaged Figma content is never adopted, overwritten, or pruned.
- Added manifest metadata and variable snapshot fingerprints, plus a second snapshot check immediately before Apply or Prune so a file changed after Check must be reviewed again.
- Added coverage for all approved color and density modes, exact no-op re-imports, metadata-only updates, managed drift, stale selection, unmanaged-content protection, and Check-to-mutation race protection.
- Verified workspace build, lint, typecheck, full tests, and registry installation validation. Token generation and Terrazzo validation pass; the final component-usage gate remains blocked by the pre-existing `color-mix()` in `apps/docs/app/globals.css:76`, outside this ticket's scope.
