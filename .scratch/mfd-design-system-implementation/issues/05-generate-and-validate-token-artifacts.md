# 05: Generate and validate token artifacts

**What to build:** Turn canonical tokens into deterministic runtime, Tailwind-facing, programmatic, and Figma artifacts while rejecting invalid aliases, names, types, colors, and incomplete permutations.

**Blocked by:** 04: Define canonical token sources and resolver.

**Status:** resolved

- [x] Token validation and generation succeed for all eight Atlas/Bloom, light/dark, and comfortable/compact contexts.
- [x] Generated hex fallbacks match canonical OKLCH values and all emitted colors remain inside the approved gamut.
- [x] Semantic utilities are property-appropriate and component usage of primitive colors fails validation.
- [x] Rebuilding produces no diff and the Figma manifest has stable schema, hash, identity, and ordering.

## Comments

### 2026-09-21 — deterministic token artifacts completed

- Added Terrazzo CSS and typed JavaScript generation for every resolver permutation, with the public `--mfd-` custom-property prefix.
- Added deterministic runtime JSON with generated sRGB hex fallbacks, build-time OKLCH and gamut validation, property-specific Tailwind v4 utilities, and a canonical-path Figma variables manifest.
- Added component-source validation that rejects reference variables, default palette utilities, and literal colors while allowing semantic utilities.
- Added integration coverage for the artifact contract, exact warning fallbacks, typed resolver, Figma identity and aliases, invalid usage, and byte-for-byte rebuild stability.
