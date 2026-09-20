# Execution prerequisites evidence

**Researched:** 2026-09-20
**Scope:** ticket 01, read-only verification only
**External changes made:** none

This record separates externally verified facts from project recommendations. It
does not claim ownership of accounts, namespaces, domains, projects, or files
that could not be verified through the current authenticated sessions.

## Summary

- The requested runtime and package set has a coherent exact-pin baseline on
  Node.js 24.21.0 LTS.
- The stable DTCG 2025.10 Format, Color, and Resolver reports and Terrazzo 2.7.1
  support the repository's planned token architecture.
- The shadcn namespace design is viable, but the project specification's URL
  placeholder is incompatible with the CLI: it must be `{name}`, not `{item}`.
- The two-project Vercel topology, Related Projects, Deployment Checks, and an
  explicit promotion fallback are supported by the platform, with constraints
  recorded below.
- npm Trusted Publishing can publish from GitHub Actions without a long-lived
  write token, but a private canonical repository will not receive npm
  provenance attestations.
- The Figma Plugin API can implement the planned local, one-way variable sync;
  library publication still requires a paid plan, a Full seat, edit access, and
  an explicit human publish action.
- Account ownership remains partly unverified. The version matrix, Figma target,
  and instruction cleanup are ready, but ticket 01 should not be considered
  complete until the remaining owner checklist is resolved.

## Verified facts

### Runtime and package versions

`latest` below means the public npm `latest` dist-tag observed on 2026-09-20.
The compatibility column reports published `engines` or `peerDependencies`
metadata; where a package publishes neither, the table does not invent a
constraint.

