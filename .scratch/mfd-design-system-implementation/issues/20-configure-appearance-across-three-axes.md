# 20: Configure Appearance across three axes

**What to build:** Let a User view and change brand, color scheme, and density independently through Appearance settings while the server and document root preserve the correct state before hydration.

**Blocked by:** 19: Qualify and release 0.2.0.

**Status:** ready-for-agent

- [ ] Missing or invalid cookies fall back independently and valid preferences produce correct root attributes before hydration.
- [ ] Theme Provider updates each axis synchronously without remounting the application or losing focus.
- [ ] Radio Group, RadioCard, and Theme Preview expose the approved semantics, responsive behavior, and effective touch targets.
- [ ] Public Radio Group work includes registry, docs, Figma, behavioral, accessibility, and clean-install coverage.
