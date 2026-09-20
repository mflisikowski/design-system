# 01: Verify execution prerequisites

**What to build:** Produce a current, reviewable evidence record for the external names, access, ownership, platform capabilities, and exact dependency versions required to begin implementation without changing external systems.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Package scope, registry namespace, repository naming, Vercel capabilities, domains, and Figma access are verified where available; account-dependent checks are recorded as explicit owner follow-ups with no secrets captured.
- [x] Current stable tool and library versions are checked against primary sources and proposed as exact pins, including any intentional lint-spike deviations.
- [x] The missing `RTK.md` instruction reference is restored or deliberately removed.
- [x] Contract-impacting incompatibilities are returned to the decision log before implementation proceeds.

## Comments

### 2026-09-20 — prerequisite research

Primary-source evidence and proposed exact pins are recorded in `docs/research/2026-09-20-execution-prerequisites.md`.

The shadcn namespace URL placeholder was corrected from `{item}` to `{name}` in the specification and recorded as decision Q154.

Owner input is still required to authenticate and confirm npm, GitHub, and Vercel ownership.

### 2026-09-20 — Figma target confirmed

The owner designated `DS Components Library (Copy)` (`bbWSEZIAoxjw7BHongnMkB`) as the working Figma file and authorized creating elements there. Read-only metadata access to page `0:1` succeeds. The separate `DS Core Library` and `DS Reference CRM` files and manual publishing role remain part of the later P4 owner-controlled setup.

### 2026-09-20 — stale RTK include removed

The owner approved removing the unresolved global Codex `@RTK.md` include. The include was deleted while all global commit-message rules were preserved.

### 2026-09-20 — GitHub repository confirmed

The owner designated `https://github.com/mflisikowski/design-system`. An authenticated read-only `git ls-remote` succeeds with no refs, confirming access to an empty remote. The remote was not attached locally and nothing was pushed. GitHub CLI authentication and write permission still require verification.

### 2026-09-20 — npm verification deferred

The interactive npm login was cancelled after the owner reported that the account was blocked. Scope ownership and publish permission remain unverified and are deferred until account access is restored. No further npm login attempts should be made meanwhile.

### 2026-09-20 — Vercel verification deferred

The active browser session belongs to the `NEKK` Hobby team. The owner indicated that it is probably not the intended MFD Design System account, so no project, deployment, or domain action was taken. Verification is deferred until the intended Vercel account is available.

### 2026-09-20 — owner-approved closeout

The owner approved closing this prerequisite ticket with npm publishing access and the intended Vercel account recorded as deferred owner actions. These checks remain prerequisites for their respective publishing and deployment tickets, but do not block local workspace implementation.
