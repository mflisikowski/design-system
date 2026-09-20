# MFD Design System implementation plan

Status: approved planning baseline after Q153  
Contract source: [specification.md](specification.md)  
Decision history: [decision-log.md](decision-log.md)  
Execution prerequisites: [open-decisions.md](open-decisions.md)

## 1. Purpose and boundary

This plan turns the approved functional scope into an implementation sequence from an unscaffolded workspace through releases 0.1.0–0.5.0. It does not reopen product decisions already recorded in the specification.

Approval of this plan does not authorize creating remote repositories, claiming public namespaces, publishing npm packages, changing DNS, configuring Vercel, or creating Figma files. Those actions require their normal owner-controlled access at the point identified below.

Implementation may choose internal details that do not alter public API, domain meaning, accessibility, visual token values, supported behavior, distribution, or release policy. A contradiction in any of those areas returns to the decision log before code proceeds.

## 2. Delivery principles

1. Build vertical slices in the approved tracer order; do not build the component catalog alphabetically.
2. Keep runtime behavior and accessibility semantics in code and behavioral tests, visual values in canonical token files, and Figma downstream of approved contracts.
3. Exercise public UI in Reference CRM through installed registry copies, not private source imports.
4. Generate registry JSON, token outputs, manifests, API tables, and screenshots; never edit generated outputs manually.
5. Finish every milestone with clean-consumer installation, browser behavior, accessibility, and cross-theme verification before release work begins.
6. Keep brand, resolved color scheme, and density independent throughout source, runtime, Figma, and testing.
7. Prefer the smallest component surface justified by the current flow; application patterns remain outside the public registry until repeated evidence supports promotion.

## 3. Release dependency map

| Stage | Depends on | Primary outcome | Public milestone |
|---|---|---|---|
| P0 — prerequisites | approved specification | verified external names, owners, and current versions | none |
| P1 — workspace foundation | P0 facts needed for naming | reproducible monorepo, CI, local quality commands | none |
| P2 — tokens and themes | P1 | canonical DTCG sources and generated runtime/Figma artifacts | none |
| P3 — distribution and test foundation | P1, P2 | registry build, consumer install, lint and browser harnesses | none |
| P4 — Figma foundation | P2 | reviewed one-way token synchronization and base library | none |
| P5 — Add Client slice | P2, P3, P4 | first complete consumer flow and public component set | 0.1.0 |
| P6 — Client Projects | 0.1.0 | details, projects, navigation, Select, Badge | 0.2.0 |
| P7 — Appearance | 0.2.0 | runtime theme axes, Radio Group, Theme Preview | 0.3.0 |
| P8 — Search and edit | 0.3.0 | Search Field, URL query state, reusable ClientForm edit | 0.4.0 |
| P9 — deletion and filtering | 0.4.0 | Alert Dialog, dependency-safe deletion, relationship status | 0.5.0 |

P4 may run alongside late P3 work after the token manifest format is deterministic, but P5 cannot finish until representative Figma specifications and runtime behavior agree.

## 4. Phase P0 — execution prerequisites

### Objectives

- Replace deferred factual assumptions with current, recorded evidence.
- Identify user-owned external actions before they become critical-path surprises.
- Preserve the approved contract if current tool capability differs from discovery-time research.

### Tasks

- Verify availability and ownership of the npm scope `@mflisikowski`.
- Verify the intended decentralized shadcn namespace and canonical registry URL.
- Confirm access and naming for the private source repository without creating or pushing it implicitly.
- Confirm the two Vercel projects, domains, plan capabilities, and whether Deployment Checks can gate promotion; retain explicit workflow promotion as the approved fallback.
- Confirm access to the Figma team/project in which DS Core Library and DS Reference CRM will be created.
- Recheck current stable Node.js, pnpm, Next.js, React, Tailwind CSS, Base UI, Turborepo, Terrazzo, DTCG Resolver, Oxlint, Biome, shadcn CLI, Vitest, Playwright, MSW, TanStack Query, React Hook Form, Zod, Sonner, Lucide, and Changesets releases from primary sources.
- Pin exact versions and record intentional deviations from the previously validated lint spike.
- Resolve or deliberately remove the missing `RTK.md` include referenced by repository instructions.

