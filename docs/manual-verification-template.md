# Manual verification record

Copy this template into the pull request or release evidence for every approved tracer. Automated browser and axe results complement this record; they do not replace it.

## Test context

- Commit or build:
- URL:
- Tester and date:
- Operating system:
- Browser and version:
- Device, viewport, and input method:
- Brand / color scheme / density:
- Flow and states covered:

## Screen reader

- [ ] Record the screen reader, browser, and versions used.
- [ ] Navigate from the document start without a pointer and record the announced landmarks, headings, names, roles, states, descriptions, and errors.
- [ ] Confirm reading and focus order follow the visual task order.
- [ ] Confirm dynamic feedback is announced once, at the intended urgency, without moving focus unexpectedly.
- Evidence and findings:

## Zoom and reflow

- [ ] Check browser zoom at 200% and 400%.
- [ ] Check reflow at a 320 CSS-pixel viewport without two-dimensional scrolling, clipped controls, or hidden information except where the content itself requires it.
- [ ] Confirm focus indicators, validation messages, dialogs, and sticky regions remain visible and usable.
- Evidence and findings:

## Touch and pointer

- [ ] Use a representative touch device or device mode and record it.
- [ ] Confirm controls have an effective minimum 44 × 44 CSS-pixel target and adequate separation.
- [ ] Complete the flow without hover and confirm gestures have a simple alternative.
- Evidence and findings:

## Contrast and non-color cues

- [ ] Measure every new foreground/background, boundary, focus, and interactive-state pair against its actual rendered background.
- [ ] Check the required brand, color-scheme, and density matrix, including forced or system-selected states used by the flow.
- [ ] Confirm status, selection, validation, and focus never rely on color alone.
- Tool, measurements, and findings:

## Right-to-left direction

- [ ] Set the document direction to RTL and repeat the critical path.
- [ ] Confirm logical spacing, alignment, reading order, keyboard order, and directional icons behave intentionally.
- [ ] Confirm user-entered data with mixed writing directions remains understandable.
- Evidence and findings:

## Long and localized content

- [ ] Test long names, headings, labels, descriptions, errors, and unbroken strings.
- [ ] Confirm wrapping, truncation, overflow, accessible names, and full-value access remain intentional.
- [ ] Check that translated-length expansion does not obscure actions or change task order.
- Evidence and findings:

## Reduced motion

- [ ] Enable the operating system's reduced-motion preference before loading the page.
- [ ] Confirm decorative motion is removed or reduced and no information depends on animation.
- [ ] Confirm theme changes, loading, validation, and route changes preserve focus and remain understandable.
- Evidence and findings:

## Cognitive and completion review

- [ ] Confirm instructions, labels, errors, recovery actions, and destructive consequences are clear in the complete flow.
- [ ] Record unresolved issues with an owner and follow-up ticket; do not mark the tracer verified while a release-blocking issue remains.
- Overall result: pass / fail
- Follow-up tickets:
