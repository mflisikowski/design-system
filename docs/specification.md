# MFD Design System specification

**Status:** Discovery approved; implementation not started  
**Version:** 0.1-draft  
**Last updated:** 2026-09-19  
**Owner:** Mateusz Flisikowski

## 1. Objective

Build a reusable white-label design system for controlled internal use across new applications. The system must:

- provide consistent component contracts;
- distribute editable React source through a shadcn-compatible registry;
- share accessible, platform-neutral design tokens;
- support multiple brands selected at runtime per tenant;
- demonstrate correct usage through a realistic Reference CRM;
- make important design-system rules executable for developers and coding agents.

The current Figma file is prior exploration, not a source of truth. A new library may be created from scratch after the foundations and contracts are approved.

## 2. Scope and consumers

### 2.1 Initial consumers

The initial consumers are controlled internal teams:

- a team building applications for clients;
- internal developers building multiple products and brands.

External client developers and no-code brand administration are not initial requirements.

### 2.2 Platform boundary

Version 1 is web-first:

- React;
- TypeScript;
- Tailwind CSS v4;
- Base UI behavioral primitives;
- Next.js applications.

Expo/React Native and Swift remain planned future platforms. They will implement the same token vocabulary and behavioral intent with platform-native code. Identical component APIs or a generated universal component codebase are not goals.

### 2.3 Adoption

The design system targets new applications only. Existing applications are not migrated in version 1.

## 3. Core principles

### 3.1 Ownership

MFD Design System owns:

- public component APIs;
- semantic tokens;
- composition rules;
- accessibility contracts;
- registry items;
- documentation and examples.

shadcn/ui is a reference and distribution ecosystem. Base UI supplies web behavior primitives where appropriate. Neither project defines the MFD public contract.

### 3.2 Source-of-truth split

| Concern | Authority |
| --- | --- |
| Behavior, component API, keyboard interaction, runtime accessibility | Code and tests |
| Visual values | Versioned token files |
| Design representation and exploration | Figma |
| Source-code distribution | shadcn registry |
| Usage education | Documentation and Reference CRM |

### 3.3 Delivery order

The component catalogue is not built alphabetically and does not start by completing a theoretical list of atoms. Work proceeds through vertical tracer flows in the Reference CRM. Foundations and primitives are extracted when a real flow needs them.

## 4. System taxonomy

The system uses:

- **Foundations:** color, typography, spacing, sizing, radius, elevation, motion, iconography, direction, and responsive rules.
- **Primitives:** basic behavioral and layout contracts.
- **Components:** complete reusable interface elements.
- **Patterns:** compositions that solve recurring product tasks.
- **Reference application:** validated product flows showing the system in context.

Strict Atomic Design terminology is not the organizing model.

## 5. White-label theming

### 5.1 Independent axes

Three axes remain independent:

- **brand:** resolved from the current tenant;
- **color scheme:** light, dark, or system preference;
- **density:** comfortable or compact.

A brand does not imply a color scheme or density.

### 5.2 Runtime selection

The runtime may host different brands for different tenants. The brand must be resolved and applied before the interface hydrates to avoid displaying an incorrect theme.

The root `html` element carries three independent, typed attributes:

- `data-brand="atlas" | "bloom"`;
- `data-color-scheme="system" | "light" | "dark"`;
- `data-density="comfortable" | "compact"`.

Reference CRM persists the corresponding preferences in `mfd-demo-brand`, `mfd-color-scheme`, and `mfd-density` cookies. The root server layout reads and validates them before rendering and falls back independently to Atlas, System, and Comfortable for missing or invalid values. These demo preferences are not the future production tenant-resolution contract.

Explicit light and dark preferences select their semantic token mappings directly. System remains an unresolved preference on the root and selects the appropriate mapping through `prefers-color-scheme`, so operating-system changes take effect without rewriting the stored value or requiring client JavaScript. The document declares support for both schemes early and applies the matching CSS `color-scheme` value so browser-provided controls participate in the selected scheme.

Theme Provider exposes typed application state and updates the three root attributes synchronously without remounting the application. It then persists changes through the server-owned cookie boundary. React context is a consumption convenience, not the canonical DOM theme state. Theme changes suppress broad decorative transitions, preserve focus, respect reduced motion, and never animate every token-dependent property across the page.

Each axis change is optimistic and immediate. While its preference is being persisted, only that Radio Group becomes read-only and busy while retaining focus; the other axes remain available. Reset is unavailable while any individual save is pending. A successful individual save produces no Toast. A failed save rolls back only that axis to its last confirmed value and exposes a persistent retryable Alert that retains the failed value as its retry target.

Reset persists all three default values as one application operation. While it is pending, the complete Appearance form is read-only and busy so reset cannot race an individual save. Failure leaves or restores the last confirmed preference tuple and uses the same persistent recovery surface.

### 5.3 Brand-controlled properties

Brands may control:

- color values;
- font families and supported weights;
- radius scale;
- elevation and shadow character;
- logo and brand assets;
- limited motion values;
- approved size or density presets.

Brands may not change:

- semantic meaning;
- accessibility requirements;
- keyboard behavior;
- component anatomy;
- core interaction contracts;
- product-specific screen layout through theme tokens.

### 5.4 Test brands

Version 1 uses two deliberately contrasting, complete fictional brands:

- **Atlas:** technical, precise, cool, geometric, and restrained. Its Sky direction pairs a clear blue accent around OKLCH hue `225°` with a very low-chroma cool blue-gray neutral around `230°`.
- **Bloom:** friendly, soft, expressive, and contemporary. Its Ultraviolet direction pairs a violet accent around OKLCH hue `295°` with a very low-chroma violet-gray neutral around `285°`.

Atlas and Bloom are the final names of the fictional demonstration brands. Their version 1 color ramps, typography, radii, elevation character, and motion values are approved below.

## 6. Token architecture

### 6.1 Canonical location

Strict DTCG 2025.10 files using the `*.tokens.json` extension in the repository are the versioned source of truth. Source files use the standard DTCG properties, including `$value`, `$type`, `$description`, groups, and aliases. MFD-specific metadata is stored only in `$extensions`. TypeScript, YAML, and custom JSON dialects are not parallel canonical formats.

Figma may initiate exploration, but a value becomes official only after synchronization, review, and merge into the repository.

The stable DTCG Resolver Module 2025.10 composes token sets and models the independent `brand`, `colorScheme`, and `density` modifiers. MFD does not maintain a parallel custom resolver manifest. The resolver produces the eight concrete Atlas/Bloom × light/dark × comfortable/compact permutations. `system` remains a runtime rule that selects light or dark and is not a separate token-value context.

#### Validation and transformation

Terrazzo 2.x is the only token validation and transformation pipeline in version 1. `@terrazzo/cli` owns Resolver parsing, validation, linting, and build orchestration; `@terrazzo/plugin-css` generates the CSS custom properties. `tz check` is a required CI gate, and source documents reference the official DTCG schemas through `$schema` for editor feedback. Exact package versions are pinned at scaffold time. Style Dictionary is not part of the version 1 toolchain.

#### Source layout

The token package uses a layer-first source layout, with resolver axes nested inside their owning layer:

~~~text
packages/tokens/
  src/
    mfd.resolver.json
    reference/
      shared.tokens.json
      brand/
        atlas.tokens.json
        bloom.tokens.json
    semantic/
      shared.tokens.json
      color-scheme/
        light.tokens.json
        dark.tokens.json
      density/
        comfortable.tokens.json
        compact.tokens.json
    component/
      <component>.tokens.json
  terrazzo.config.ts
  dist/
~~~

The resolver composes the eight permutations; source files do not duplicate complete resolved combinations. Brand files own raw brand values, color-scheme files map light and dark semantic roles, and density files vary only coordinated dimensional roles. Component token files are created lazily for justified exceptions. Large files may later be split by category without changing public token identifiers or resolver semantics. `dist/` is generated output and is never edited manually.

Build output will later target:

- CSS custom properties and Tailwind theme integration;
- JavaScript or TypeScript exports where needed;
- Figma variables;
- future React Native and Swift representations.

#### Figma synchronization

Repository tokens remain canonical. Version 1 uses a one-way synchronization path from repository sources to a deterministic generated Figma manifest and then to the DS Core Library through an MFD-owned local Figma plugin. The plugin reads the generated manifest, previews changes, and updates Figma variables; it does not turn Figma into a second writable source of truth. Exploratory changes made in Figma must be proposed back to the repository and reviewed before they can become official values.

The token build writes the importable manifest to `packages/tokens/dist/figma/variables.json`. The plugin receives that local file through its UI and declares no production network access. The manifest includes a schema version, source revision, deterministic content hash, collections, modes, variables, aliases, descriptions, scopes, and web code syntax where applicable.

Synchronization has three explicit operations:

- `Check` is read-only and reports creates, updates, unchanged entries, conflicts, and stale managed entries.
- `Apply` creates or updates only MFD-managed collections and variables after showing the complete diff. When a managed Figma value differs from the manifest, the repository value wins only through this explicit operation.
- `Prune` is a separate destructive operation for stale managed entries. Renamed or removed tokens are never deleted implicitly during `Apply`.

Canonical token paths are the stable identity in the manifest; ephemeral Figma object IDs are not source identifiers. The plugin records the applied manifest hash and management metadata in the Figma file so subsequent checks can identify drift without treating unrelated local variables as MFD-owned.