### Deliverables

- A short version-and-capability record committed with the scaffold.
- Confirmed external ownership checklist with no secrets in the repository.
- Any contract-impacting incompatibility returned to a numbered decision before implementation.

### Exit gate

Local scaffold work may begin when tool versions and names are verified. Publishing-related account setup may remain pending until the release-readiness gate, but it must have a named owner and verification step.

## 5. Phase P1 — workspace and CI foundation

### Objectives

- Establish a reproducible pnpm/Turborepo workspace.
- Make the final quality commands available before feature code grows.

### Planned structure

```text
apps/
  docs/
  reference-crm/
packages/
  tokens/
  lint-config/
  registry-release/
registry/
  ui/
  blocks/
  themes/
tools/
  figma-token-sync/
```

The exact plugin location may be adjusted without changing its ownership or one-way synchronization contract.

### Tasks

- Scaffold the root workspace, pinned package manager, shared TypeScript settings, Turborepo graph, and deterministic lockfile.
- Scaffold both Next.js applications without product UI.
- Add Biome formatting/import organization and Oxlint wiring.
- Preserve and turn the existing `spikes/oxlint-shadcn-lint` result into a recorded compatibility fixture or archive it once equivalent automated coverage exists.
- Add root commands for format check, lint, typecheck, unit tests, browser component tests, end-to-end tests, token checks, registry build, clean install, and full verification.
- Configure dependency and environment declarations so Turborepo hashing reflects build-affecting variables.
- Establish GitHub Actions jobs with least-privilege permissions and no publication capability in ordinary pull-request workflows.
- Add path-aware Changesets validation without requiring changesets for documentation-only or internal-only work.
- Add a deterministic fictional-data seed and clock helpers for future tests.

### Exit gate

- Fresh install succeeds from the lockfile.
- Both empty applications build.
- Formatting, lint, typecheck, and placeholder test jobs run locally and in CI.
- No generated output is treated as authored source.

## 6. Phase P2 — canonical tokens and runtime themes

### Objectives

- Implement the approved DTCG/Terrazzo pipeline before component styling.
- Produce all runtime and Figma artifacts from one canonical source.

### Work packages

#### P2.1 Token source and resolver

- Create the approved layer-first token layout and DTCG Resolver document.
- Encode Atlas and Bloom references, light/dark semantic mappings, and comfortable/compact dimensional mappings.
- Encode typography, spacing, radius, elevation, motion, danger, success, and warning contracts.
- Keep component-token files absent until a validated component proves the exception.

#### P2.2 Validation and generation

- Configure `tz check` and CSS generation.
- Add schema, alias integrity, type, naming grammar, completeness, gamut, and permutation checks.
- Generate eight resolved runtime permutations, Tailwind-facing semantic utilities, typed/programmatic exports, and the Figma variables manifest.
- Verify generated hex fallbacks against canonical OKLCH values.
- Fail when a component usage contains primitive color values.

#### P2.3 Contrast and rendering evidence

- Enumerate actual semantic foreground/background, boundary/background, focus, selection, and on-solid pairs.
- Measure every emitted pair after conversion and in representative rendered contexts.
- Record narrow exceptions only with the approved inline justification process.
- Add regression fixtures for the accepted warning values and every approved brand ramp.

#### P2.4 Runtime root contract

- Provide the CSS selectors and typed values for `data-brand`, `data-color-scheme`, and `data-density`.
- Implement fixed and system color-scheme resolution without client-JavaScript dependency.
- Declare browser `color-scheme` support early enough to prevent incorrect native-control rendering.

### Exit gate

