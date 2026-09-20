# Decision log

This file records the interview decisions that produced the current specification. The specification remains the authoritative description; this log preserves decision history.

| Questions | Decision |
| --- | --- |
| Q1–Q2 | Build a white-label system with consistent component contracts, registry distribution, and shared accessible tokens. |
| Q3 | Web React first; preserve a path to separate Expo/React Native and Swift implementations. |
| Q4 | Treat shadcn as reference and distribution; use Base UI behavior with MFD-owned APIs, tokens, and composition. |
| Q5–Q6 | Support multiple brands. Split authority between code/tests, tokens, Figma, and registry. |
| Q7 | Target new applications only and provide a Reference project. |
| Q8 | Target WCAG 2.2 AA, keyboard, light/dark, 320px reflow, 200% zoom, reduced motion, long content, and future RTL capability. |
| Q9 | Build by dependency graph and vertical tracer flows, not alphabetically. |
| Q10 | Initial use is controlled and internal: teams building products and client applications. |
| Q11 | Mobile is a documented future direction, not version 1 implementation. |
| Q12 | Brands control visual tokens and limited presets; semantics, interaction, accessibility, anatomy, and product layouts remain fixed. |
| Q13 | Reject inaccessible brand values through automated gates and manual review; do not silently recolor them. |
| Q14 | Direction comes from locale or a content boundary; use logical properties and mirror only directional icons. |
| Q15–Q16 | Use a fictional B2B Reference CRM and two deliberately contrasting brands. |
| Q17 | Core owners approve contracts; product teams propose; local registry edits are forks; additions require proven usage. |
| Q18 | The Reference app is a client-and-project CRM. |
| Q19 | Use hybrid distribution: versioned tokens plus source-code registry components. |
| Q20 | Resolve brand at runtime per tenant before hydration. |
| Q21 | Use reference, semantic, and exceptional component token layers. |
| Q22 | CSS variables are the web contract; Tailwind is an adapter. |
| Q23 | Use Foundations, Primitives, Components, Patterns, and Reference App rather than strict Atomic Design. |
| Q24 | CRM scope covers clients, projects, settings, destructive actions, and all key loading/error/empty states. |
| Q25 | First tracer is Client list → Add client → Validate → Save → Update list → Success. |
| Q26 | Keep brand, color scheme, and density as separate axes. |
| Q27 | Repository token files are canonical; Figma changes become official through review and synchronization. |
| Q28 | Brands may use different fonts while keeping common typography roles. |
| Q29 | Public variants are intentional API choices; interaction states are not free-form variant axes. |
| Q30 | Separate DS Core Library and DS Reference CRM Figma files. |
| Q31 | English is canonical for technical naming and documentation. |
| Q32 | Use complete Atlas and Bloom mini-brands rather than simple color swaps. |
| Q33 | Start with semantic surface, text, border, action, status, overlay, selection, and focus roles. |
| Q34 | Use a 4px spacing base with a justified 2px half step. |
| Q35 | Keep local component size separate from global density. |
| Q36 | Use Lucide behind an MFD Icon contract. |
| Q37 | Add Client uses Dialog on wide screens and a full-screen presentation on narrow screens. |
| Q38 | Controls remain independent; Field composes label, description, error, and accessible relationships. |
| Q39 | Validate on submit, then update corrected fields; use Toast for success and persistent Alert for server errors. |
| Q40 | Component completion requires product usage, Figma, code, states, tests, themes, responsive verification, registry, and docs. |
| Q41 | Support current and previous major evergreen desktop and mobile browsers. |
| Q42 | Documentation, generic registry, and fictional Reference CRM are public. |
| Q43 | The public name is MFD Design System. |
| Q44 | The subdomain is a complete portal with foundations, components, patterns, themes, changelog, Reference link, and registry. |
| Q45 | Reference CRM is an independent consumer application. |
| Q46–Q48 | Use a monorepo with separate apps, token package, modular source registry, and generated public registry output. |
| Q49 | Keep the source repository private. |
| Q50 | Deploy on Vercel; the owner controls DNS. |
| Q51 | Publish 0.1.0 after the first tracer and label maturity explicitly. |
| Q52 | Make @shadcn/lint a required but pinned experimental quality gate. |
| Q53, Q58 | Use Oxlint rather than ESLint after an isolated successful spike; keep Biome for formatting. |
| Q54 | Enforce the policy in consumer applications and executable docs; apply source-appropriate overrides to registry internals. |
| Q55 | Use @mflisikowski as the provisional package and registry namespace. |
| Q56 | Deploy docs/registry and Reference CRM as separate Vercel projects and domains. |
| Q57 | Use MIT for generic public materials; exclude client-specific assets. |
| Q59 | Start core design-system rules as errors, with no-unknown-classes initially a warning. |
| Q60 | Use explicit reliability criteria before falling back from Oxlint to ESLint. |
| Q61 | Permit narrow, justified, reviewable lint exceptions. |
| Q62–Q63 | Give agents actionable lint messages and a small AGENTS.md verification contract. |
| Q64 | Keep canonical policy in a shared lint-config package and expose opt-in setup to consumers. |
| Q65 | Pin and deliberately validate updates to the young linting toolchain. |
| Q66 | Use strict DTCG 2025.10 `*.tokens.json` files as the canonical token format; keep MFD metadata in `$extensions` and do not maintain TypeScript, YAML, or a custom JSON dialect as a parallel source of truth. |
| Q67 | Use the stable DTCG Resolver Module 2025.10 for `brand`, `colorScheme`, and `density`; resolve eight concrete permutations and keep `system` as a runtime light/dark selection rule. |
| Q68 | Use Terrazzo 2.x as the sole version 1 token validation and transformation pipeline, with `tz check` in CI and the CSS plugin for web output; do not include Style Dictionary. |
| Q69 | Organize token sources by reference, semantic, and exceptional component layers, nest brand, color-scheme, and density files under the layer they modify, and generate rather than store the eight resolved permutations. |
| Q70 | Use explicit layer-specific token grammars: `reference` paths name values, public semantic paths name roles without a redundant layer prefix, exceptional component paths name component anatomy, and generated CSS variables use the `--mfd-` prefix. |
| Q71 | Use separate light and dark role-oriented color ramps numbered `1–12`; keep reference steps internal and expose only generated semantic Tailwind utilities, so product code never depends on primitive numbering. |
| Q72 | Author canonical color values as structured DTCG OKLCH within the sRGB gamut, generate and validate the optional hex fallback, and defer a separate Display P3 palette beyond version 1. |
| Q73 | Keep Atlas and Bloom as the final names of the two fictional demonstration brands. |
| Q74 | Give Atlas a restrained cobalt-blue accent around OKLCH hue `255°` and a very low-chroma cool blue-gray neutral around `250°`. |
| Q75 | Give Bloom a warm raspberry/plum accent around OKLCH hue `335°` and a low-chroma sand-gray neutral around `70°`. |
| Q76 | Start with only `danger` and `success` status families and materialize only their required background, border, solid, and text roles; add `warning`, `info`, and extra states only from validated flows. |
| Q77 | Supersede Q74–Q75. Use Atlas Sky with a `225°` accent and `230°` neutral, and Bloom Ultraviolet with a `295°` accent and `285°` neutral. Adopt the reviewed in-gamut light/dark ramps and shared danger/success role values as the version 1 starting contract. |
| Q78 | Synchronize tokens one way from canonical repository sources through a deterministic generated manifest and an MFD-owned local Figma plugin; treat Figma edits as proposals rather than canonical changes. |
| Q79 | Use hidden `MFD Reference Color` and published `MFD Semantic Color` collections with four resolved Atlas/Bloom × light/dark modes, plus an independent `MFD Density` collection with comfortable and compact modes. |
| Q80 | Import a deterministic local manifest from `packages/tokens/dist/figma/variables.json` through the plugin UI; the production plugin does not fetch token data from the network. |
| Q81 | Require a read-only `Check` diff before explicit `Apply`; let repository values win managed conflicts, identify tokens by canonical path, and reserve deletion of stale managed variables for a separate confirmed `Prune` operation. |
| Q82 | Never publish the Figma library automatically. Require owner review of the diff and representative components before manually publishing DS Core Library. |
| Q83 | Use shared typography roles and metrics with brand-specific families: Geist Sans/Mono for Atlas; DM Sans, display-only Lora, and Geist Mono for Bloom; self-host variable WOFF2 files with Latin Extended support and weights 400/500/600. |
| Q84 | Use brand-specific radius scales and shadow character with shared semantic elevation levels, motion durations, standard easing, press feedback, reduced-motion handling, and concentric-radius rules. |
| Q85 | Define coordinated Comfortable and Compact dimension maps without changing typography, semantics, anatomy, or behavior; preserve a minimum effective 44px touch target. |
| Q86 | Give Button accent, neutral, outline, ghost, and danger variants plus small, medium, and large sizes; keep submit behavior explicit, model loading accessibly, keep links semantic, and use a separate IconButton contract for icon-only actions. |
| Q87 | Use a compositional Field API with dedicated Input and Textarea controls; let Field own identifiers, invalid state, and accessible relationships without coupling controls to form or validation libraries. |
| Q88 | Use a compositional modal Dialog with small, medium, and large widths, automatic full-screen presentation below 640px, internally scrolling body content, visible close affordance, focus management, and interceptable close requests for unsaved changes. |
| Q89 | Use React Hook Form and Zod in Reference CRM with submit-first validation, change-based revalidation after submit, focus on the first invalid field, and mapped server errors; keep registry controls library-agnostic. |
| Q90 | Use persistent danger/success Alert content for messages requiring attention and polite, dismissible, four-second success Toasts for brief acknowledgements; queue beyond three visible Toasts and hide Sonner behind the MFD adapter. |
| Q91 | Use a single compositional Empty State with a required title, optional decorative icon, description, and up to two actions; keep no-data, no-results, and failure states semantically distinct. |
| Q92 | Define Client as a customer organization distinct from Contact, User, and Tenant; use organization and primary-contact fields plus optional phone and notes in the first tracer. |
| Q93 | Use an HTTP-shaped ClientRepository backed by browser MSW handlers and localStorage demo persistence, with deterministic reset, latency and error simulation, reusable test handlers, and no real version 1 backend. |
| Q94 | Wrap an approved Lucide map in the MFD Icon contract with 16/20/24px sizes, stroke width 2, decorative-by-default semantics, explicit accessible naming rules, and RTL mirroring only for directional icons. |
| Q95 | Expose native semantic Table primitives in the registry while keeping ClientTable product-specific; use a four-column desktop table that omits Added below 640px and reflows at 320px without switching to duplicate card markup. |
| Q96 | Use TanStack Query v5 inside Reference CRM for client queries and mutations; avoid optimistic creation, retain data during refetch, and update then revalidate the cache before closing the dialog and showing success feedback. |
| Q97 | Close an unchanged Add Client form immediately, but confirm every dismissal of a dirty form through a nested Alert Dialog; block dismissal while submitting, bypass confirmation after success, and keep dirty-state ownership in the application. |
| Q98 | Make the eleven approved loading, dialog, validation, dismissal, API-error, server-error, success, reset, responsive, and cross-theme scenarios the Definition of Done for the Add Client tracer. |
| Q99 | Demonstrate session-aware routing with a transparent fixed demo identity and short-lived server-set cookie, without fake credential fields, an auth provider, or any claim of production security. |
| Q100 | Define Project as a unit of work belonging to exactly one Client, with name, description, planned/active/on-hold/completed status, optional date range, timestamps, and no tasks, billing, members, files, or separate project contact in version 1. |
| Q101 | Make Client details → View projects → Add project → Save → Change status the second tracer, introducing navigation, project-list, Select, and Status Badge contracts while deferring dates, editing, and destructive flows. |
| Q102 | Define planned, active, on-hold, and completed Project states with unrestricted reversible transitions in version 1; persist status changes before updating the UI, map them to neutral/accent/warning/success tones, and add warning as the next justified semantic status family. |
| Q103 | Expose a compositional single-value Select with small/medium/large sizing, form integration, contextual labeling, primitive values, and loading state; defer multiple, object, async, and filterable selection to future contracts. |
| Q104 | Keep Badge domain-independent and non-interactive with neutral/accent/warning/success/danger tones, small/medium sizes, one subtle pill treatment, visible text, and optional decorative icon. |
| Q105 | Add the measured in-gamut warning roles at hue 85 for light and dark schemes, materializing only background, border, solid, and text with verified text, boundary, and on-solid contrast. |
| Q106 | Define semantic inline and standalone Link treatments, an accessible ordered-list Breadcrumb with a non-linked current page, and a structural Page Header with one h1 and one primary action. |
| Q107 | Keep ProjectTable application-owned with Project, Status, and Updated columns, newest-update ordering, contextual Select triggers containing visual Badges, responsive omission of Updated, and no premature action or detail affordances. |
| Q108 | Make the ten approved navigation, independent-loading, empty, project-form, validation, create-error, create-success, status-change, accessibility, and cross-theme scenarios the Definition of Done for the second tracer. |
| Q109 | Make Appearance settings the third tracer, independently switching and persisting demo brand, color-scheme preference, and density before hydration while keeping brand switching explicitly demo-only. |
| Q110 | Represent the three runtime theme axes as validated `html` data attributes backed by independently validated cookies; resolve them before hydration, keep System as a media-query-driven preference, and update attributes without remounting the application. |
| Q111 | Expose a compositional single-value Radio Group with Base UI keyboard behavior and contextual Fieldset labeling; keep the conventional radio as the base presentation and provide RadioCard as a separate rich-option composition. |
| Q112 | Make Theme Preview a responsive, non-interactive token-rendered sample with an adjacent textual summary; do not introduce an iframe, screenshot, false interactive controls, or an independent theme runtime. |
| Q113 | Make the ten approved first-render, fallback, axis-change, System, density, keyboard, persistence, failure, reset, and cross-context scenarios the Definition of Done for the third tracer. |
| Q114 | Put Appearance directly inside the shared authenticated App Shell under Settings, use one readable column of three Fieldsets, and defer local settings navigation until a second settings destination exists. |
| Q115 | Apply individual theme changes optimistically while serializing each affected axis, roll back only failed axes with a retryable Alert, and persist Reset as one operation that temporarily makes the complete form read-only and busy. |
| Q116 | Use a skip link and responsive visible header navigation for the two version 1 destinations; stack it below 640px and do not introduce a sidebar, hamburger, Drawer, or hidden mobile navigation. |
| Q117 | Keep App Shell and active-navigation composition application-owned; publish only the validated generic primitives until another product demonstrates a reusable shell contract. |
| Q118 | Make Client search the fourth tracer, introducing Search Field, URL-owned query state, asynchronous list refresh, and No results while deferring filters until the Client domain has a justified filter dimension. |
| Q119 | Search organization name, contact name, and contact email with normalized matching, a replace-updated `q` parameter, 300ms debounce plus immediate Enter and clear behavior, retained results during refresh, and persistent retryable failure feedback. |
| Q120 | Publish a native-search-based Search Field composed with Field, with controlled and uncontrolled value, explicit submit and clear events, predictable clear affordance, Escape clearing, and no debounce, routing, fetching, filtering, or Combobox behavior. |
| Q121 | Make the ten approved URL initialization, normalization, debounce, stale-response, clearing, refresh, no-results, failure, accessibility, and cross-context scenarios the Definition of Done for the fourth tracer. |
| Q122 | Make Client details → Edit client → Validate → Save → Updated details and list the fifth tracer, reusing the approved responsive Dialog and form behavior. |
| Q123 | Keep ClientForm application-owned with explicit create and edit modes, protect dirty edits from background refetch, disable unchanged submission, persist non-optimistically, update both caches on success, and defer autosave, conflict detection, and history. |
| Q124 | Make the ten approved initialization, unchanged-state, restored-value, refetch, validation, dismissal, failure, pending, success, and cross-context scenarios the Definition of Done for Client editing. |
| Q125 | Never cascade Client deletion to Projects; block deletion while Projects remain, then require an explicit destructive Alert Dialog for an empty Client while deferring soft delete, archival, typed confirmation, and undo. |
| Q126 | Make blocked Client deletion → Delete Project → Delete empty Client the sixth tracer, add a direct contextual delete IconButton rather than a one-item Menu, and define logical focus fallbacks after removed triggers. |
| Q127 | Publish a compositional Alert Dialog with required title and description, safe initial focus for destructive uses, Escape-as-cancel but no backdrop dismissal, explicit action styling, pending protection, inline failure, and explicit fallback focus when its trigger disappears. |
| Q128 | Give Project and Client deletion typed repository outcomes, atomically enforce the no-cascade dependency guard, treat stale NOT_FOUND separately from retryable infrastructure failure, avoid optimistic deletion, and update then revalidate exact caches. |
| Q129 | Make the ten approved dependency-guard, confirmation, dismissal, pending, failure, stale-data, Project-success, renewed-conflict, Client-success, and cross-context scenarios the Definition of Done for the sixth tracer. |
| Q130 | Add reversible `active | inactive` Client relationship status, default new Clients to active, keep it independent from Project status and other behavior, map it to success or neutral Badge, and defer lead, archive, scoring, and history concepts. |
| Q131 | Make relationship-status filtering combined with search the seventh tracer, with canonical URL parameters, AND semantics, immediate status requests, an application-owned Filter Bar, and no facet counts, multi-select, saved filters, or generic builder. |
| Q132 | Change Client Relationship Status through a contextual non-optimistic Select on Client details rather than ClientForm, with no-op current selection, isolated pending state, cache revalidation, persistent failure feedback, and no confirmation. |
| Q133 | Show and politely announce settled result counts, tailor no-results copy and clearing action to the active query and status criteria, clear both parameters atomically, and defer pagination. |
| Q134 | Make the ten approved status-mutation, URL restoration, invalid-value, request-order, AND-semantics, count, no-results, clearing, accessibility, and cross-context scenarios the Definition of Done for the seventh tracer. |
| Q135 | Preserve 0.1.0 after the first tracer, target 0.2.0 through 0.5.0 for the approved subsequent tracer groups, and reserve 1.0.0 for stable APIs, complete quality gates, and validation by a second real consumer; functional `version 1` does not mean semver 1.0.0. |
| Q136 | Publish generated tokens and lint policy as public npm packages, distribute editable UI, blocks, themes, and setup through the public registry, keep React components out of a parallel opaque npm package, and retain canonical source privately. |
| Q137 | Point the namespace at latest stable items, publish immutable versioned registry snapshots, record item versions, pin matching MFD packages exactly before 1.0.0, and defer prerelease channels. |
| Q138 | Deploy docs and Reference CRM as separate Vercel projects with app-specific roots, shared workspace access, Turborepo-scoped builds, skipped unaffected deployments, separate origins, and no CRM rewrite through the portal. |
| Q139 | Link canonical production domains directly, resolve same-revision preview links through Vercel Related Projects with production fallback, keep navigation in the same tab, and share neither session nor runtime state between applications. |
| Q140 | Use path-aware Changesets for public release intent and changelogs, maintain one reviewed Release PR, publish only after all gates and manual merge, and create coordinated tags and GitHub Releases without deriving versions from commit syntax. |
| Q141 | Keep tokens, lint-config, and private registry-release metadata in one fixed version group and publish npm through OIDC Trusted Publishing; make no provenance claim while the source repository remains private. |
| Q142 | Gate releases through build, package inspection, clean snapshot installation, OIDC npm publication, public-resolution verification, repeated consumer installation, and only then coordinated Vercel, latest-alias, tag, and GitHub Release promotion. |
| Q143 | Roll back deployments, latest registry alias, and npm dist-tag without overwriting immutable artifacts; deprecate the faulty packages, annotate history, and ship corrections under a new patch version, reserving removal for a separate security process. |
| Q144 | Split tests between Node Vitest for pure logic, Vitest Browser Mode with Playwright for real-browser component behavior, and Playwright Test for full flows; run Chromium on PRs, all engines for releases, axe on approved states, and retain required manual accessibility work. |
| Q145 | Use committed Playwright Chromium baselines in a pinned Linux environment, a representative two-theme PR matrix and full eight-context release matrix, deterministic rendering inputs, reviewed in-PR updates, no automatic regeneration, and no masking global tolerance. |
| Q146 | Author the portal in local MDX with Server Components and small client islands, document complete hand-written behavioral contracts with type-checked simple prop tables, render canonical implementations, and avoid a parallel Storybook or demo copies. |
| Q147 | Let docs render authoring source, but make Reference CRM consume committed shadcn-installed copies through an explicit sync command, clean-install and drift checks, no private registry imports, and no local primitive customization. |
| Q148 | Keep the portal on the latest stable contract with maturity, introduced-version, deprecation, changelog, and historical snapshot guidance; add parallel versioned docs only when two major versions need simultaneous support. |
| Q149 | Drive portal navigation from a typed manifest across six primary destinations, with desktop sidebar, local table of contents, Breadcrumbs, a native mobile disclosure, structural build validation, and deferred search until scale or evidence justifies it. |
| Q150 | Give planned, experimental, stable, and deprecated explicit operational definitions, assign exactly one reviewed maturity per item, clarify pre-1.0 stability, and require changelog entries for every transition. |
| Q151 | Lead with namespace-based latest installation, offer immutable snapshot installation, disclose dependencies, make copy and code blocks accessible, separate new and existing project guidance, and execute every published command in clean-install CI. |
| Q152 | Freeze Q1–Q151 as the approved baseline through 0.5.0, require explicit follow-up decisions for contradictory requirements, permit only non-contractual implementation detail, and reclassify remaining items as execution prerequisites. |
| Q153 | Create and review `docs/implementation-plan.md` as the next artifact, covering prerequisites through releases 0.1.0–0.5.0, without beginning scaffold or implementation work in the discovery task. |
