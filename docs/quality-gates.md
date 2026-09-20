# Quality gates

Run the same aggregate gate locally that pull requests run in GitHub Actions:

~~~sh
corepack pnpm install --frozen-lockfile
corepack pnpm verify
~~~

`verify` delegates all work through Turborepo and includes formatting and import organization, Oxlint, TypeScript, production builds, tests, token validation, registry validation, and the path-aware changeset policy.

## Commands

| Command | Responsibility |
| --- | --- |
| `pnpm format` | Check Biome formatting and import organization. |
| `pnpm format:write` | Apply safe Biome formatting and import organization. |
| `pnpm lint` | Run Oxlint with warnings treated as failures. |
| `pnpm typecheck` | Run package-owned TypeScript checks. |
| `pnpm build` | Build all buildable applications and packages. |
| `pnpm test` | Run package-owned Vitest suites; empty application suites are explicitly allowed while no behavior exists. |
| `pnpm tokens:check` | Run token validation when the canonical token package provides it. |
| `pnpm registry:check` | Run registry validation when the canonical registry source exists. |
| `pnpm changeset:check` | Require release intent only for public contract paths. |
| `pnpm verify` | Run every pull-request gate above. |

Token and registry checks currently report a visible not-applicable result because their canonical sources are introduced by later tickets. Turborepo automatically includes their package-owned implementations once those tasks exist.

## Changesets

Run `pnpm changeset` when a pull request changes:

- `packages/tokens/**`;
- `packages/lint-config/**`;
- `registry/**` or `registry.json`.

Documentation, application-only code, CI configuration, and internal tooling do not require a changeset. The policy and its tests live in `tools/quality/src/changeset-policy.mjs`.

## Tool ownership

Biome owns formatting and import organization. Oxlint owns TypeScript and React linting. The intentionally invalid `spikes/oxlint-shadcn-lint` fixture remains excluded from normal linting and formatting, while an automated test protects its pinned dependencies and valid/invalid examples until ticket 09 replaces it with production policy coverage.

## Pull-request CI

`.github/workflows/quality.yml` runs only for pull requests with read-only repository permission. Checkout credentials are not persisted, action releases are pinned to immutable commit SHAs, and the workflow contains no publication or deployment step.
