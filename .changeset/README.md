# Changesets

Changesets record release intent for public MFD Design System contracts.

Run `pnpm changeset` when a pull request changes public tokens, lint policy, or registry output. Documentation-only and internal-only changes do not require a changeset; the path-aware `pnpm changeset:check` gate decides whether one is required.

Do not add an empty changeset only to satisfy CI. If the gate classifies a path incorrectly, update the tested policy in `tools/quality/src/changeset-policy.mjs`.