Applying a manifest does not publish the Figma library. After synchronization, an owner reviews the diff and representative components in every affected mode, then publishes the DS Core Library manually. Consumer files, including DS Reference CRM, receive changes only through that reviewed library publication.

The Figma file uses these variable collections:

- `MFD Reference Color`, hidden from library consumers, with `Atlas Light`, `Atlas Dark`, `Bloom Light`, and `Bloom Dark` modes;
- `MFD Semantic Color`, published for design use, with the same four modes and aliases to reference variables;
- `MFD Density`, with independent `Comfortable` and `Compact` modes;
- later foundation collections, including typography, only after their values and mode requirements are approved.

Combining brand and color scheme into four resolved Figma color modes is a representation of the approved cross-product, not a change to the independent source and runtime axes. Density remains independently selectable in Figma.

### 6.2 Layers

Tokens use three layers:

1. **Reference tokens:** raw scales such as color ramps, dimensions, font families, and durations.
2. **Semantic tokens:** roles such as text, surface, border, accent, status, and focus.
3. **Component tokens:** documented exceptions used only when a component genuinely diverges from the shared semantic roles.

Components never consume raw color primitives directly.

### 6.3 Naming direction

Names describe roles rather than current appearance or first usage. Brand color is called accent rather than primary so that text-primary remains unambiguous.

Token identifiers use nested JSON groups with lowercase `kebab-case` segments. Dot notation describes the resulting path; periods do not appear inside individual JSON keys.

The three layers use distinct grammars:

- Reference: `reference.<category>.<family>.<step-or-name>`, for example `reference.color.neutral.{step}`, `reference.font.family.body`, or `reference.easing.standard`.
- Semantic: `<category>.<role>.<variant>.<state>`, for example `color.bg.surface`, `color.accent.solid-hover`, `size.control-height`, or `motion.duration.fast`. The public semantic path does not repeat a `semantic` prefix.
- Component: `component.<component>.<part>.<property>.<variant>.<state>`, used only for documented component exceptions.

State, when present, is the final segment. Semantic paths name a job rather than an appearance, screen, or first usage, and do not use numbered roles such as `color.text.2`. Generated CSS custom properties use the `--mfd-` prefix; for example, `color.bg.canvas` becomes `--mfd-color-bg-canvas`.

Examples of the intended grammar:

- color.bg.canvas
- color.bg.surface
- color.text.primary
- color.text.secondary
- color.border.subtle
- color.border.focus
- color.accent.solid
- color.accent.solid-hover
- color.status.danger.text

Exact token paths and the exchange format remain open decisions.

### 6.4 Color-system constraints

The initial system includes:

- one neutral ramp per approved visual context;
- one accent ramp per brand;
- only status ramps required by validated product flows;
- semantic roles for canvas, surfaces, text, borders, actions, statuses, overlays, selection, and focus.

The first tracer introduces `danger` and `success` for validation, server-error feedback, and successful-save feedback. The second tracer adds `warning` for the approved on-hold Project state. `info` remains absent until a validated flow requires it. Each approved status exposes only `bg`, `border`, `solid`, and `text`; additional interactive states are introduced only with the component or flow that consumes them.

All contrast claims must be measured against the actual rendered background. Color is never the only carrier of status.

Version 1 authors color tokens as structured DTCG color values in OKLCH. The OKLCH components are canonical, while the optional six-digit `hex` member is deterministically generated as an sRGB fallback and validated against the canonical value. Fully opaque colors omit `alpha`; approved translucent values declare it explicitly.

All version 1 colors remain inside the sRGB gamut. Display P3 is not a separate version 1 palette or contract. CSS may emit `oklch()` while Figma and future native adapters consume deterministic sRGB conversions from the same source values.

Primitive neutral, accent, and approved status ramps use role-oriented steps `1` through `12`. Each brand defines separate light and dark ramps; the step meaning remains stable across both appearances rather than reversing the numbering:

- `1–2`: application and subtle backgrounds;
- `3–5`: component background, hover, and active or selected states;
- `6–8`: subtle, default, and strong borders;
- `9–10`: solid fill and solid-fill hover;
- `11–12`: lower- and high-contrast text.

The numbering adopts the role model, not the Radix color values. A status family may materialize only the numbered steps required by its approved semantic roles rather than all twelve values. Full alpha ramps are not generated by default; translucent reference values are added only for approved semantic needs such as overlays or selection.

Reference ramp tokens are internal and are not registered as public Tailwind theme colors. The generated Tailwind adapter exposes semantic, property-appropriate utilities such as `bg-canvas`, `text-primary`, and `border-subtle`; product code does not use classes such as `bg-accent-9`. Raw default Tailwind palette utilities are disabled for MFD-authored product UI. Tailwind is therefore an adapter over the semantic contract and does not impose its `50–950` primitive numbering on the source tokens.

#### Approved version 1 color values

The following arrays list canonical OKLCH components in step order `1–12`. `L` and `C` are unitless DTCG components and `H` is expressed in degrees. Hex values remain generated output and are not repeated here.

~~~text
Atlas / light / neutral
L: 0.988, 0.972, 0.948, 0.918, 0.884, 0.835, 0.765, 0.645, 0.560, 0.505, 0.430, 0.235
C: 0.004, 0.006, 0.008, 0.010, 0.012, 0.014, 0.016, 0.018, 0.020, 0.019, 0.016, 0.012
H: 230

Atlas / dark / neutral
L: 0.145, 0.175, 0.205, 0.240, 0.275, 0.320, 0.380, 0.505, 0.640, 0.700, 0.790, 0.940
C: 0.010, 0.012, 0.014, 0.016, 0.018, 0.020, 0.023, 0.026, 0.030, 0.032, 0.024, 0.012
H: 230

Atlas / light / accent
L: 0.988, 0.972, 0.948, 0.918, 0.884, 0.835, 0.765, 0.645, 0.550, 0.500, 0.425, 0.235
C: 0.004, 0.009, 0.018, 0.032, 0.050, 0.075, 0.110, 0.100, 0.100, 0.090, 0.075, 0.035
H: 225

Atlas / dark / accent
L: 0.145, 0.175, 0.205, 0.240, 0.275, 0.320, 0.380, 0.505, 0.640, 0.700, 0.790, 0.940
C: 0.012, 0.020, 0.030, 0.040, 0.045, 0.055, 0.065, 0.090, 0.110, 0.120, 0.120, 0.030
H: 225

Bloom / light / neutral
L: 0.988, 0.972, 0.948, 0.918, 0.884, 0.835, 0.765, 0.645, 0.560, 0.505, 0.430, 0.235
C: 0.004, 0.006, 0.008, 0.010, 0.012, 0.014, 0.016, 0.018, 0.020, 0.019, 0.016, 0.012
H: 285

Bloom / dark / neutral
L: 0.145, 0.175, 0.205, 0.240, 0.275, 0.320, 0.380, 0.505, 0.640, 0.700, 0.790, 0.940
C: 0.010, 0.012, 0.014, 0.016, 0.018, 0.020, 0.023, 0.026, 0.030, 0.032, 0.024, 0.012
H: 285

Bloom / light / accent
L: 0.988, 0.972, 0.948, 0.918, 0.884, 0.835, 0.765, 0.645, 0.560, 0.505, 0.430, 0.235
C: 0.004, 0.010, 0.022, 0.040, 0.055, 0.082, 0.105, 0.145, 0.180, 0.155, 0.125, 0.055
H: 295

Bloom / dark / accent
L: 0.145, 0.175, 0.205, 0.240, 0.275, 0.320, 0.380, 0.505, 0.640, 0.700, 0.790, 0.940
C: 0.012, 0.022, 0.035, 0.050, 0.068, 0.088, 0.110, 0.150, 0.175, 0.155, 0.105, 0.025
H: 295
~~~

The initial status values are shared by both brands and materialize only the approved roles:

| Scheme | Family | `bg` | `border` | `solid` | `text` |
| --- | --- | --- | --- | --- | --- |
| Light | Danger | `0.960 0.018 25` | `0.650 0.140 25` | `0.550 0.190 25` | `0.420 0.140 25` |
| Light | Success | `0.960 0.018 145` | `0.620 0.130 145` | `0.535 0.160 145` | `0.420 0.120 145` |
| Dark | Danger | `0.210 0.035 25` | `0.520 0.130 25` | `0.650 0.180 25` | `0.820 0.100 25` |
| Dark | Success | `0.210 0.035 145` | `0.520 0.120 145` | `0.650 0.150 145` | `0.820 0.100 145` |
| Light | Warning | `0.960 0.025 85` | `0.620 0.115 85` | `0.500 0.100 85` | `0.420 0.080 85` |
| Dark | Warning | `0.210 0.035 85` | `0.550 0.100 85` | `0.720 0.135 85` | `0.840 0.090 85` |

All listed values are inside the sRGB gamut. Programmatic checks of the currently approved semantic mappings give at least `4.58:1` for text or on-solid pairs, at least `3.10:1` for focus against canvas, and at least `3.04:1` for status borders against status backgrounds. Warning specifically measures `7.58:1` light and `10.83:1` dark for text on background, `3.27:1` light and `3.63:1` dark for border against background, and `5.85:1` light and `7.90:1` dark for on-solid text. Its generated sRGB fallbacks are light `#faf1df`, `#a68023`, `#7d5e07`, `#61490c` and dark `#201704`, `#8c6c1f`, `#cb9d2a`, `#e6c686` in `bg`, `border`, `solid`, `text` order. Implementation must still validate every emitted semantic pair and verify the actual rendered backgrounds in both schemes.

