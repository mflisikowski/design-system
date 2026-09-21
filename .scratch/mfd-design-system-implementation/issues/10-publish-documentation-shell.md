# 10: Publish the documentation shell

**What to build:** Deliver the local documentation experience around the canonical sample, including typed navigation, responsive wayfinding, reusable component-documentation primitives, and structural validation.

**Blocked by:** 08: Prove registry-to-consumer installation.

**Status:** resolved

- [x] All six approved destinations render through the typed content manifest with desktop and mobile navigation.
- [x] Slugs, manifest coverage, links, and heading structure are validated automatically.
- [x] The sample page demonstrates maturity, installation, API usage, accessibility, keyboard behavior, and the live canonical item.
- [x] Search, a command palette, and Storybook are not introduced.

## Comments

### 2026-09-21 — documentation shell completed

- Added local MDX content behind an explicit typed manifest, static App Router routes, desktop sidebar, native `Browse docs` disclosure, Breadcrumb, and local heading navigation.
- Added build-blocking structural validation for malformed or duplicate slugs, slug-to-route mismatches, missing or unlisted content, broken internal routes or fragments, heading hierarchy, and table-of-contents drift.
- Added reusable documentation primitives for maturity, installation and copy controls, code examples, API tables, accessibility notes, keyboard behavior, and canonical live examples.
- Rendered the authored Registry Sample source directly and documented its exact latest and immutable installation commands plus package and registry dependencies.
- Added CI checks that keep the documented installation metadata and API table aligned with the canonical registry source.
- Automated every manifest route and 404, focus-preserving copy behavior, 320 px reflow with no page overflow, and an axe A/AA audit of the sample page.
- Verified the complete workspace with `pnpm verify` (26 successful Turbo tasks), including builds, tests, browser flows, lint, typecheck, tokens, registry installation, and changeset policy.