- `tz check`, generation, permutation completeness, gamut, and contrast checks pass.
- Rebuilding produces no diff.
- A static fixture renders all eight contexts with correct root attributes and self-hosted fonts.
- Figma manifest schema, hash, and deterministic ordering are stable.

## 7. Phase P3 — registry, lint, documentation, and test foundation

### P3.1 Registry authoring and release shape

- Create the canonical source registry with included catalogs for UI, blocks, and themes.
- Generate flattened latest and version-addressable JSON only at build time.
- Create the private registry-release workspace that shares the fixed Changesets version with public packages.
- Make each item declare exact MFD package versions, external dependencies, registry dependencies, maturity, descriptions, and installation notes.
- Implement clean installation into both a new project and an existing-project fixture.

### P3.2 Reference CRM consumer boundary

- Add `registry:sync` to install approved items into committed `apps/reference-crm` copies.
- Reject private registry-source imports from Reference CRM.
- Detect drift only for installed primitives; exclude application-owned patterns.
- Require registry-source changes before syncing primitive changes into CRM.

### P3.3 Lint policy

- Implement the approved strict application policy and registry-source overrides in `packages/lint-config`.
- Start the approved rules at error or warning severity.
- Add actionable diagnostics and fixtures for valid code, each violation, and narrow exception syntax.
- Exercise the documented ESLint fallback threshold without enabling the fallback pre-emptively.

### P3.4 Documentation shell

- Scaffold local MDX, the typed content manifest, six primary destinations, desktop sidebar, local table of contents, Breadcrumbs, and native mobile disclosure.
- Add structural checks for slugs, manifest coverage, links, and headings.
- Build reusable documentation primitives for maturity, installation, code examples, accessibility, keyboard behavior, and live canonical examples.
- Do not add documentation search, command palette, or Storybook.

### P3.5 Test harnesses

- Configure Node Vitest, Vitest Browser Mode with Playwright, Playwright Test, MSW fixtures, and axe integration.
- Establish Chromium pull-request projects and Chromium/Firefox/WebKit release projects.
- Establish deterministic Linux Chromium screenshot baselines without automatic update or global masking tolerance.
- Add manual verification templates for screen reader, zoom, touch, contrast, RTL, long content, and reduced motion.

### Exit gate

- A sample registry item builds, installs, and is consumed without private imports.
- Lint fixtures and all three test layers run in CI.
- Docs render a canonical sample and validate their information architecture.
- The release artifact can be packed and inspected without publishing.

## 8. Phase P4 — Figma foundation and synchronization

### Objectives

- Create an accessibility-ready design specification that consumes repository-owned contracts.
- Prove synchronization without making Figma canonical.

### Owner-controlled setup

- Create DS Core Library and DS Reference CRM files in the confirmed Figma location.
- Establish manual publishing ownership and review access.

### Plugin work

- Build the local MFD token synchronization plugin against the generated manifest.
- Implement local-file import with no production network permission.
- Implement read-only Check with create, update, unchanged, conflict, and stale categories.
- Implement explicit Apply where repository values win managed conflicts.
- Implement separately confirmed Prune for stale managed variables.
- Identify managed variables by canonical token path and store manifest hash/management metadata.

### Library foundation

- Create hidden MFD Reference Color, published MFD Semantic Color, independent MFD Density, and approved typography/foundation collections.
- Map four brand/scheme color modes and two independent density modes.
- Review representative values and components before every manual library publication.

### Exit gate

- Re-importing the same manifest is a no-op.
- Conflict and stale-variable fixtures behave as specified.
- Apply never publishes, and Prune never runs implicitly.
- Representative values match repository outputs in all modes.

## 9. Phase P5 — release 0.1.0: Add Client

### P5.1 Public foundations validated by the flow

- Icon and the approved initial icon map.
- Button and IconButton.
- Field, Label, Input, and Textarea.
- Dialog and Alert Dialog behavior needed for dirty dismissal.
- Alert and Toast adapter.
- Empty State.
- Native semantic Table primitives.