### 6.5 Typography

Brands use different typefaces while keeping a common role vocabulary and metrics:

- Atlas uses Geist Sans for interface text and Geist Mono for code and technical data.
- Bloom uses DM Sans for interface text, Lora only for `display` and the larger `title` roles, and Geist Mono for code and technical data.
- The approved weights are `400`, `500`, and `600`.
- Fonts are self-hosted as variable `.woff2` files with Latin Extended coverage.

The shared role scale is:

| Role | Font size / line height |
| --- | --- |
| `display` | `40px / 44px` |
| `title-lg` | `32px / 36px` |
| `title` | `24px / 30px` |
| `heading` | `20px / 26px` |
| `body-lg` | `16px / 24px` |
| `body` | `14px / 20px` |
| `label` | `14px / 20px` |
| `caption` | `12px / 16px` |
| `code` | `13px / 20px` |

Typography tokens must carry intentional size, line height, weight, and letter spacing. Input text must remain at least 16 CSS pixels in mobile contexts where smaller text would trigger browser zoom.

### 6.6 Spacing and sizing

Spacing uses a 4-pixel base with an optional 2-pixel half step for justified optical corrections. Arbitrary off-scale values require an explicit exception.

Component size and interface density are separate:

- size selects local hierarchy such as small, medium, or large;
- density adjusts the coordinated dimensions and spacing of a wider application area.

The approved density maps are:

| Density | Control heights (small / medium / large) | Table row | Field gap | Group gap |
| --- | --- | --- | --- | --- |
| Comfortable | `32 / 40 / 48px` | `48px` | `8px` | `16px` |
| Compact | `28 / 32 / 40px` | `40px` | `6px` | `12px` |

Density changes only coordinated dimensions and spacing. It does not change typography, variant meaning, component anatomy, or interaction behavior. Touch contexts preserve an effective minimum hit area of `44px` even when a control's visual height is smaller.

### 6.7 Radius, elevation, and motion

Atlas uses the radius scale `0, 4, 6, 8, 12, full`. Bloom uses `0, 6, 10, 14, 20, full`. Components map semantic radius roles to these brand scales and preserve concentric radii: an outer radius equals the inner radius plus the separating padding.

Elevation has three semantic levels: subtle, overlay, and modal. Atlas uses a sharper shadow character; Bloom uses a softer character. Exact shadow tokens must preserve those roles and remain independently testable in both color schemes.

The shared motion scale is `0ms`, `100ms`, `150ms`, and `240ms`, with the standard easing `cubic-bezier(0.2, 0, 0, 1)`. Press feedback uses `scale(0.96)` where scale is appropriate and does not disturb layout. Decorative motion is removed under `prefers-reduced-motion`; necessary state changes remain immediate and understandable.

## 7. Component contracts

### 7.1 Variants and states

A variant is an intentional public API choice. A state follows from component behavior or data.

Examples:

- variant and size are public choices;
- hover, pressed, and focus-visible are interaction states;
- invalid follows validation;
- disabled is a functional property;
- impossible combinations such as disabled plus hover are not exposed as independent Figma variants.

### 7.2 Styling boundary

CSS custom properties and semantic tokens are the public visual contract. Tailwind is the web authoring adapter, not the cross-platform API.

Consumers may control placement and explicitly allowed layout concerns. A component owns its internal spacing, typography, color, shape, and interaction styling unless its documented contract says otherwise.

### 7.3 Forms

Controls and field composition are separate:

- Input, Textarea, and Select are controls;
- Field composes FieldLabel, FieldDescription, FieldError, and the control;
- Field owns identifiers, invalid state, and accessible relationships;
- components do not depend on a specific form-state library.

The public API is compositional. Input and Textarea accept their applicable native element props plus `size="sm" | "md" | "lg"`; they do not duplicate label, description, or error props. A Field may contain any compatible control, but MFD does not expose a parallel public FieldControl abstraction when a dedicated control already exists. FieldError accepts external validation content without coupling the design system to the validation source.

Reference CRM uses React Hook Form for form state and Zod for application-owned schemas. The Add Client form validates on submit and revalidates corrected fields on change. Invalid submission moves focus to the first invalid control. Server validation maps either to the relevant named field or to a persistent form-level error. Registry controls remain library-agnostic and forward the refs and state required by integrations.

Validation behavior:

1. Before the first submit, errors are not shown while the user types.
2. Submit reveals inline errors and moves focus to the first invalid field or error summary.
3. After submission, a corrected field updates its error promptly.
4. Success is represented by the updated result and a short status toast.
5. Server errors remain visible in an Alert inside the form.

### 7.4 Dialog behavior

The Add Client flow uses a Dialog on wider screens and a full-screen presentation of the same form on narrow screens. A dedicated page becomes appropriate only when the form becomes long or multi-step.

Dialog exposes compositional Root, Trigger, Content, Header, Title, Description, Body, Footer, and Close parts with controlled and uncontrolled open state. Content supports `size="sm" | "md" | "lg"` for maximum width. Below `640px`, the same Content becomes full-screen automatically; mobile presentation is not a separate consumer-selected variant. Header and Footer remain visible while a long Body scrolls internally.

Dialog remains modal, blocks background interaction, manages focus, restores focus on close, and includes a visible close control. Escape and backdrop interaction request closing by default. A product flow may intercept that request to confirm discarding unsaved changes. Base UI imperative handles are an implementation capability rather than part of the primary MFD API.

In Add Client, an unchanged form closes immediately through Cancel, Close, Escape, or backdrop interaction. Once the form is dirty, every close request opens a nested Alert Dialog with Keep editing and danger-styled Discard changes actions. Keep editing receives initial focus; Escape keeps the form; returning to the form restores focus to the control that initiated the close request. Successful submission bypasses discard confirmation.

While submission is pending, the form exposes busy state, Submit shows loading, controls are temporarily unavailable, and dismissal is blocked. Failure restores editing and leaves the dialog open with its persistent Alert. The application owns dirty and submitting state; Dialog exposes the close-request seam without depending on React Hook Form. Version 1 does not add a global beforeunload warning.

### 7.5 Button

Button supports `variant="accent" | "neutral" | "outline" | "ghost" | "danger"` and `size="sm" | "md" | "lg"`, defaulting to accent and medium. Its size maps through the active density tokens rather than hard-coded component dimensions.

Button also supports `loading` and `loadingLabel`. Loading prevents repeated activation while preserving the focused control and exposing the changed accessible name. Submit behavior remains explicit through the native `type="submit"` prop. Links remain semantic anchors styled through their own contract; Button does not expose a link variant.

Icon-only actions use a separate IconButton contract with a required accessible name rather than adding icon-only modes to Button.

### 7.6 Feedback

Alert is persistent content in the document and supports `tone="danger" | "success"` in version 1. It composes AlertTitle, AlertDescription, and an optional single AlertAction. It does not move focus. A dynamically inserted urgent Alert uses alert semantics, while static content does not become an assertive live region merely because its visual tone is danger.

Toast is reserved for brief acknowledgement that does not require action. The first tracer uses `toast.success()` after a client is added. Toast uses polite status semantics, does not move focus, is dismissible, and defaults to a four-second duration. At most three toasts are visible; additional messages queue. Errors that require recovery remain persistently available through Alert rather than appearing only as a Toast.

Sonner provides the internal queue and lifecycle behavior, but consumers use only the MFD Toast adapter. Sonner is not part of the public application contract.

### 7.7 Empty State

Empty State is a single compositional pattern with EmptyStateIcon, required EmptyStateTitle, optional EmptyStateDescription, and optional EmptyStateActions. It has no visual variants in version 1 and permits at most one primary and one secondary action. The icon is decorative by default because the title carries the state meaning.

The component owns anatomy, spacing, and responsive behavior; the product owns copy and actions. No data, no search results, and loading failure are distinct product states. A failure is not represented by Empty State as a substitute for Alert.

### 7.8 Icons

Lucide is the initial icon source behind an MFD Icon contract. Applications use the approved MFD map rather than importing arbitrary Lucide icons directly. Icon sizes are `sm=16px`, `md=20px`, and `lg=24px`, with a shared stroke width of `2`.

Icons are decorative and hidden from assistive technology by default. Meaning comes from visible text or the accessible name of the surrounding control. An icon receives its own label only when the icon itself is informational. IconButton requires an accessible name while its child icon remains decorative to prevent duplicate announcements.

The initial map uses Plus for adding, X for closing, CircleCheck for success, CircleAlert for errors, Users for the client empty state, Search for searching, Ellipsis for additional actions, ChevronDown for disclosure, and Trash2 for direct deletion. Only semantically directional icons such as ArrowLeft, ArrowRight, ChevronLeft, and ChevronRight mirror in RTL. Logos and brand illustrations are separate assets.

### 7.9 Table

The registry provides semantic Table, TableHeader, TableBody, TableRow, TableHead, TableCell, and TableCaption primitives backed by native HTML table elements. It does not introduce ARIA grid behavior or arrow-key navigation for ordinary tabular data. Interactive controls inside cells remain individual tab stops.

