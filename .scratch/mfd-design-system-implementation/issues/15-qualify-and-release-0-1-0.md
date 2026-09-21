# 15: Qualify and release 0.1.0

**What to build:** Qualify the complete Add Client milestone as the first immutable public release and promote it only after runtime, design, installation, accessibility, and publication evidence agrees.

**Blocked by:** 14: Protect and recover Add Client interactions.

**Status:** ready-for-agent

- [ ] All automated quality commands, cross-theme tracer checks, and new/existing clean-consumer installations pass against the immutable snapshot.
- [ ] Required manual keyboard, screen-reader, zoom, reflow, touch, contrast, long-content, RTL, reduced-motion, visual, and Figma reviews are recorded.
- [ ] Package names, publishing identity, Vercel targets, domains, Figma publication, and release permissions are owner-confirmed.
- [ ] Build, publish, public verification, consumer reinstall, and deployment promotion complete in the approved order.

## Comments

- 2026-09-21: Prepared the coordinated `0.1.0` package metadata, changelogs, docs release notes, immutable `registry/snapshots/v/0.1.0/` artifacts, and removed the stale mutable `v/0.0.0` public snapshot. The release-readiness record is in `docs/releases/0.1.0-readiness.md`.
- 2026-09-21: `corepack pnpm registry:check` passed, including deterministic registry output, boundary checks, packs, and clean/existing consumer installation. `corepack pnpm --filter @mflisikowski/docs docs:check` and production docs build passed. `CHANGESET_RELEASE_PR=true corepack pnpm verify:release` passed format, lint, typecheck, build, tests, tokens, registry, and changeset policy; its browser matrix remains environment-blocked by Firefox Nightly profile startup and WebKit `clipboard-write` permission support. Chromium docs and CRM browser coverage passed.
- 2026-09-21: Publication, public verification, consumer reinstall against the deployed URL, deployment promotion, Figma publication, owner permission confirmation, and the required manual keyboard/screen-reader/zoom/reflow/touch/contrast/long-content/RTL/reduced-motion/visual reviews remain owner-controlled release steps and are not claimed locally.
