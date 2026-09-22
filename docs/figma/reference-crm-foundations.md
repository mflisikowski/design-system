# Reference CRM foundation anatomy handoff

**Status:** Approved implementation specification for DS Core Library and DS Reference CRM.

This handoff records the Figma anatomy required by task 12. Repository tokens and the React
contracts remain canonical. An owner applies these structures in the DS Core Library, validates all
four brand/scheme color modes and both density modes, publishes manually, and then uses only
published instances in DS Reference CRM.

| Component | Anatomy | Component properties | Required prototype notes |
| --- | --- | --- | --- |
| Button | Container / optional Progress / Label | Variant: Accent, Neutral, Outline, Ghost, Danger; Size: Small, Medium, Large; Disabled; Loading | Loading retains focus, changes the visible label, and blocks repeated activation. |
| Icon | Glyph | Name; Size: Small, Medium, Large; Informational | Decorative is the default. Informational use requires an accessible-name annotation. |
| Icon Button | Container / Glyph | Size: Small, Medium, Large; Disabled | Every instance requires a contextual accessible-name annotation and a 44 px effective target. |
| Link | Text / optional inline content | Variant: Inline, Standalone | Preserve underline behavior, focus-visible treatment, and native link semantics. |
| Breadcrumb | Navigation / ordered list / item / link / separator / current | Current item; long-current truncation | Navigation landmark is labelled Breadcrumb. Separators are decorative; the final item is not a link and carries `aria-current="page"`. Keep Clients visible at narrow widths and preserve the full current value for assistive technology. |
| Page Header | Breadcrumb / title / optional description / optional actions | Description present; actions present | Render exactly one page `h1`. Actions wrap below the title below 640 px; the primary action is the only filled action. |
| Alert | Container / Title / Description / optional Action | Tone: Danger, Success; Action present | Live-region behavior is an annotation, not a visual variant. Alert never receives focus automatically. |
| Empty State | Container / optional Icon / Title / optional Description / optional Actions | Icon present; Description present; Actions: None, Primary, Primary and Secondary | Icon is decorative; Title is required; failure is not an Empty State. |
| Table | Table / Caption / Header / Row / Head / Body / Cell | Density mode only | Use native-table reading order. Loading skeleton keeps the table anatomy; empty and error states sit outside Body. |
| Field | Container / Label / optional Description / Control slot / optional Error | Invalid; Description present; Error present | Label names the slotted control. Description and Error are included in its accessible-description annotation. |
| Input | Control / Value | Size: Small, Medium, Large; Disabled; Read only | Compose only inside Field. Mobile text remains at least 16 CSS px and size follows the active density mode. |
| Textarea | Control / Value | Size: Small, Medium, Large; Disabled; Read only | Compose only inside Field. Height may grow by product context without changing the control contract. |
| Dialog | Backdrop / Content / Header / Title / Description / Body / Footer / Close | Size: Small, Medium, Large; Pending | Below 640 px, the same Content is full screen. Header and Footer remain visible while Body scrolls; pending blocks every close request. |
| Alert Dialog | Backdrop / Content / Title / Description / Footer / Cancel / Action | Pending | Destructive contexts place initial focus on Cancel. Escape cancels, backdrop never dismisses, and pending blocks Action, Cancel, Escape, and other close requests. |
| Toast | Container / Status icon / Message / Dismiss | Tone: Success | Runtime notes specify polite status semantics, four-second duration, at most three visible items, and queueing. |
| Badge | Container / Label | Tone: Neutral, Accent, Warning, Success, Danger; Size: Small, Medium | Non-interactive visible status text. Tone never carries meaning alone; Project Status maps Planned to neutral, Active to accent, On hold to warning, and Completed to success. |
| Select | Root / Trigger / Value / Icon / Content / Item | Size: Small, Medium, Large; Disabled; Read only; Invalid; Loading | Contextual accessible name includes the affected Project. Loading keeps the trigger focused, makes only the control read-only, and replaces the disclosure affordance with progress. Escape closes without committing. |
| Radio Group | Root / Item / Indicator; optional Radio Card / Preview / Label / Description | Orientation: Horizontal, Vertical; Disabled; Read only; Loading; Selected | One-value selection uses native radio semantics and roving focus. Selected and focus-visible states are not color-only; each option keeps a 44 px effective target. |

## Reference CRM frames

Create sign-in, Client loading, Client fetch error, Client empty, and Client populated frames at
wide and 320 px widths. The populated frame uses Client, Primary contact, Added, and Actions
columns. The narrow frame omits Added while retaining the same table structure. Annotate the skip
link as the first focusable element and the main region as its stable target.

Add Client is specified in wide default, wide invalid, wide submitting, wide success-return, and
320 px full-screen frames, plus dirty-dismissal confirmation, duplicate-email, and server-failure
states. Default has Organization name as the initial keyboard/pointer focus;
the mobile touch annotation places initial focus on Content. Invalid shows all three required-field
errors and Organization name focus. Dirty dismissal nests Alert Dialog with Keep editing focused;
cancel preserves values and restores the initiating focus, while Discard changes returns focus to
Add client. Duplicate email maps to Contact email. Server failure uses a persistent Alert with Try
again. Submitting marks the form busy, disables every control and close path, and replaces the
submit label with `Saving client`. Success returns to the populated Clients frame with the created
row first, Add client focused, and the polite `Client added` Toast.

The second-tracer Project frame is specified in Atlas and Bloom, light and dark, comfortable and
compact contexts. The populated frame includes Project and Status columns, with Updated omitted at
320 px. Show Planned, Active, On hold, and Completed as visible Badge labels; the status Select is
named for its Project. Annotate keyboard opening, arrow-key movement, Escape cancellation, pending
focus retention, success announcement, and persistent failure recovery.

## Review gate

Before publication, review focus-visible states, the non-color current-navigation indicator,
44 px targets, long organization names and email addresses, reduced motion, 200% zoom intent, and
all eight Atlas/Bloom × light/dark × comfortable/compact contexts. Publishing remains an
owner-controlled operation and is not performed by repository tooling.
