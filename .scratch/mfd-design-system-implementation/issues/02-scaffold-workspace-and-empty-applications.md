# 02: Scaffold the workspace and empty applications

**What to build:** Establish a reproducible pnpm and Turborepo workspace in which the empty Docs and Reference CRM applications build successfully and future packages have clear ownership boundaries.

**Blocked by:** 01: Verify execution prerequisites.

**Status:** resolved

- [x] A fresh install from the pinned lockfile succeeds and both empty applications build.
- [x] Shared TypeScript, task graph, dependency, and environment declarations are deterministic.
- [x] Generated output is clearly separated from authored source.

## Comments

### 2026-09-20 — workspace scaffold completed

Created a pnpm 12.5.1 and Turborepo 2.11.2 workspace with an automatically provisioned Node 24.21.0 runtime, an exact-version dependency catalog, a shared strict TypeScript 7 configuration, and package-owned tasks. Added minimal Next.js 16.3.5 App Router applications for Docs and Reference CRM.

Verified `corepack pnpm install --frozen-lockfile`, `corepack pnpm typecheck`, and `corepack pnpm build`. Both applications compile and prerender successfully. Next.js output, Turbo caches, dependency trees, TypeScript build information, environment files, and Vercel metadata are excluded from authored source through `.gitignore`.
