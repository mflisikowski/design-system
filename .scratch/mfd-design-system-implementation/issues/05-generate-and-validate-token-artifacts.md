# 05: Generate and validate token artifacts

**What to build:** Turn canonical tokens into deterministic runtime, Tailwind-facing, programmatic, and Figma artifacts while rejecting invalid aliases, names, types, colors, and incomplete permutations.

**Blocked by:** 04: Define canonical token sources and resolver.

**Status:** ready-for-agent

- [ ] Token validation and generation succeed for all eight Atlas/Bloom, light/dark, and comfortable/compact contexts.
- [ ] Generated hex fallbacks match canonical OKLCH values and all emitted colors remain inside the approved gamut.
- [ ] Semantic utilities are property-appropriate and component usage of primitive colors fails validation.
- [ ] Rebuilding produces no diff and the Figma manifest has stable schema, hash, identity, and ordering.
