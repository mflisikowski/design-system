# @mflisikowski/lint-config

Shared Oxlint policy for MFD-authored applications and registry source.

Extend `@mflisikowski/lint-config/oxlint` from the repository Oxlint configuration. The policy
enforces semantic tokens and static, token-backed classes in application code. Application code
may control layout around a component, while registry source owns the component's internal visual
contract.

Registry source disables only `shadcn/no-restyle`. Raw colors, arbitrary values, inline styles,
static-class analysis, and unknown-class diagnostics remain active there.

## Exceptions

Use an exception only on the next statement, name exactly one rule, and explain the necessity:

```tsx
// oxlint-disable-next-line shadcn/no-inline-styles -- MFD exception: Runtime token values drive this visual fixture.
<Preview style={runtimeStyle} />
```

`mfd-lint-exceptions` rejects broader or unexplained suppressions. It also compares every accepted
exception with `.mfd-lint-exceptions.json`, so exception growth requires an explicit reviewed
baseline change.

The policy remains on Oxlint. The fallback conditions in the project specification are evaluated
by automated compatibility tests; an ESLint dependency or configuration must not be added unless
one of those conditions is demonstrated.