Table owns structural styling and density-aware row dimensions. Product-specific columns, sorting, filtering, fetching, and row actions remain application patterns. Empty, no-results, loading-failure, and table content are separate states rather than artificial rows inside TableBody.

### 7.10 Select

Select exposes compositional Root, Trigger, Value, Icon, Content, and Item parts for choosing one predefined value. It supports small, medium, and large sizes through density tokens plus controlled or uncontrolled value, name, required, disabled, invalid, and loading state. Loading prevents another change, exposes pending feedback, and replaces the disclosure affordance with progress without changing the accessible name.

Field supplies the visible label in forms. A standalone Select, such as the project-row status control, receives a contextual accessible name that includes the affected entity. Items use stable primitive values and simple text labels. Escape closes without committing a new value.

Version 1 does not expose multiple selection, object values, asynchronous option loading, or filtering. Large or searchable option sets require a future Combobox contract rather than extending Select.

### 7.11 Badge

Badge is a non-interactive span with `tone="neutral" | "accent" | "warning" | "success" | "danger"` and `size="sm" | "md"`. It has one subtle treatment using semantic background, border, and text roles plus a fixed pill shape. It may contain a decorative icon but always retains visible text; color and iconography never carry meaning alone.

Badge is not clickable, removable, a filter control, or a live region. Domain mappings remain in application features: ProjectStatus maps planned to neutral, active to accent, on-hold to warning, and completed to success. The registry Badge does not know ProjectStatus.

### 7.12 Navigation

Link remains a semantic anchor and composes with the application's router rather than emulating Button. It supports `variant="inline"`, which remains underlined in prose, and `variant="standalone"`, which is used for navigation and entity names and gains an underline on hover and focus-visible. Both preserve a visible non-color-only focus indicator. External behavior remains explicit and communicates new-window navigation when used.

Breadcrumb renders a navigation landmark labeled Breadcrumb and an ordered list. Ancestors use BreadcrumbLink; the final BreadcrumbCurrent is not a link and carries `aria-current="page"`. Visual separators are decorative. The second tracer uses only `Clients → Client name`; it does not add a redundant Home item. At narrow widths, Clients remains visible while a long current name may truncate visually without losing its full accessible value.

### 7.13 Page Header

Page Header composes Breadcrumb, exactly one page `h1`, optional description, and an action region. It is structural rather than an elevated surface. The primary page action is the only filled action. At narrow widths, actions wrap below the title and use the available width.

### 7.14 Radio Group

Radio Group exposes compositional RadioGroup, RadioGroupItem, and RadioGroupIndicator parts for choosing exactly one value. It supports controlled and uncontrolled value, `name`, `required`, `disabled`, `readOnly`, and horizontal or vertical orientation. Values are stable primitives. Fieldset and Field supply the visible group legend, item label, optional description, and error relationship rather than duplicating those contracts on Radio Group.

The default item is a conventional circular radio control. Rich appearance choices use a separate RadioCard composition built from the same RadioGroupItem contract; card presentation is not a second selection semantic or a generic segmented control. A RadioCard keeps a visible label, may add description or a visual preview, and exposes its complete selected and focus-visible state without relying on color alone.

Native radio keyboard expectations remain intact: Tab enters and leaves the group, arrow keys move and select within the group according to orientation and direction, and Space selects the focused item. Base UI owns the behavior and roving focus foundation. Version 1 does not add multiple selection, icon-only options, deselection of the current value, or application-domain knowledge.

### 7.15 Theme Preview

Theme Preview is a responsive, non-interactive application pattern rendered from the active tokens. It combines simplified representations of a surface, typography, form control, action, and status so the three selected axes can be inspected together. It is not an iframe, screenshot, parallel theme runtime, or miniature interactive product.

The visual sample is hidden from assistive technology and accompanied by visible text that states the active brand, color-scheme preference, and density, for example `Atlas · Dark · Compact`. Representations that resemble controls are not focusable and do not expose false button or input semantics. The preview follows the same root attributes as the surrounding application and does not maintain an independent selection state.

### 7.16 Search Field

Search Field is a registry component built on a native `input type="search"` and composed with the existing Field contract for its visible or visually hidden label, description, and error relationship. It supports controlled and uncontrolled value, `onValueChange`, `onSubmit`, `onClear`, disabled state, and `size="sm" | "md" | "lg"`. Its size uses the same density-aware control mappings as Input.

The leading Search icon is decorative. A non-empty enabled field exposes a predictable trailing clear control with an accessible name rather than relying on inconsistent browser-provided affordances. Enter invokes `onSubmit`. Escape clears a non-empty value without moving focus. An optional loading presentation is visual only; the application results region owns busy state and result announcements.

Search Field does not own debouncing, URL state, data fetching, filtering, result counts, or suggestions. It is not a Combobox and does not expose autocomplete-list semantics.

### 7.17 Alert Dialog

Alert Dialog exposes compositional Root, Trigger, Content, Title, Description, Footer, Cancel, and Action parts. Title and Description are required. The consumer supplies the actions and chooses Button variants explicitly; Action does not silently imply danger because confirmations may be consequential without being destructive.

Escape acts as Cancel when the dialog is idle, while backdrop interaction never dismisses the confirmation. Destructive uses place initial focus on Cancel. Pending Action keeps the dialog open and temporarily prevents repeated Action, Cancel, Escape, and other close requests. A mutation failure remains inside the open Alert Dialog as persistent feedback.

On dismissal, focus returns to Trigger by default. When successful completion removes the Trigger, the application must provide an explicit logical fallback. Alert Dialog owns modal semantics, focus containment, and restoration mechanics but does not own mutation, domain, copy, or dirty-state logic.

## 8. Accessibility and internationalization

The baseline is WCAG 2.2 Level AA, supported by:

- native elements wherever possible;
- complete keyboard operation;
- visible focus-visible indicators;
- correct focus trapping and restoration for modals;
- labels and descriptions for controls;
- inline and announced validation;
- reduced-motion handling;
- resilient long content;
- 200 percent zoom;
- reflow at 320 CSS pixels;
- light and dark schemes;
- redundant non-color status cues.

Figma can specify accessible intent but cannot prove runtime conformance. Runtime tests remain authoritative.

RTL is a system capability:

- locale normally owns document direction;
- layout uses logical start and end;
- directional icons mirror when their meaning requires it;
- mixed-direction content can establish a local direction boundary;
- Direction is not a public variant on every component.

Canonical technical names, tokens, components, props, Figma layers, and documentation are in English. Polish educational material may be added without creating parallel technical names.

## 9. Browser contract

Web version 1 targets the current and previous major versions of:

- Chrome;
- Edge;
- Firefox;
- Safari;
- mobile Safari;
- mobile Chrome.

Internet Explorer and obsolete embedded WebViews are outside the contract.

## 10. Figma architecture

Figma is split into:

1. **DS Core Library:** foundations, variables, components, and contract documentation.
2. **DS Reference CRM:** product screens consuming only the published library.

The Reference CRM file must expose publishing, cross-file instance, variable binding, and component-property problems. It must not rely on unpublished local substitutes.

## 11. Reference CRM

### 11.1 Purpose

The Reference CRM is a fictional but realistic B2B client-and-project management application. It is a consumer and integration test, not a component gallery.

Primary user: account or project manager.

### 11.2 Product flows

- Sign in.
- Browse, search, and filter clients.
- Add and edit a client.
- View a client and its projects.
- Create a project and change its status.
- Delete a client or project with confirmation.
- View user settings and switch the demonstrated theme context.
- Experience empty, loading, error, no-results, and success states.

Billing, complex authorization, messaging, files, calendar, and kanban are outside version 1.

### 11.3 First tracer

The first vertical slice is:

> Client list → Add client → Validate → Save → Client appears in the list → Success feedback.

This slice is expected to exercise:

- application shell;
- typography;
- Button;
- Field, Label, Input, and Textarea;
- form validation;
- Dialog;
- simple list or table;
- Empty State;
- Alert or Toast;
- focus, disabled, loading, and error states;
- responsive behavior;
- both brands and light/dark schemes.

### 11.4 Client model

Client means an organization receiving services. It is distinct from the current tenant, an application user, and an individual contact. The first tracer uses:

~~~ts
type Client = {
  id: string
  organizationName: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  notes?: string
  relationshipStatus: "active" | "inactive"
  createdAt: string
  updatedAt: string
}
~~~

The Add Client form requires organizationName and contactName between 2 and 100 characters and a valid contactEmail. ContactPhone is optional. Notes is optional and limited to 1000 characters. A new Client receives `relationshipStatus="active"`; creation does not ask for a status. Version 1 does not yet model multiple contacts, addresses, or billing data; a later validated flow may introduce a separate Contact entity.

Relationship Status is independent from Project Status. Active means the organization has an ongoing client relationship; inactive preserves a historical organization without asserting a current relationship. The transition is reversible, needs no reason or approval, and does not restrict editing, Projects, or deletion. Active maps to success Badge and inactive to neutral Badge. Version 1 does not add lead, prospect, archived, scoring, or status-history concepts.