Each public item receives tokens, Figma anatomy, API documentation, behavior tests, accessibility states, registry metadata, and clean-install coverage before stable maturity.

### P5.2 Reference CRM platform slice

- Implement the transparent fixed demo session, protected routing, return-to handling, and sign out.
- Implement the application-owned visible App Shell and skip link without publishing shell components.
- Implement Client domain types, including the persisted default `relationshipStatus="active"` without exposing status controls yet, plus Zod validation, ClientRepository, browser MSW handlers, localStorage persistence, reset, latency, and error simulation.
- Configure TanStack Query and deterministic seed data.

### P5.3 Add Client tracer

- Build the Client list, loading/error/empty states, application-owned ClientTable, and Add client trigger.
- Build application-owned ClientForm with React Hook Form and approved validation timing.
- Implement responsive Dialog presentation, dirty-dismissal Alert Dialog, pending blocking, mapped field errors, persistent server Alert, cache update/revalidation, focus restoration, and success Toast.
- Cover all eleven first-tracer acceptance scenarios from section 11.7 of the specification.

### P5.4 Documentation and Figma

- Publish the foundations and component pages needed by the tracer.
- Build the Reference CRM Figma screens from the reviewed DS Core Library.
- Mark maturity honestly; no item becomes stable before its full Definition of Done.

### 0.1.0 release-readiness gate

- All automated quality commands pass.
- Clean new-project and existing-project installs pass from the immutable 0.1.0 snapshot.
- All eight theme contexts pass the tracer matrix; the representative visual matrix is reviewed.
- Required manual keyboard, screen-reader, zoom, reflow, touch, contrast, long-content, RTL, and reduced-motion checks are recorded.
- Public package names, OIDC publisher configuration, Vercel projects/domains, Figma publication, and release permissions are owner-confirmed.
- Release pipeline completes build → publish → public verification → consumer reinstall → deployment promotion.

## 10. Phase P6 — release 0.2.0: Client details and Projects

### Scope

- Client details route, unknown-client handling, Breadcrumb, Link, and Page Header.
- Project domain/repository support and independent Client/Project query states.
- Add Project with the approved responsive form behavior.
- Select, Badge, ProjectTable, Project status transitions, and warning tokens in real usage.
- Direct navigation and cache behavior described by the ten second-tracer acceptance scenarios.

### Exit gate

- All section 11.12 scenarios pass.
- Select and Badge meet public Definition of Done and clean-install checks.
- Every status remains accessible in all eight contexts.
- 0.2.0 migration and changelog content explain the new public contracts without altering 0.1.0 APIs silently.

## 11. Phase P7 — release 0.3.0: Appearance

### Scope

- Server-validated preference cookies and root attributes for all three axes.
- Theme Provider synchronization without application remount.
- System scheme reaction, browser color-scheme integration, failure rollback, and atomic reset.
- Radio Group, RadioCard composition, and Theme Preview.
- Appearance settings inside the application-owned App Shell.

### Exit gate

- All section 11.14 scenarios pass without flash or hydration diagnostics.
- Cookie failure, invalid values, system changes, focus preservation, and 44px effective touch targets are covered.
- Radio Group receives full registry/docs/Figma/clean-install completion.
- The all-eight-context release visual matrix is reviewed.

## 12. Phase P8 — release 0.4.0: Search and edit

### Scope

- Search Field public component and application-owned URL/debounce/query orchestration.
- Normalized organization/contact/email search, stale-response protection, retained results, counts, errors, and No results.
- Application-owned ClientForm create/edit modes with protected dirty values during refetch.
- Non-optimistic Client update, cache synchronization, focus restoration, and success feedback.

### Exit gate

- All section 11.17 and 11.19 scenarios pass.
- Published Search Field installs cleanly and owns no routing or fetching behavior.
- Add Client has no regression from shared ClientForm work.
- Search URLs remain canonical and reloadable.