| Runtime or package | Current stable release | Published compatibility relevant here |
| --- | ---: | --- |
| Node.js | [26.9.0 Current; 24.21.0 LTS](https://nodejs.org/dist/index.json) | Node states that production applications should use Active or Maintenance LTS releases; 24.21.0 is the newest LTS build, while 26.9.0 is Current. [Release policy](https://nodejs.org/en/about/previous-releases) |
| pnpm | [12.5.1](https://registry.npmjs.org/pnpm/latest) | Node `>=18` |
| Next.js | [16.3.5](https://registry.npmjs.org/next/latest) | Node `>=20.9.0`; React/React DOM `^18.2.0` or `^19.0.0` (plus the documented RC) |
| React | [19.3.0](https://registry.npmjs.org/react/latest) | Pair with [React DOM 19.3.0](https://registry.npmjs.org/react-dom/latest), whose peer is React `^19.3.0` |
| Tailwind CSS | [4.3.3](https://registry.npmjs.org/tailwindcss/latest) | No Node engine is declared in the package metadata; the matching [PostCSS adapter is 4.3.3](https://registry.npmjs.org/%40tailwindcss%2Fpostcss/latest) |
| Base UI | [@base-ui/react 1.8.0](https://registry.npmjs.org/%40base-ui%2Freact/latest) | React and React DOM 17, 18, or 19; Node `>=14`. Base UI also documents React 17+ support. [Official compatibility](https://base-ui.com/react/overview/about) |
| Turborepo | [turbo 2.11.2](https://registry.npmjs.org/turbo/latest) | No Node engine is declared in the package metadata |
| Terrazzo CLI | [@terrazzo/cli 2.7.1](https://registry.npmjs.org/%40terrazzo%2Fcli/latest) | Its dependency set includes the matching parser/token tooling line; the CLI documents `build`, `lint`, `check`, and resolver `bundle`. [CLI reference](https://terrazzo.app/docs/reference/cli/) |
| Terrazzo CSS plugin | [@terrazzo/plugin-css 2.7.1](https://registry.npmjs.org/%40terrazzo%2Fplugin-css/latest) | Peers on `@terrazzo/cli` and `@terrazzo/parser` `^2.7.1`; its permutation API accepts resolver-context inputs and selector/media wrappers. [CSS integration](https://terrazzo.app/docs/integrations/css/) |
| DTCG | [2025.10 stable technical report](https://www.designtokens.org/tr/2025.10/) | The final Format, Color, and Resolver modules are stable Community Group reports, not W3C Standards. The current `/drafts/` resolver is explicitly a preview and says not to implement or cite it as authoritative. [Report index](https://www.designtokens.org/technical-reports/) · [preview warning](https://www.designtokens.org/tr/drafts/resolver/) |
| Oxlint | [1.83.0](https://registry.npmjs.org/oxlint/latest) | Node `^20.19.0` or `>=22.12.0`; JavaScript plugins remain alpha and are not covered by semver. [JS plugin status](https://oxc.rs/docs/guide/usage/linter/js-plugins) |
| Biome | [@biomejs/biome 2.5.14](https://registry.npmjs.org/%40biomejs%2Fbiome/latest) | Node `>=14.21.3` |
| shadcn CLI | [shadcn 4.21.0](https://registry.npmjs.org/shadcn/latest) | Node `>=20.18.1` |
| shadcn design-system lint | [@shadcn/lint 0.1.1](https://registry.npmjs.org/%40shadcn%2Flint/latest) | Node `>=20.19`; official Oxlint setup requires Oxlint `>=1.80` and calls the JS plugin API alpha. ESLint is the declared npm peer (`>=9.30`). [Official repository](https://github.com/shadcn-ui/lint) |
| Vitest | [5.0.1](https://registry.npmjs.org/vitest/latest) | Node `^22.12.0`, `^24.0.0`, or `>=26.0.0`; browser packages for this line are expected at the exact matching 5.0.1 version |
| Playwright Test | [@playwright/test 1.63.0](https://registry.npmjs.org/%40playwright%2Ftest/latest) | Node `>=20`; also satisfies Next.js's optional Playwright peer `^1.51.1` |
| Mock Service Worker | [msw 2.15.0](https://registry.npmjs.org/msw/latest) | Node `>=18`; TypeScript `>=4.8` peer |
| TanStack Query | [@tanstack/react-query 5.103.1](https://registry.npmjs.org/%40tanstack%2Freact-query/latest) | React `^18` or `^19` |
| React Hook Form | [7.88.0](https://registry.npmjs.org/react-hook-form/latest) | Node `>=18`; React `^16.8`, 17, 18, or 19 |
| Zod | [4.6.5](https://registry.npmjs.org/zod/latest) | No Node engine or React peer is declared in the package metadata |
| Sonner | [2.0.8](https://registry.npmjs.org/sonner/latest) | React and React DOM 18 or 19 |
| Lucide React | [1.47.0](https://registry.npmjs.org/lucide-react/latest) | React 16.5 through 19 |
| Changesets CLI | [@changesets/cli 3.0.3](https://registry.npmjs.org/%40changesets%2Fcli/latest) | Node `^22.11`, `^24`, or `>=26`; pnpm `>=10`; npm `>=10.9` |

Node 24.21.0 satisfies every published Node engine above. It ships npm 11.19.0,
which also exceeds npm Trusted Publishing's npm 11.5.1 and Node 22.14.0 minimums.
[Node release metadata](https://nodejs.org/dist/index.json) ·
[npm Trusted Publishing requirements](https://docs.npmjs.com/trusted-publishers/)

### DTCG and Terrazzo status

The immutable DTCG 2025.10 report identifies the Format, Color, and Resolver
modules as stable. Resolver documents use version `2025.10`; sets combine token
sources, modifiers select one context per axis, and `resolutionOrder` controls
composition. [DTCG 2025.10](https://www.designtokens.org/tr/2025.10/) ·
[Terrazzo resolver guide](https://terrazzo.app/docs/guides/resolvers/)

Terrazzo 2.7.1 exposes resolver application in its parser API and supports CSS
output permutations driven by resolver inputs. This is enough to represent the
project's brand, color-scheme, and density axes and emit selected wrappers,
provided the implementation verifies all eight permutations in tests.
[Terrazzo resolver API](https://terrazzo.app/docs/reference/js-api/) ·
[resolver-context guide](https://terrazzo.app/docs/guides/resolver-contexts/)

The source files should reference the immutable final schemas, for example
`https://www.designtokens.org/schemas/2025.10/format.json` and
`https://www.designtokens.org/schemas/2025.10/resolver.json`, and should never
reference `/tr/drafts/`. [DTCG schema example](https://terrazzo.app/docs/guides/styleguide/)

### shadcn registry namespaces and URLs

shadcn namespaces are decentralized. They do not require a central reservation,
and a valid namespace begins with `@` and contains alphanumerics, hyphens, or
underscores. A consumer maps the namespace in `components.json` to a URL template.
The template's required interpolation token is exactly `{name}`.
[Namespace documentation](https://ui.shadcn.com/docs/registry/namespace)

A custom registry publishes a catalog at its registry endpoint and individual
item JSON files. The official example uses `/r/registry.json` for the catalog and
`/r/{name}.json` for namespace resolution. Direct item URLs remain installable,
so the project's immutable `/r/v/{version}/{name}.json` snapshots are compatible
with the CLI without a second namespace.
[Registry publishing guide](https://ui.shadcn.com/docs/registry/getting-started) ·
[registry dependency address forms](https://ui.shadcn.com/docs/registry/registry-item-json)

The official namespace index is optional and is described for open-source,
public registries. The private canonical monorepo therefore does not need index
registration for `@mflisikowski`; consumers can configure the URL template
directly. [Registry publishing guide](https://ui.shadcn.com/docs/registry/getting-started)

### Vercel topology and release controls

Vercel supports multiple projects connected to one monorepo repository, each
with its own Root Directory. Git-connected pnpm workspaces can automatically
skip unaffected projects when package names are unique and internal dependencies
are declared. Two projects fit the published limits of 10 connected projects per
repository on Hobby and 60 on Pro.
[Monorepo documentation](https://vercel.com/docs/monorepos) ·
[platform limits](https://vercel.com/docs/limits)

Related Projects supports up to three projects from the same repository and
exposes matching deployment hosts through `VERCEL_RELATED_PROJECTS`. It does not
support CLI-created deployments. The planned pair therefore fits, but preview
deployment creation should remain Git-integrated if paired preview URLs are
required. [Related Projects](https://vercel.com/docs/monorepos#how-to-link-projects-together-in-a-monorepo)

Deployment Checks can hold a production deployment before its custom domains are
assigned. Vercel can run native `lint` and `typecheck` scripts or import selected
GitHub checks; required checks release the domain alias only after success.
Native Deployment Checks are available to every team. Custom Checks API access,
which this project does not currently require, is documented as Pro/Enterprise.
[Deployment Checks](https://vercel.com/docs/deployment-checks) ·
[native availability](https://vercel.com/changelog/native-deployment-checks) ·
[Checks API plan note](https://vercel.com/docs/integrations/create-integration/vercel-api-integrations#deployment-checks)

The explicit fallback is first-party supported: create a production deployment
without assigning the domain with `vercel --prod --skip-domain`, then assign it
later with `vercel promote <deployment-id-or-url>`. Because Related Projects does
not support CLI deployments, the safer project-specific fallback is to promote
an already-built Git deployment rather than replace Git deployment creation with
the CLI. [Staged production deployment](https://vercel.com/docs/cli/deploying-from-cli#deploying-a-staged-production-build)

### npm Trusted Publishing and provenance

npm Trusted Publishing exchanges CI OIDC identity for short-lived publish
credentials. GitHub Actions requires a GitHub-hosted runner, `id-token: write`,
and an exact match between the configured owner, repository, and workflow
filename. The package's `repository.url` must also exactly match the GitHub
repository. [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)

OIDC covers `npm publish` and `npm stage publish`; it does not authenticate
ordinary `install`, `view`, or `access` operations. Private dependencies still
need a read-only credential. [Trusted Publishing limitations](https://docs.npmjs.com/trusted-publishers/#limitations-and-future-improvements)

Automatic npm provenance requires trusted publishing from GitHub Actions or
GitLab CI, a public package, and a public repository. A public package built from
this project's private canonical repository will not receive provenance, even
though OIDC publishing itself remains available.
[Automatic provenance conditions](https://docs.npmjs.com/trusted-publishers/#automatic-provenance-generation)

### Figma plugin and variable capabilities

The Plugin API can read local collections and variables, create collections and
variables, add and rename modes, set values per mode, and create aliases. It can
also set web code syntax, scopes, descriptions, hidden-from-publishing flags,
and plugin-owned metadata on variables and collections.
[Working with Variables](https://developers.figma.com/docs/plugins/working-with-variables/) ·
[Variables API](https://developers.figma.com/docs/plugins/api/figma-variables/) ·
[VariableCollection API](https://developers.figma.com/docs/plugins/api/VariableCollection/) ·
[web code syntax](https://developers.figma.com/docs/plugins/api/properties/Variable-setvariablecodesyntax/) ·
[variable scopes](https://developers.figma.com/docs/plugins/api/VariableScope/) ·
[plugin data](https://developers.figma.com/docs/plugins/api/properties/nodes-setplugindata/)

A plugin UI runs in an iframe and can use browser APIs, then pass structured data
to the plugin sandbox. Figma's own samples include a Variables Import/Export
plugin. This supports a user-selected local JSON manifest without production
network access. Setting `networkAccess.allowedDomains` to `["none"]` explicitly
blocks external network requests; `file:` URLs are not valid network domains.
[Plugin UI](https://developers.figma.com/docs/plugins/creating-ui/) ·
[official plugin samples](https://github.com/figma/plugin-samples) ·
[network access manifest](https://developers.figma.com/docs/plugins/manifest/#networkaccess)

Creating or updating variables does not publish a library. Figma library
publication is available on paid plans and requires a Full seat plus edit access
to the source file; changes remain local until a person publishes them.
[Publish a library](https://help.figma.com/hc/en-us/articles/360025508373-Publish-a-library)

Mode counts are constrained by the file's pricing tier, and the Plugin API can
throw when `addMode` exceeds that limit. Extended collections are Enterprise-only,
but the approved MFD representation does not require them.
[VariableCollection limits](https://developers.figma.com/docs/plugins/api/VariableCollection/)

## Local and account audit facts

These are observations from read-only local commands and authenticated client
status on 2026-09-20. They are not public-platform guarantees.

| Area | Evidence | Status |
| --- | --- | --- |
| Local runtime | `node --version` = 26.7.0, `pnpm --version` = 12.4.2, `npm --version` = 11.19.0 | Does not match the recommended exact project pins; scaffold tooling must select them explicitly. |
| Git repository | The local repository has no commits and `git remote -v` is empty. The owner designated `https://github.com/mflisikowski/design-system`; an authenticated `git ls-remote` succeeds with exit code 0 and no refs, confirming an accessible empty remote. GitHub CLI still has invalid stored tokens for `mflisikowski` and `base-craft-kit`. | Remote owner and name are confirmed as `mflisikowski/design-system`, and read access works through Git credentials. The remote has not been attached locally, nothing has been pushed, and CLI/write authorization remains unverified. |
| npm | `npm whoami` returns `E401`. Public reads for `@mflisikowski/tokens` and `@mflisikowski/lint-config` return `E404`; a public scope search returns no packages. An interactive login was stopped after the owner reported that the account was blocked. | Absence of public packages does not establish account ownership or publishing permission. Scope verification is explicitly deferred until account access is restored; no further login attempts should be made meanwhile. npm grants a scope matching a user or organization name only to that user or organization. [npm scope ownership](https://docs.npmjs.com/about-scopes/) |
| Registry URL | `design-system.mflisikowski.dev` resolves and answers from Vercel, but `/` and `/r/registry.json` currently return `404 DEPLOYMENT_NOT_FOUND`. | The canonical registry endpoint is not live. No deployment or DNS change was attempted. |
| Vercel | Vercel CLI 54.18.5 has no usable credentials and starts device login. The active browser session belongs to the `NEKK` Hobby team; the owner indicated that this is probably a different account from the one intended for MFD Design System. Both planned domains resolve in DNS. | The current session must not be used for this project. Project existence, intended account/team ownership, selected plan, Git integration, checks, and domain assignment remain deferred until the correct account is available. |
| Figma | Figma identity succeeds for Mateusz Flisikowski. Visible memberships include a personal Starter space with View access, NEKK Pro with a Full seat as guest, and an Aptekarska Pro space with View access. The owner designated [DS Components Library (Copy)](https://www.figma.com/design/bbWSEZIAoxjw7BHongnMkB/DS-Components-Library--Copy-?node-id=0-1&p=f) as the working file and explicitly authorized creating elements there; API metadata access to page `0:1` succeeds. | The working file and creation authorization are confirmed. The later two-file `DS Core Library` / `DS Reference CRM` structure and manual library-publishing capability still need to be established at the P4 owner-controlled setup gate. No email address is recorded. |
| `RTK.md` | The global Codex instructions previously included `@RTK.md`; `~/.codex/RTK.md` was absent while a Claude-specific file existed elsewhere. RTK 0.44.2 is installed. | The owner approved removing the stale Codex include. It has been removed while preserving the global commit-message rules. |

Public `E404` responses for the two planned packages are directly reproducible
from the npm registry:
[tokens](https://registry.npmjs.org/%40mflisikowski%2Ftokens) ·
[lint-config](https://registry.npmjs.org/%40mflisikowski%2Flint-config).

## Recommendations

### Exact scaffold pins

Use exact versions, with no `^` or `~`, for the initial scaffold:

| Concern | Recommended exact pin |
| --- | ---: |
| Node.js | `24.21.0` |
| pnpm | `12.5.1` |
| Next.js | `16.3.5` |
| React / React DOM | `19.3.0` / `19.3.0` |
| Tailwind CSS / PostCSS adapter | `4.3.3` / `4.3.3` |
| Base UI | `1.8.0` |
| Turborepo | `2.11.2` |
| Terrazzo CLI / CSS plugin | `2.7.1` / `2.7.1` |
| DTCG report/schema | `2025.10` final URLs |
| Oxlint | `1.83.0` |
| Biome | `2.5.14` |
| shadcn CLI | `4.21.0` |
| @shadcn/lint | `0.1.1` |
| Vitest | `5.0.1` |
| Playwright Test | `1.63.0` |
| MSW | `2.15.0` |
| TanStack Query | `5.103.1` |
| React Hook Form | `7.88.0` |
| Zod | `4.6.5` |
| Sonner | `2.0.8` |
| Lucide React | `1.47.0` |
| Changesets CLI | `3.0.3` |

Record the Node and pnpm pins in the repository's normal version-manager and
`packageManager` fields during ticket 02. The current shell versions should not
be treated as the project contract.

### Intentional lint-spike deviation

The saved spike used pnpm 10.28.2, Oxlint 1.80.0, Tailwind CSS 4.3.3,
@shadcn/lint 0.1.1, and TypeScript 5.9.3. The proposed baseline changes pnpm to
12.5.1 and Oxlint to 1.83.0 while retaining Tailwind CSS 4.3.3 and
@shadcn/lint 0.1.1. Because Oxlint's JavaScript plugin API remains alpha, rerun
the existing valid/invalid diagnostic fixture at the new exact pins before
making it a required CI gate. Keep ESLint as the documented fallback until that
fixture, monorepo package exports, MDX boundaries, and clean registry installs
pass.

### Registry contract correction

Change the configured namespace template from:

```text
https://design-system.mflisikowski.dev/r/{item}.json
```

to:

```text
https://design-system.mflisikowski.dev/r/{name}.json
```

Keep `/r/registry.json` as the catalog and
`/r/v/{version}/{name}.json` as the immutable direct-install form. This is a
tool-contract correction, not a product design choice, and should be recorded in
the decision log before registry implementation.

### Owner-controlled verification still required

The owner should complete these checks without recording secrets:

- after npm account access is restored, authenticate and confirm `npm whoami`
  is the user or organization that owns `@mflisikowski`; confirm publish
  permission for both planned packages;
- use the confirmed private repository `mflisikowski/design-system`; refresh
  GitHub CLI authentication and verify write access before attaching or pushing;
- authenticate Vercel with the intended non-NEKK account, confirm its team and
  plan, create or select the two projects, and confirm Root Directories, Git
  integration, Deployment Checks, Related Projects, and domain ownership;
- use the owner-designated `DS Components Library (Copy)` file for component
  and library work; at the P4 setup gate, verify its paid-library context and
  establish the separate approved `DS Core Library` and `DS Reference CRM`
  files with a Full-seat publisher.

### Release and deployment posture

- Use Git-triggered deployments for the two related previews.
- Prefer Deployment Checks when the authenticated project exposes the required
  checks. Preserve explicit promotion of an already-built deployment as the
  fallback.
- Configure npm Trusted Publishing only after the real GitHub repository and
  workflow filename are final. Use a GitHub-hosted runner and `id-token: write`.
- Do not advertise npm provenance while the source repository is private.
- Keep the Figma importer local and declare `allowedDomains: ["none"]`; retain
  explicit Check, Apply, and separate Prune actions, followed by manual library
  review and publication.

## Contract-impacting findings

1. **Registry placeholder mismatch:** `{item}` in the current specification is
   not the shadcn CLI placeholder. It must become `{name}` before registry work.
2. **Related Projects and CLI deployments:** Related Projects does not support
   CLI-created deployments. The promotion fallback must not accidentally replace
   Git-created paired previews with CLI-created builds.
3. **DTCG draft ambiguity:** only the immutable 2025.10 final reports and schemas
   are authoritative. The current draft resolver is explicitly non-authoritative.
4. **Experimental lint bridge:** @shadcn/lint on Oxlint still depends on an alpha
   JavaScript plugin API. The compatibility fixture and ESLint fallback remain
   necessary.

No other incompatibility was found in the requested package matrix. Node 24.21.0
LTS is the common supported runtime for the published constraints.