Client details presents the current Relationship Status as a Badge inside a contextual Select whose accessible name includes the organization. This is independent from ClientForm; Add defaults to active and Edit does not silently combine record fields with lifecycle change. Selecting the current value is a no-op. A change is non-optimistic and makes only that control pending. Success updates detail and list caches, revalidates affected filtered queries, and announces `Client status updated`; failure preserves the confirmed status and exposes persistent Alert. Because the transition is reversible and does not restrict other behavior, it needs no confirmation.

### 11.5 Demonstration data

Reference CRM exercises an HTTP-shaped client data boundary without deploying a real backend. Mock Service Worker intercepts `/api/clients` requests in the browser and reuses the same handlers in integration tests. Demo records persist in localStorage for the current origin, and a visible Reset demo data action restores the deterministic seed.

Application screens depend on a ClientRepository contract rather than MSW or localStorage directly. The mock API can simulate latency, validation responses, and server failure. All records are fictional, and the interface discloses that demo data remains locally in the browser.

TanStack Query v5 manages the asynchronous client list and create mutation in Reference CRM. Query ownership remains in the clients feature and never enters registry components. The create flow does not optimistically insert a client: server failure leaves the dialog open with a persistent Alert. A successful response updates the cached list, triggers revalidation, closes the dialog, restores focus to the trigger, and emits the success Toast. Background refetching preserves existing rows rather than replacing them with an initial-loading skeleton.

### 11.6 Client list

ClientTable is a Reference CRM product pattern rather than a generic registry DataTable. It uses the native Table primitives and the following columns:

- Client: organization name;
- Primary contact: name, email, and optional phone;
- Added: creation date;
- Actions: an explicitly named action menu for the row.

The table has an accessible caption, column header scope, and row-specific accessible names such as `More actions for Acme`. Rows are not themselves clickable. A future client detail flow may turn the organization name into a normal link.

Below `640px`, the Added column is omitted while the grouped contact cell and row action remain. The same native table is retained rather than duplicating the records as a parallel card DOM. Text wraps safely, email values can break, and the primary view reflows at 320 CSS pixels without horizontal scrolling. Density changes row dimensions but not the information hierarchy.

Initial loading uses a table skeleton and an assistive status message. Fetch failure uses a persistent Alert with a Try again action. Empty and no-results states use the approved distinct product patterns outside TableBody.

### 11.7 Add Client acceptance scenarios

The first tracer is complete only when all of the following hold:

1. Initial loading exposes a skeleton and assistive status, then resolves to the native client table, the approved Empty State, or a persistent fetch-error Alert with Try again.
2. Add client opens a medium Dialog on wide screens and a full-screen Dialog below 640px. Keyboard or pointer opening focuses Organization name; touch opening focuses the Dialog container to avoid raising the virtual keyboard. Title and description name the Dialog.
3. Empty submission exposes the three required-field errors, focuses Organization name, announces each correctly associated error, and leaves the Dialog open.
4. Errors remain hidden before the first submission. Afterwards, each corrected field revalidates on change without clearing unrelated errors.
5. Pristine dismissal closes immediately. Dirty dismissal through Cancel, Close, Escape, or backdrop uses the approved discard confirmation and either preserves values and focus or closes and restores focus to Add client.
6. A duplicate contact email returned by the mock API maps to Contact email, preserves entered values, focuses that field, and does not emit a Toast.
7. Server failure keeps the Dialog open, restores editing, and exposes an announced persistent Alert with Try again without unexpected focus movement.
8. Pending submission exposes loading, prevents duplicate submission and dismissal, and marks the form busy. Success inserts the returned Client at the beginning of the list, closes the Dialog, restores trigger focus, emits the polite `Client added` Toast, and persists after reload.
9. Reset demo data requires confirmation, restores the deterministic seed, removes locally added records, and announces completion as status.
10. The flow survives 320px reflow, 200 percent zoom, long names and email addresses, minimum 44px touch targets, and reduced motion without losing content or introducing horizontal page scrolling.
11. The behavior, semantics, focus order, and anatomy remain stable across all eight Atlas/Bloom × light/dark × comfortable/compact contexts. Each context receives contrast, keyboard, and visual-regression coverage; representative contexts receive screen-reader and mobile verification.

### 11.8 Demo session

Reference CRM demonstrates session-aware routing without claiming to implement production authentication. The public `/sign-in` page presents the fictional `Alex Morgan — Account Manager` identity and a single Continue as demo manager action. It does not collect credentials.

A Server Action sets a short-lived HttpOnly, Secure, SameSite=Lax demo cookie and redirects to `/clients`. Sign out deletes the cookie and returns to `/sign-in`; CRM routes redirect to sign-in when it is absent. The cookie is a demonstration mechanism, not a security or authorization boundary. No auth provider, registration, password recovery, persistent user store, or role system is included.

The application visibly identifies Demo mode and explains that all fictional CRM data is stored locally in the current browser. Documentation requires real consumers to integrate an appropriate identity provider and authorization layer.

### 11.9 Project model

Project is a unit of work delivered for exactly one Client and cannot exist without its owning Client:

~~~ts
type ProjectStatus = "planned" | "active" | "on-hold" | "completed"

type Project = {
  id: string
  clientId: string
  name: string
  description?: string
  status: ProjectStatus
  startDate?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}
~~~

Project name is required and contains 2–120 characters. New projects default to planned. Description, start date, and due date are optional, but due date cannot precede start date. Version 1 excludes budgets, billing, members, tasks, files, and a separate project contact. The approved on-hold flow justifies the warning token family. Client deletion with existing projects remains a separate destructive-flow decision.

Status meanings are fixed: planned means work has not started, active means work is underway, on-hold means work is intentionally paused, and completed means the agreed scope is finished. Version 1 allows every status to transition to every other status, including reopening a completed Project as active. Selecting the current value is a no-op. Version 1 does not record transition history, require a reason, or require approval.

Status changes are not optimistic. The Select exposes pending state until the API succeeds. Success updates the query cache and emits `Project status updated`; failure restores the prior value and shows a persistent Alert near Projects. Planned maps to neutral, active to accent, on-hold to warning, and completed to success. Every option retains a visible text label, so color and iconography are redundant cues.

### 11.10 Second tracer

The second vertical slice is:

> Client list → Open client details → View projects → Add project → Validate → Save → Project appears → Change status → Success feedback.

Organization name becomes a normal link to `/clients/[clientId]`. Client details presents the approved client data and a Projects section. No projects uses a dedicated Empty State with Add project. Add project reuses the responsive Dialog, validation, server-error, dirty-dismissal, loading, focus-restoration, and success-feedback contracts established by Add Client.

The initial project form includes required Name, optional Description, and Status defaulting to planned. Optional dates remain in the domain model but enter the UI with a later Edit Project flow, so this tracer does not prematurely introduce a date-picker contract. A successful mutation updates the client's project collection without a page reload, and project status can be changed from the project list.

This tracer introduces and validates Link, Breadcrumb, Page Header, Select, Status Badge, the project-list pattern, the Client-to-Projects relationship, and dependent query-cache updates. It excludes client editing, deletion, destructive dependency handling, and project date editing.

### 11.11 Project list

ProjectTable is a Reference CRM pattern built from the native Table primitives. Projects sort by most recently updated and use three columns:

- Project: Name plus optional Description;
- Status: a contextual Select whose trigger visually contains the mapped Badge;
- Updated: the last modification date.

There is no Actions column or Project link until an approved edit, delete, or detail flow exists. The status control is named for its Project, while the nested Badge remains visual content. Updating one status places only that Select in loading state. Failure preserves the previous value and exposes an Alert above the table.

Below `640px`, Updated is omitted while Project and Status remain. Description clamps visually to two lines without pretending that the truncated table cell is the authoritative detail view. An empty collection uses the dedicated Project Empty State outside TableBody. ProjectTable remains application-owned rather than becoming a generic registry DataTable.

### 11.12 Second-tracer acceptance scenarios

The second tracer is complete only when all of the following hold:

1. Organization name navigates to `/clients/[clientId]`; Client details has the approved Breadcrumb, one h1, demo-session return-to behavior, and a Not Found state with Back to clients for an unknown id.
2. Initial loading is announced. Client and Projects load independently: Client failure blocks the detail view, while Projects failure preserves Client content and exposes a section-level retry Alert.
3. A Client without projects receives the dedicated No projects yet Empty State with Add project as its primary action.
4. Add project reuses the approved responsive Dialog, focus, and dirty-dismissal contracts. Name and Description start empty, Status starts planned, and dates are absent.
5. Name validation enforces 2–120 characters, focuses the invalid field after submit, remains hidden beforehand, revalidates corrections, and prevents mutation while invalid.
6. API validation maps to Field; server failure preserves the form in the open Dialog and exposes persistent Alert without adding a Project or emitting Toast.
7. Pending creation blocks duplicate submission and dismissal. Success inserts the returned Project first, closes the Dialog, restores Add project focus, emits Project added as polite status, and persists after reload.
8. Every status Select is named for its Project. Selecting the current status is a no-op. One pending change affects only its own control; success updates Badge and updatedAt order and emits status feedback, while failure preserves the prior status and exposes the table Alert. Every approved transition, including reopening completed as active, is covered.
9. Keyboard operation, approved semantics, 320px reflow, long content, 200 percent zoom, 44px touch targets, and reduced motion all pass; Updated is omitted below 640px while Project and Status remain.
10. The flow passes in all eight brand, color-scheme, and density combinations. Every status retains text, tone, and measured contrast; every context receives visual and keyboard coverage, with representative screen-reader and mobile verification.

