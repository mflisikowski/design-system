# 07: Establish browser and flow test harnesses

**What to build:** Provide deterministic unit, browser-component, end-to-end, accessibility, visual-regression, and manual verification harnesses that later tracer slices can use without inventing infrastructure per component.

**Blocked by:** 03: Establish local and CI quality gates.

**Status:** ready-for-agent

- [ ] Node tests, browser component tests, end-to-end tests, MSW fixtures, and axe checks run through the shared quality workflow.
- [ ] Pull requests use Chromium while release verification supports Chromium, Firefox, and WebKit.
- [ ] Linux Chromium screenshot baselines are deterministic and cannot be silently updated or globally masked.
- [ ] Manual verification templates cover screen readers, zoom, touch, contrast, RTL, long content, and reduced motion.
