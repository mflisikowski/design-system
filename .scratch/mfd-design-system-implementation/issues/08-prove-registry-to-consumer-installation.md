# 08: Prove registry-to-consumer installation

**What to build:** Prove the complete distribution path with one canonical sample item that builds into latest and version-addressable registry output, installs into clean consumers, and is consumed by Reference CRM without private source imports.

**Blocked by:** 06: Prove runtime themes and contrast; 07: Establish browser and flow test harnesses.

**Status:** resolved

- [x] The sample item declares exact package, external, and registry dependencies plus maturity and installation metadata.
- [x] Clean installation succeeds in both new-project and existing-project fixtures.
- [x] Reference CRM consumes a committed installed copy and fails on private registry-source imports or primitive drift.
- [x] Release artifacts can be packed and inspected without publishing.

## Comments

### 2026-09-21 — registry distribution proof completed

Added a modular shadcn source registry with an experimental canonical sample and supporting registry dependency. The pinned build emits latest and `v/0.0.0` artifacts, rewrites internal snapshot dependencies to immutable URLs, and packages the generated output through the private fixed-version registry-release workspace. The release workspace, tokens, and lint-config scaffold share one Changesets fixed group, and the versioning command synchronizes authored registry metadata after Changesets updates package versions. It also commits each generated snapshot to the durable `registry/snapshots` release archive so clean deployments retain every previous immutable URL.

The registry gate installs the latest namespace form into a clean new-project fixture and the immutable snapshot form into a clean existing-project fixture. Both installations use the real shadcn CLI, compile with TypeScript, preserve exact dependencies, and resolve a locally packed token package without publishing.

Reference CRM now commits the installed component and helper, consumes the sample on its current application home screen, and exposes `registry:sync` for reviewed updates. The gate rejects imports from private registry authoring paths and byte drift in approved installed primitives. It also builds twice for determinism, preserves historical snapshots, rejects changes to a non-development snapshot at the same version, and inspects all three coordinated tarballs produced by `pnpm pack`.

Verified the complete `pnpm verify` workflow with 23 successful Turbo tasks, including application builds, Node and browser tests, Chromium flows, token validation, clean registry installations, consumer-boundary validation, pack inspection, and Changesets policy.