### 11.13 Third tracer

The third vertical slice is:

> Open Appearance settings → Change demo brand → Change color scheme → Change density → Verify application → Reload → Preferences remain without theme flash.

`/settings/appearance` presents independent controls for Atlas or Bloom demo brand context, System/Light/Dark color-scheme preference, and Comfortable/Compact density. Changes apply immediately throughout Reference CRM and persist in cookies so the server can emit the correct theme attributes before hydration. System remains the stored preference and continues to follow changes to `prefers-color-scheme`.

The authenticated App Shell exposes Clients and Settings as its version 1 primary destinations; Projects remains contextual to a Client. Settings links directly to `/settings/appearance`. Until another settings destination exists, the page does not render an otherwise empty local settings sidebar. Appearance uses Page Header followed by one readable content column containing Brand, Color scheme, and Density Fieldsets. Reset appearance is a secondary action below the settings rather than competing with the page title or primary navigation.

Reset appearance restores Atlas, System, and Comfortable and announces completion. The brand selector is explicitly a demonstration tool that simulates resolving a different tenant; it does not imply that production users may change a tenant's brand. Version 1 does not include token editing, arbitrary colors or fonts, or no-code branding.

This tracer introduces and validates Settings layout, Radio Group, Theme Preview, the runtime Theme Provider, pre-hydration theme initialization, persistence and reset of three independent axes, and reaction to color-scheme and reduced-motion media preferences.

### 11.14 Third-tracer acceptance scenarios

The third tracer is complete only when all of the following hold:

1. The first server render emits the validated root attributes before hydration and never displays a transient incorrect brand, color scheme, or density.
2. Missing or invalid preference cookies fall back independently to Atlas, System, and Comfortable; one invalid axis does not reset another valid axis.
3. Changing the demo brand updates the approved brand-controlled tokens without changing semantics, content, application state, or current focus.
4. Explicit Light and Dark remain fixed. System retains its stored value and reacts to operating-system scheme changes without a reload.
5. Changing density updates the coordinated dimension roles without changing typography, anatomy, semantics, or behavior and preserves the effective 44px touch-target contract.
6. Every Radio Group has a visible legend, complete accessible names and descriptions, expected Tab, arrow-key, and Space behavior, a non-color-only selected state, and a visible focus indicator.
7. Each selection updates the application and Theme Preview immediately, persists successfully, and remains after reload without a hydration mismatch.
8. A persistence failure restores the last confirmed preference for the affected axis, preserves the other axes, and exposes a persistent retryable Alert.
9. Reset restores and persists Atlas, System, and Comfortable, updates the application and preview once, preserves focus, and announces completion politely.
10. All eight brand, resolved color-scheme, and density combinations pass at 320px, 200 percent zoom, with long localized labels, RTL, reduced motion, representative screen-reader and mobile verification, and no hydration diagnostics.

### 11.15 Application shell

Reference CRM owns its authenticated App Shell as an application pattern. The registry supplies the underlying Link, Button, Icon, Page Header, and layout tokens but does not publish AppShell, Sidebar, or NavLink in version 1. A second product must demonstrate a shared contract before those patterns can become public components.

The first focusable element is a skip link targeting a stable main-content identifier. The header identifies Reference CRM and shows the fixed demo user plus a visible Sign out action. A separately labelled primary-navigation landmark contains directly visible Clients and Settings links. The active destination carries `aria-current="page"` and a non-color-only visual state.

Version 1 uses no sidebar, hamburger control, Drawer, or hidden primary navigation. Below `640px`, the header regions stack so product identity, both destinations, and Sign out remain directly reachable without opening another surface. The main landmark owns the readable page-width constraint while allowing flow-specific content such as tables to use its available width.

### 11.16 Fourth tracer

The fourth vertical slice is:

> Client list → Search clients → Inspect matching results → Clear search → Return to the complete list.

The tracer introduces Search Field, URL-owned query state, asynchronous list refresh, and a dedicated No results Empty State. Filtering remains deferred because the approved Client model has no meaningful filter dimension; the product does not fabricate filter controls before a later flow justifies Client status or another domain property.

Search matches organization name, primary-contact name, and primary-contact email after trimming external whitespace and normalizing case and diacritics. The canonical query is the `q` URL search parameter. Editing replaces the current history entry rather than adding one for each keystroke, starts a request after 300ms of inactivity, and submits immediately on Enter. Empty input removes `q` and restores the complete list immediately. There is no minimum query length.

Existing successful rows remain visible and the results region becomes busy while a new query is pending. No matches produces a dedicated Empty State that includes the visible query and a Clear search action. Failure preserves both the field value and last successful rows and adds a persistent retryable Alert. Version 1 does not include suggestions, recent searches, saved searches, highlighting, or Combobox behavior.

### 11.17 Fourth-tracer acceptance scenarios

The fourth tracer is complete only when all of the following hold:

1. Opening a valid URL containing `q` initializes the Search Field and loads the matching result directly without exposing the complete list as an intermediate state.
2. Matching correctly normalizes external whitespace, case, and diacritics across organization name, primary-contact name, and primary-contact email.
3. Typing produces one request after 300ms of inactivity; Enter submits immediately and cancels the pending debounce.
4. A stale slower response never replaces data belonging to a newer query.
5. The clear control, Escape from a non-empty field, and manually removing all text remove `q` and restore the complete list immediately.
6. Refresh retains the last successful rows, marks the results region busy, communicates progress without excessive announcements, and never moves focus.
7. No matches shows the dedicated Empty State containing the visible query and a working Clear search action.
8. Failure preserves the query and last successful rows, exposes a persistent Alert, retries the current canonical query, and removes the Alert after recovery.
9. Search Field, its clear control, feedback, and results have correct accessible names, keyboard order, focus-visible treatment, and representative screen-reader announcements.
10. The flow passes at 320px, 200 percent zoom, with a long query, RTL, reduced motion, and all eight brand, resolved color-scheme, and density combinations.

### 11.18 Fifth tracer

The fifth vertical slice is:

> Client details → Edit client → Validate changes → Save → Updated client appears in details and list.

Edit Client reuses the approved responsive Dialog, Field controls, validation timing, dirty-dismissal confirmation, and pending-submission behavior from Add Client. The application-owned ClientForm supports explicit create and edit modes. The registry remains unaware of Client, React Hook Form, and Zod.

Both modes share field composition and validation rules but own separate initial values, action labels, and mutation functions. Edit initializes from the last confirmed Client record. It resets only when opening for a different Client or reopening after a completed dismissal; background refetch never overwrites in-progress edits. Submitting an unchanged edit is unavailable.

Update is not optimistic. Pending submission keeps the Dialog open and blocks dismissal. API field errors map back to Field, and other failures remain in a persistent Alert. Success writes the returned Client into detail and list caches, revalidates affected queries, closes the Dialog, restores focus to Edit client, and announces `Client updated`. Version 1 has no autosave, record versioning, concurrent-edit conflict detection, or change history.

### 11.19 Fifth-tracer acceptance scenarios

The fifth tracer is complete only when all of the following hold:

1. Edit client opens with the last confirmed values and a logical initial focus target.
2. Save changes is unavailable and the form is not dirty before a value differs from its confirmed initial state.
3. Changing and then restoring a value returns the form to unchanged state and makes submission unavailable again.
4. Background Client refetch never overwrites an edit already in progress.
5. Local validation uses the Add Client rules, timing, correction behavior, and first-invalid-field focus order.
6. Every attempted dismissal of a dirty edit uses the approved discard-confirmation flow and restores focus correctly when editing continues.
7. API field errors map to Field; a general failure keeps the Dialog open with the submitted values and persistent Alert.
8. Pending update prevents duplicate submission and dismissal while preserving values and stable focus.
9. Success updates detail and list caches, restores focus to Edit client, announces `Client updated`, and persists after reload.
10. The flow passes at 320px, 200 percent zoom, with long values, keyboard-only use, representative screen-reader verification, and all eight brand, resolved color-scheme, and density combinations.

### 11.20 Client deletion rule

Client deletion never cascades to Projects. A Client with any Project cannot be deleted; the application keeps the record and exposes persistent guidance to remove its Projects first. A Client without Projects may be deleted only through the approved destructive confirmation.

Version 1 does not add soft deletion, archival, typed-name confirmation, undo, or change history. The deterministic demo-data reset remains a development and demonstration facility, not a user-facing recovery promise.

### 11.21 Sixth tracer

The sixth vertical slice is:

> Client details with a Project → Attempt Client deletion and see it blocked → Delete Project → Delete the now-empty Client → Return to Client list.

The first attempted Client deletion demonstrates the domain guard through persistent guidance and never opens a misleading confirmation for an operation the repository will reject. ProjectTable gains an Actions column only when this flow is implemented. Because Delete project is its sole row action, the table uses a direct danger IconButton with a contextual accessible name rather than introducing a one-item Menu. Trash2 joins the approved icon map and remains decorative inside the named control.

Delete Project and Delete Client both use Alert Dialog and non-optimistic mutations. Removing a Project returns focus to the next row's delete action, then the previous row's action, or Add project when the list becomes empty. After deleting the Client, its detail route is no longer valid; the application navigates to `/clients`, focuses the list-page heading, and announces `Client deleted`.

