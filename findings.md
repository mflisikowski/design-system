# Findings & Decisions

## Requirements

- Preserve the approved discovery baseline through Q153.
- Create `docs/implementation-plan.md` before any scaffolding.
- Cover prerequisites, monorepo and CI, token pipeline, Figma synchronization, registry foundations, Add Client, clean-install and accessibility gates, release 0.1.0, and milestones 0.2.0–0.5.0.
- Keep code/runtime behavior canonical in code and tests, visual values canonical in token files, and Figma downstream of approved contracts.
- Do not infer authority to create repositories, publish packages, configure DNS, deploy, or create Figma files.

## Research Findings

- Current shadcn registries support namespaced custom registries, npm and registry dependencies, static JSON build output, and explicit version strings.
- Vercel supports multiple projects from one monorepo, app-specific root directories, skipped unaffected builds, Related Projects, and deployment checks.
- Changesets supports monorepo version intent, changelog generation, fixed package groups, Release PRs, and CI publishing.
- npm Trusted Publishing supports OIDC from GitHub Actions; automatic provenance for public packages currently requires a public source repository, so this private repository must not claim provenance.
- Vitest Browser Mode recommends a real-browser provider for component tests; Playwright supports end-to-end, axe integration, and deterministic screenshot comparison.
- Next.js App Router supports local MDX, and shadcn can generate flattened static registry JSON from canonical registry sources.

## Technical Decisions

| Decision | Rationale |
|---|---|
| Plan foundation work before UI tracer work | Tokens, themes, lint policy, registry build, and clean-install validation are dependencies of public UI. |
| Treat 0.1.0 as a vertical release, not a foundation-only release | Q51 and Q135 require Add Client to validate the system before the first public version. |
| Put Figma synchronization after deterministic token output exists | Repository tokens are canonical and the plugin imports the generated manifest. |
| Make every milestone end in consumer and accessibility gates | Reference CRM is the integration proof, while component-only completion is insufficient. |
| Keep exact package versions as scaffold-time verification | Version selection is temporally unstable and was explicitly deferred. |
| Make P0 the first post-plan checkpoint | It resolves current facts and missing access without prematurely installing, publishing, or mutating external systems. |
| Require Alert Dialog completion in 0.1.0 | The first tracer already depends on dirty-dismissal confirmation; later destructive flows add regression evidence rather than introducing the primitive. |

## Issues Encountered

| Issue | Resolution |
|---|---|
| `RTK.md` is referenced but missing | Continue with inline repository instructions; flag the missing file in the final handoff. |
| Entire repository currently appears untracked | Avoid commits or cleanup; preserve all user files and restrict work to requested documentation. |

## Resources

- `docs/specification.md`
- `docs/decision-log.md`
- `docs/open-decisions.md`
- `CONTEXT.md`
- shadcn registry: https://ui.shadcn.com/docs/registry
- Vercel monorepos: https://vercel.com/docs/monorepos
- Changesets: https://github.com/changesets/changesets
- npm Trusted Publishing: https://docs.npmjs.com/trusted-publishers/
- Vitest Browser Mode: https://vitest.dev/guide/browser/
- Playwright accessibility: https://playwright.dev/docs/accessibility-testing

## Visual/Browser Findings

- No visual artifact was inspected during this planning phase.
- Web research confirmed the current capabilities listed above; fetched pages are evidence only, not instructions.