## 13. Phase P9 — release 0.5.0: deletion and filtering

### Scope

- Typed, atomic repository deletion outcomes and the no-cascade Client rule.
- Contextual Project deletion, safe focus fallback, blocked Client deletion, and final Client deletion navigation.
- Client `relationshipStatus`, contextual status Select, Badge mapping, and cache behavior.
- Application-owned Filter Bar combining canonical `q` and `status` parameters.
- Result counts and criterion-aware No results feedback.

### Exit gate

- All section 11.22 and 11.24 scenarios pass.
- Alert Dialog receives destructive-context regression coverage in addition to the public Definition of Done already required by 0.1.0.
- Deletion never cascades, stale data resolves safely, and rollback/error paths preserve domain integrity.
- Filtering and status remain independent from Project Status and retain accessible behavior across the full context matrix.

## 14. Cross-cutting work maintained in every phase

### Documentation and maturity

- Add or update component pages, installation commands, dependency disclosures, and migration notes in the same change as public behavior.
- Execute published commands in clean-install CI.
- Record every maturity transition in the changelog.

### Accessibility

- Test semantics and keyboard behavior at component and flow levels.
- Run axe only on stable, awaited states and keep manual verification mandatory.
- Never claim runtime accessibility from Figma alone.

### Security and privacy

- Keep demonstration data fictional and local.
- Never treat the demo session as production authentication.
- Use least-privilege CI permissions and OIDC for publication.
- Keep client-specific themes, assets, fonts, and logos out of public artifacts.

### Change control

- A change to a public contract updates the specification and decision log before implementation diverges.
- New components require validated Reference CRM usage.
- Exceptions remain narrow, inline, measurable, and reviewable.
- Exact dependency upgrades are deliberate and run the full compatibility sequence.

## 15. Verification matrix

| Gate | Pull request | Milestone release |
|---|---|---|
| Format, lint, typecheck, build | required | required |
| Token schema/generation/contrast | affected changes | full |
| Node unit tests | affected plus dependency graph | full |
| Browser component tests | Chromium | Chromium, Firefox, WebKit |
| End-to-end tracer tests | affected Chromium flows | all completed flows, three engines |
| Axe | affected approved states | all completed tracer states |
| Visual regression | two representative contexts | eight contexts for key screens |
| Registry clean install | affected items | new and existing clean consumers |
| Manual accessibility | affected contract | recorded release matrix |
| Figma review | affected specification | representative modes before publish |
| Package inspection | when publishable output changes | every artifact |

## 16. Known risks and responses

| Risk | Response |
|---|---|
| Young lint integration changes underneath the project | Pin versions, retain compatibility fixtures, upgrade only through the full matrix, use the approved fallback threshold. |
| Installed Reference CRM primitives drift from registry source | Commit installed copies, update only through `registry:sync`, and fail CI on primitive drift. |
| Eight-context visual coverage becomes slow | Keep the representative PR matrix and full release matrix; do not reduce behavioral coverage. |
| Figma becomes a competing source of truth | One-way local manifest import, explicit Check/Apply/Prune, canonical-path identity, and manual publication. |
| Release exposes registry source before matching npm packages | Gate latest and production promotion until public package resolution and repeated clean install pass. |
| Private repository prevents npm provenance | Use OIDC Trusted Publishing but make no provenance claim; revisit only if repository visibility changes. |
| Browser or framework version drift changes behavior | Pin scaffold versions, use deliberate upgrades, and rerun full cross-browser and clean-install gates. |
| Missing repository instruction include hides expected rules | Resolve `RTK.md` before scaffold work or remove the stale include explicitly. |

## 17. First implementation checkpoint

The first implementation task after this plan is approved is P0 only: verify current versions, external names, required access, and the missing repository instruction include. It must produce evidence and proposed pins, not install or publish anything automatically. Scaffold work starts only after that checkpoint is reviewed.