The repository exposes `deleteProject(projectId)` and `deleteClient(clientId)` without a cascade option. Client deletion atomically rechecks its Project dependency and removal, including in the localStorage/MSW implementation. A current dependency returns the typed `CLIENT_HAS_PROJECTS` conflict with the current count; a missing target returns typed `NOT_FOUND`.

Infrastructure failure keeps Alert Dialog open with persistent Retry feedback. `NOT_FOUND` closes the stale confirmation, revalidates the affected data, and informs the user that the record no longer exists. Neither deletion is optimistic. Success updates or evicts the exact cache records first and then revalidates related queries.

### 11.22 Sixth-tracer acceptance scenarios

The sixth tracer is complete only when all of the following hold:

1. Delete client while Projects exist does not open a misleading confirmation and instead exposes persistent guidance containing the current Project count.
2. Delete project opens a correctly named Alert Dialog with Cancel as its initial focus target.
3. Cancel and Escape dismiss safely and restore focus; backdrop interaction does not dismiss the confirmation.
4. Pending deletion prevents every dismissal path and duplicate mutation while maintaining stable focus and feedback.
5. Infrastructure failure keeps the confirmation and context open and provides a working Retry action.
6. `NOT_FOUND` closes the stale confirmation, revalidates the row away, communicates the changed state, and moves focus to the approved logical fallback.
7. Successful Project deletion removes and persists the record, refreshes related data, and focuses the next action, previous action, or Add project according to the approved order.
8. After the list becomes empty, Delete client opens its confirmation; a newly detected `CLIENT_HAS_PROJECTS` conflict closes or updates the unsafe path and restores the blocked-deletion guidance.
9. Successful Client deletion evicts its caches, persists removal, navigates to `/clients`, focuses the page heading, and announces `Client deleted`.
10. The complete flow passes with keyboard-only and representative screen-reader use at 320px, 200 percent zoom, in RTL, with reduced motion, and in all eight brand, resolved color-scheme, and density combinations.

### 11.23 Seventh tracer

The seventh vertical slice is:

> Client list → Filter by relationship status → Combine with search → Clear filters → Restore the complete list.

The application-owned Filter Bar composes Search Field, Field, Select, and Button without becoming a registry component. Its Status options are All clients, Active, and Inactive. All clients is the default and is omitted from the URL; the other values use `status=active` or `status=inactive`. An unsupported URL value is ignored and canonicalized by removing the parameter.

Query and status combine with AND semantics. Search retains its approved debounce and normalization, while changing status requests data immediately. Clear filters removes both `q` and `status` in one navigation update and restores the complete list. Version 1 has no facet counts, multi-select filters, saved filter sets, or generic filter-builder abstraction.

After a request settles, a visible result summary uses the correct singular or plural count and is announced politely without announcing every keystroke. No results copy reflects the active criteria: query-only names the query, status-only names the relationship status, and the combined state names both. Query-only offers Clear search; every state containing a status filter offers Clear filters. Clear filters removes `q` and `status` through one history-replacing navigation. Any future pagination will reset on a criterion change, but pagination is not introduced in version 1.

### 11.24 Seventh-tracer acceptance scenarios

The seventh tracer is complete only when all of the following hold:

1. Relationship Status retains its confirmed value while a change is pending, and selecting that current value causes no mutation.
2. Status-change success updates detail, list, and affected filtered caches; failure preserves the confirmed status and exposes a retryable persistent Alert.
3. Opening a URL with valid `q` and `status` initializes both controls and loads the combined result directly.
4. An unsupported `status` is removed canonically without discarding a valid `q`.
5. Changing Status requests immediately, and an older response never replaces data for a newer set of criteria.
6. Query and Status use AND semantics while retaining the approved search normalization behavior.
7. Settled data shows the correct singular or plural result count and announces meaningful settled changes without keystroke-level noise.
8. Every query-only, status-only, and combined No results state names the active criteria and exposes the approved clearing action.
9. Clear filters removes both parameters in one history-replacing navigation, restores the complete list, and leaves focus at a logical stable target.
10. The flow passes with keyboard-only and representative screen-reader use at 320px, 200 percent zoom, in RTL, with reduced motion, and in all eight brand, resolved color-scheme, and density combinations.

## 12. Repository architecture

The project is planned as a pnpm and Turborepo monorepo:

~~~text
apps/
  docs/
  reference-crm/
packages/
  tokens/
  lint-config/
registry/
  ui/
  blocks/
  themes/
registry.json
~~~

Planned stack:

- Next.js App Router;
- React and TypeScript;
- Tailwind CSS v4;
- Base UI;
- pnpm workspaces;
- Turborepo;
- Biome for formatting and import organization;
- Oxlint for code linting and MFD design-system policy.

## 13. Registry and packages

### 13.1 Hybrid distribution

- Public `@mflisikowski/tokens` and `@mflisikowski/lint-config` npm packages provide generated token artifacts, programmatic contracts, and shared tool policy.
- The shadcn-compatible registry provides editable React source.
- Registry items may provide reusable UI, blocks, themes, and an optional integration setup item, with explicit npm and registry dependencies.
- React components are not also distributed as an opaque npm component package.
- Registry items declare runtime packages and registry dependencies.
- The repository remains the canonical authoring source.
- Component updates are explicit and documented rather than silently synchronized.
- The canonical source stays in the private monorepo; only approved package artifacts, registry output, and documentation are public.

### 13.2 Source and build output

- Root registry.json and registry source files are authored.
- The registry build emits installable JSON into apps/docs/public/r.
- Generated registry JSON is never manually edited.
- CI validates the source registry and dry-runs installation in a clean consumer project.
- Reference CRM consumes the public contract rather than importing private registry source.

Documentation may render the canonical registry source directly because it is an author-owned portal, but examples never maintain separate demonstration copies of components. Reference CRM is deliberately different: its `components/ui` contains shadcn-CLI-installed copies from the built local registry and never imports private `registry/` paths. Those installed copies are committed so review exposes the exact consumer result.

A dedicated `registry:sync` command performs Reference CRM updates for explicit review. CI rebuilds the registry, installs it into a clean consumer, and verifies that approved Reference CRM primitives have not drifted from the current intended installation. Application-owned forms, tables, and patterns are excluded from that equality check. Reference CRM does not customize installed primitives locally; a necessary primitive change returns to the canonical registry source first.

### 13.3 Registry versions

The configured `@mflisikowski` namespace resolves the latest stable items from `/r/{name}.json`. Every release also creates immutable item snapshots at `/r/v/{version}/{name}.json`; a published snapshot is never overwritten. Item metadata records its release version.

Before 1.0.0, registry items pin MFD npm packages to the exact matching release so installed source and token or lint contracts cannot drift silently. Documentation leads with namespace-based latest installation and also documents the complete snapshot URL for reproducible installation. Beta and canary channels remain deferred until a real release workflow requires them.

The public token package, lint-config package, and a private workspace representing registry release metadata belong to one Changesets fixed group. Every public release assigns the same version to all three, including when one artifact changes only because its coordinated dependency did. A registry snapshot therefore references MFD npm packages with its exact shared version.

### 13.4 Namespace

Working conventions:

- Product name: MFD Design System.
- Package scope: @mflisikowski.
- Registry namespace: @mflisikowski.
- Registry URL: https://design-system.mflisikowski.dev/r/{item}.json.

Availability of public names has not yet been verified.

## 14. Public portal and deployment

The repository remains private. Generic documentation and registry output are public. Client themes and assets remain private.

The public portal includes:

- introduction and principles;
- foundations;
- components;
- patterns;
- themes;
- changelog;
- link to the Reference CRM;
- registry JSON endpoints.

Portal content is authored as local versioned MDX in `apps/docs` using App Router and Server Components by default. Interactive examples are small explicit client islands. The portal does not maintain a parallel Storybook.

Every component page documents maturity, purpose, anatomy, public API, states, accessibility, keyboard behavior, content guidance, examples, installation, and related patterns. Behavioral contracts and API explanation are authored deliberately. Simple prop tables may be generated from the public types, but CI verifies them against exported APIs. Live examples render the real canonical registry implementation rather than documentation-only copies.

The portal documents the latest stable contract rather than cloning all documentation for each 0.x release. Pages identify maturity and the version in which the item was introduced. Deprecations name a replacement and removal plan, while the changelog carries migration guidance. Immutable historical registry snapshots remain installable without receiving frozen copies of the whole portal. Parallel versioned documentation begins only when two major versions must be supported concurrently.

Primary navigation contains Foundations, Components, Patterns, Themes, Changelog, and a direct Reference CRM link. An explicit typed content manifest controls information architecture and ordering; filesystem or alphabetic order never defines the learning path. Wide screens use a left sidebar, long pages expose a local heading table of contents, and component or pattern pages receive Breadcrumb. Narrow screens use an application-owned native disclosure labelled `Browse docs`, not an otherwise unvalidated public Drawer.

Search and a command palette remain deferred until the portal exceeds approximately 25 pages or observed navigation difficulty justifies them. The documentation build rejects duplicate slugs, broken internal links, unlisted content, missing manifest targets, and invalid heading hierarchy.

Deployment uses two Vercel projects from the same monorepo:

- design-system.mflisikowski.dev for documentation and registry;
- crm.design-system.mflisikowski.dev for the independent Reference CRM.

