# @shadcn/lint research and Oxlint spike

**Researched:** 2026-09-19  
**Decision:** Adopt through Oxlint as a pinned, experimental quality gate.

## Primary-source findings

@shadcn/lint is an agent-first linter for Tailwind design systems. It does not require shadcn/ui, but it currently targets Tailwind v4. It can run through ESLint or Oxlint.

Supported policy categories include:

- preventing consumer restyling of owned component concerns;
- rejecting raw palette colors;
- rejecting arbitrary values;
- rejecting inline styles;
- detecting unknown Tailwind classes;
- requiring statically analyzable classes.

It can discover components and theme paths through components.json, read variants, follow aliases and package exports, and provide component-specific remediation messages. It also understands Base UI render composition when className is forwarded to a rendered design-system component.

Important limitations:

- analysis is static and does not run the application;
- ordinary CSS declarations and @apply are outside its coverage;
- parent selectors are not traced to child component contracts;
- some imported or dynamic values are not fully followed;
- newly declared tokens are allowed and still require semantic review;
- disable comments can bypass policy;
- Oxlint integration currently relies on its alpha JavaScript plugin API.

Primary sources:

- https://github.com/shadcn-ui/lint
- https://github.com/shadcn-ui/lint/blob/main/docs/how-it-works.md
- https://github.com/shadcn-ui/lint/blob/main/docs/adoption.md
- https://github.com/shadcn-ui/lint/blob/main/docs/design-systems.md
- https://raw.githubusercontent.com/shadcn-ui/lint/main/packages/lint/package.json

## Reproducible spike

The saved spike is in ../../spikes/oxlint-shadcn-lint.

Versions used:

- @shadcn/lint 0.1.1
- Oxlint 1.80.0
- Tailwind CSS 4.3.3
- TypeScript 5.9.3
- pnpm 10.28.2

The intentionally invalid usage:

~~~tsx
<Button className="bg-pink-500 p-[13px] hover:rounded-full">
  Save
</Button>
~~~

produced five expected diagnostics:

1. Button owns its color.
2. Button owns its spacing.
3. Button owns its shape.
4. pink-500 is a raw palette color.
5. 13px is an off-token arbitrary value.

The corrected usage:

~~~tsx
<Button size="lg" className="mt-4 w-full">
  Save
</Button>
~~~

passed. This verifies plugin loading, component discovery through the configured alias, variant discovery, theme discovery, actionable messages, and allowed layout classes.

The spike does not yet verify:

- real monorepo package exports;
- MDX boundaries;
- multiple applications and themes;
- CI caching;
- performance at repository scale;
- Vercel builds.
