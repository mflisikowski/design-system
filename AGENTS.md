# MFD Design System agent guide

Read [docs/specification.md](docs/specification.md) before proposing architecture, components, tokens, Figma structures, registry items, or Reference CRM work.

Read [docs/open-decisions.md](docs/open-decisions.md) when work touches an unsettled area. Treat proposals there as unresolved until the user approves them.

When publishing or retrieving local specifications and tickets, read [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md). When exploring domain boundaries, follow [docs/agents/domain.md](docs/agents/domain.md).

## Source-of-truth boundaries

- Code and behavioral tests own runtime behavior, API, keyboard interaction, and accessibility semantics.
- Versioned token files own visual values.
- Figma represents and explores approved contracts; it is not the runtime source of truth.
- The shadcn registry distributes source code; it is not the canonical authoring location.

## Working rules

- Build components from validated Reference CRM flows, not alphabetically.
- Use Base UI behavior as a foundation, while keeping MFD-owned public APIs, tokens, and composition.
- Components consume semantic tokens. Primitive color values never appear directly in component usage.
- Preserve the independent axes of brand, color scheme, and density.
- Keep client-specific themes, fonts, logos, and assets outside the public registry.
- Generated registry JSON is build output and is never edited manually.
- A Figma result is an accessibility-ready specification until runtime keyboard, screen-reader, zoom, and contrast checks pass.
- Record intentional design-system lint exceptions with an inline reason and the smallest possible scope.

## Verification

Once the workspace scripts exist, UI changes must run the project lint command, affected tests, registry installation validation, and token validation where relevant. Visual acceptance remains separate from automated checks.