The owner manages DNS.

Each project connects to the same repository with its own Root Directory: `apps/docs` and `apps/reference-crm`. Both may read declared workspace dependencies outside that directory, use Next.js framework detection and a Turborepo-filtered build, and skip deployments when neither the application nor its dependency graph changed.

The projects remain separate origins. Documentation does not rewrite or proxy a `/reference` path to Reference CRM. Registry endpoints under `/r/*` exist only in the documentation project, and the demo-session cookie is scoped to the CRM origin; the two applications share no runtime session or client state.

In production, each application links directly to the other's canonical custom domain in the same browsing context. Preview deployments use Vercel Related Projects to resolve the corresponding deployment from the same revision, with the production domain as fallback when a paired preview is unavailable.

## 15. Linting and agent policy

### 15.1 Tool ownership

- Biome formats code and organizes imports.
- Oxlint performs TypeScript and React linting.
- @shadcn/lint supplies executable design-system rules.
- ESLint is the fallback only if the Oxlint integration proves unreliable.

The initial validated spike used:

- @shadcn/lint 0.1.1;
- Oxlint 1.80.0;
- Tailwind CSS 4.3.3;
- pnpm 10.28.2.

Versions are pinned and upgraded deliberately.

### 15.2 Initial rule policy

Errors:

- no-restyle;
- no-raw-colors;
- no-arbitrary-values;
- no-inline-styles;
- require-static-classes.

Warning until theme and custom utilities stabilize:

- no-unknown-classes.

Intended scope:

- Reference CRM: strict.
- Documentation application: strict for executable UI and examples; prose is excluded.
- Registry source: token and class rules remain enabled, while rules that prevent a component from defining its own internals are overridden.
- Generated registry output: ignored.
- Future internal applications: strict.
- Public consumers: documented and recommended, but not enforceable by MFD.

### 15.3 Exceptions

An exception:

- uses the smallest possible scope;
- contains an inline reason;
- remains visible in review;
- is counted so that the exception total cannot grow unnoticed;
- requires owner approval when it ships in a public component.

### 15.4 Agent feedback

Custom lint messages should explain:

- what contract was violated;
- why the rule exists;
- what approved API, variant, token, or layout mechanism to use;
- where the relevant public documentation lives.

The shared policy lives in packages/lint-config. An optional registry setup item may install dependencies and provide an example configuration without silently overwriting a consumer's existing linter config.

### 15.5 Fallback threshold

Return to ESLint only if Oxlint integration:

- repeatedly fails to load in CI;
- produces nondeterministic or stale results;
- cannot express a correct component contract without unavoidable false positives;
- cannot resolve the monorepo applications and components;
- blocks upgrades without a working pinned version.

## 16. Governance

- A small core owner group approves public APIs, tokens, and breaking changes.
- Product teams propose additions and changes.
- Local edits to registry-installed source are allowed, but create divergence and lose automatic alignment with MFD updates.
- A new component needs demonstrated use in the Reference CRM.
- Exceptions and deviations are documented.
- Brand accessibility is protected by automated gates plus manual review; invalid brand values are rejected rather than silently corrected.

The public generic system uses the MIT license. Client-specific themes, fonts, logos, and assets are excluded from public distribution.

## 17. Component Definition of Done

A component joins the system only when it has:

- validated use in a Reference CRM flow;
- semantic token mapping;
- an accessibility-ready Figma specification;
- a React implementation;
- documented anatomy and public API;
- all valid states and no fabricated invalid state combinations;
- keyboard and focus-visible behavior;
- examples for Atlas and Bloom in light and dark schemes;
- behavioral tests;
- narrow-viewport and long-content verification;
- a registry item;
- installation documentation;
- passing lint and registry validation.

## 18. Release strategy

The first public release is 0.1.0 after the Add Client tracer is complete. Subsequent planned milestones are 0.2.0 for Client details and Projects, 0.3.0 for Appearance and runtime theming, 0.4.0 for Client search and editing, and 0.5.0 for destructive flows and relationship-status filtering. These are scope targets rather than date commitments.

The specification's term version 1 means the approved initial functional scope and does not promise semver 1.0.0. Version 1.0.0 requires stable public APIs, complete quality gates, and validation by a second real consumer rather than only Reference CRM.

Each release publishes matching npm artifacts, latest registry items, and immutable registry snapshots as one coordinated release unit. A failure in any required artifact prevents promotion of that version to latest.

Changesets is the sole source of release intent, semantic-version bump, and package changelog entries. Pull requests that affect public APIs, tokens, lint policy, or registry output require a changeset through a path-aware CI check; documentation-only and internal-only changes may explicitly omit one. Versions are not inferred from commit syntax.

Changesets Action maintains a single Release PR that exposes version changes, changelogs, and the complete artifact set for review. Only manually merging that PR after every release quality gate passes may start publishing. The workflow creates the coordinated tag and GitHub Release and publishes the public npm packages through npm Trusted Publishing with OIDC instead of a long-lived write token. Because the canonical repository is private, the project makes no npm provenance claim under npm's current provenance limitations.

Release promotion follows build, publish, verify, then promote. After the Release PR merges, CI reruns every quality gate, builds and packs all npm and registry artifacts, inspects package contents, and installs the immutable registry snapshot into a clean consumer. It publishes npm packages through OIDC, waits until their exact versions resolve publicly, and repeats the clean snapshot installation against those public packages. Only then may both matching Vercel deployments become production, the latest registry alias advance, and the coordinated tag and GitHub Release become final.

Vercel Deployment Checks gate production promotion on this release status. If the available Vercel plan cannot provide the required gate, the release workflow explicitly promotes the already-built deployments only after artifact verification. Any failure leaves the previous production deployments and latest registry alias active.

A normal rollback never overwrites or removes immutable release artifacts. Both Vercel applications and the registry latest alias return to the previous approved release; npm's `latest` dist-tag returns to the previous package versions; the faulty versions are deprecated with a corrective message; and their immutable snapshots and GitHub Release remain as annotated history. The correction receives a new patch version. An active security incident follows a separate emergency procedure rather than this routine rollback.

Documentation labels every item as:

- stable;
- experimental;
- planned;
- deprecated.

Maturity has operational meaning:

- `planned` is an approved direction without an installable item;
- `experimental` is installable and exercised by Reference CRM, but its API may change in a subsequent pre-1.0 minor release;
- `stable` has completed the component Definition of Done and receives the documented compatibility protection, including before 1.0 within the stated pre-1.0 policy;
- `deprecated` still works but names its replacement, planned removal version, and installation warning.

Every registry item has exactly one explicitly reviewed maturity; the release number does not infer it automatically. Every maturity transition appears in the changelog.

Getting Started first configures the `@mflisikowski` namespace. Component pages lead with latest installation such as `pnpm dlx shadcn@latest add @mflisikowski/button` and expose a secondary reproducible-install option using the complete immutable snapshot URL. They list npm and registry dependencies explicitly.

Copy controls copy only the command, announce completion politely, and never move focus. Code examples identify filename and language and contain horizontal overflow within the block. New-project and existing-project instructions are separate. CI executes every published installation command in clean consumers so documentation cannot retain untested snippets.

Updates to @shadcn/lint and other young infrastructure are not merged automatically. Each upgrade must pass:

1. Reference CRM;
2. registry source;
3. clean-project registry installation;
4. diagnostic comparison;
5. lockfile review.

## 19. Quality gates

Required automated and manual gates include:

- build, typecheck, formatting, and lint;
- component behavior tests;
- registry validation and clean installation;
- token reference, completeness, and generation checks;
- contrast checks against real token pairs;
- keyboard and focus testing;
- automated accessibility audit;
- zoom, reflow, long-content, and reduced-motion checks;
- visual review of both brands and both color schemes.

Passing Figma validation alone is never a runtime accessibility claim.

### 19.1 Test layers

Vitest in its Node environment tests pure functions, validation schemas, repositories, normalization, token transforms, and lint rules. Public component behavior runs in Vitest Browser Mode with the Playwright provider so focus, keyboard events, DOM, and CSS use a real browser rather than a simulated DOM. Chromium component tests run for every pull request; Firefox and WebKit join the release gate.

Playwright Test owns complete flows against running applications, including routing, cookies, hydration, responsive behavior, and clean registry installation. Chromium flow tests run for every pull request; Chromium, Firefox, and WebKit run before release. Approved tracer states receive `@axe-core/playwright` scans, but automated results never replace manual screen-reader, zoom, touch, contrast, and cognitive review. Jest, Cypress, and a parallel jsdom component suite are not part of version 1.

### 19.2 Visual regression

Playwright screenshot assertions compare committed baselines in one pinned Linux CI environment. Pull requests cover representative component states and key screens in Atlas Light Comfortable and Bloom Dark Compact. Release gates cover the key screen of every completed tracer in all eight brand, resolved color-scheme, and density combinations. Functional cross-browser tests remain broader; automated screenshot comparison uses only Chromium, supplemented by representative manual Firefox, WebKit, and device review.

Visual fixtures use self-hosted fonts, deterministic data and time, fixed viewports, disabled animation, and stable rendering inputs. A baseline changes only in the pull request containing the intentional visual change and requires visual review. CI never updates snapshots after a failure, and the suite has no global tolerance that can conceal systematic differences; any narrow exception is documented beside the affected assertion.
