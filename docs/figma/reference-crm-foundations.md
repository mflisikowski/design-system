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
| Alert | Container / Title / Description / optional Action | Tone: Danger, Success; Action present | Live-region behavior is an annotation, not a visual variant. Alert never receives focus automatically. |
| Empty State | Container / optional Icon / Title / optional Description / optional Actions | Icon present; Description present; Actions: None, Primary, Primary and Secondary | Icon is decorative; Title is required; failure is not an Empty State. |
| Table | Table / Caption / Header / Row / Head / Body / Cell | Density mode only | Use native-table reading order. Loading skeleton keeps the table anatomy; empty and error states sit outside Body. |

## Reference CRM frames

Create sign-in, Client loading, Client fetch error, Client empty, and Client populated frames at
wide and 320 px widths. The populated frame uses Client, Primary contact, Added, and Actions
columns. The narrow frame omits Added while retaining the same table structure. Annotate the skip
link as the first focusable element and the main region as its stable target.

## Review gate

Before publication, review focus-visible states, the non-color current-navigation indicator,
44 px targets, long organization names and email addresses, reduced motion, 200% zoom intent, and
all eight Atlas/Bloom × light/dark × comfortable/compact contexts. Publishing remains an
owner-controlled operation and is not performed by repository tooling.
