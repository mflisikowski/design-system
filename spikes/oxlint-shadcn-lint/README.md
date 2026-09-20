# Throwaway Oxlint + @shadcn/lint spike

This spike answers one question:

> Can Oxlint load @shadcn/lint, discover an MFD-style Button and Tailwind v4 theme, reject owned-style overrides, and allow consumer layout classes?

It is evidence, not production architecture.

## Run

~~~sh
pnpm install
pnpm lint:valid
pnpm lint:invalid
~~~

Expected:

- lint:valid exits successfully;
- lint:invalid exits non-zero with no-restyle, no-raw-colors, and no-arbitrary-values diagnostics.

See ../../docs/research/shadcn-lint.md for the recorded result and limitations.
