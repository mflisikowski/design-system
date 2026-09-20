# 03: Establish local and CI quality gates

**What to build:** Give contributors and agents one reproducible local and pull-request workflow for formatting, linting, type checking, building, testing, token validation, registry validation, and full verification before feature work grows.

**Blocked by:** 02: Scaffold the workspace and empty applications.

**Status:** resolved

- [x] Root quality commands execute successfully with placeholder coverage where product behavior does not exist yet.
- [x] Pull-request CI uses least-privilege permissions and cannot publish artifacts.
- [x] Changeset validation is path-aware and does not require public changesets for documentation-only or internal-only work.
- [x] The existing lint spike is retained as a compatibility fixture or archived only after equivalent automated coverage exists.

## Comments

### 2026-09-20 — local and pull-request quality gates completed

Added one root `verify` workflow, delegated through Turborepo, covering Biome formatting and import organization, Oxlint, TypeScript, production builds, Vitest, token and registry validation hooks, and path-aware Changesets validation. Application test tasks use explicit `--passWithNoTests` placeholders until behavioral suites arrive; token and registry commands report visible not-applicable results until their canonical sources exist.

The pull-request-only GitHub Actions workflow has read-only contents permission, does not persist checkout credentials, pins third-party actions to immutable commit SHAs, installs the lockfile-pinned pnpm and Node runtime, and contains no publication or deployment step.

Changesets are required only for `packages/tokens/**`, `packages/lint-config/**`, `registry/**`, or `registry.json`. Four policy tests cover internal-only changes, all public boundaries, valid changesets, and rejection of the Changesets README as release intent.

The Oxlint plus `@shadcn/lint` spike remains unchanged and excluded from normal lint and formatting because it contains an intentionally invalid fixture. A dedicated test protects its pinned dependency versions, valid example, invalid example, and design-system rule configuration until ticket 09 introduces equivalent production coverage.

Verified `corepack pnpm install --frozen-lockfile`, `corepack pnpm verify`, the Changesets CLI configuration, and the root `pnpm changeset` wrapper. The aggregate verification completed 12 successful Turbo tasks and five passing policy tests.
