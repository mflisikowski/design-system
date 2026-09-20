# MFD Design System

MFD Design System is a white-label, web-first design system for new applications. It combines:

- a public documentation portal;
- a public shadcn-compatible component registry;
- a versioned, platform-neutral token contract;
- an independent Reference CRM application;
- a Figma library that mirrors the token and component contracts;
- executable rules for humans and coding agents.

The system is React-first and uses Base UI for behavioral primitives. Expo/React Native and Swift are planned as separate native implementations of the same design language, not as wrappers around the web components.

## Status

The project is in discovery and specification. The target directory intentionally contains documentation and a reproducible tooling spike, but no application scaffold yet.

The authoritative documents are:

- [System specification](docs/specification.md)
- [Decision log](docs/decision-log.md)
- [Open decisions](docs/open-decisions.md)
- [shadcn lint research and spike result](docs/research/shadcn-lint.md)

The original Polish discovery summary is preserved as a non-canonical archive in
[docs/archive/2026-09-19-discovery-summary.pl.md](docs/archive/2026-09-19-discovery-summary.pl.md).

## Planned public endpoints

- Documentation and registry: https://design-system.mflisikowski.dev
- Reference CRM: https://crm.design-system.mflisikowski.dev
- Registry item pattern: https://design-system.mflisikowski.dev/r/{item}.json

## Working repository shape

~~~text
apps/
  docs/
  reference-crm/
packages/
  tokens/
  lint-config/
registry/
  ui/
  blocks/
  themes/
registry.json
~~~

The exact scaffold will be created only after the remaining decisions in [docs/open-decisions.md](docs/open-decisions.md) are resolved.
