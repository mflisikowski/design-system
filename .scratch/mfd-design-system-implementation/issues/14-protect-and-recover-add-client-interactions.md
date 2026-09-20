# 14: Protect and recover Add Client interactions

**What to build:** Protect a User's Add Client work from accidental dismissal and provide accessible, retryable recovery from validation and server failures without losing entered values.

**Blocked by:** 13: Add a Client successfully.

**Status:** ready-for-agent

- [ ] Dirty dismissal uses the approved Alert Dialog behavior and preserves the form when cancellation is chosen.
- [ ] Pending submission prevents unsafe dismissal and duplicate actions while retaining understandable focus and announcements.
- [ ] Field errors map to the correct controls and server failures remain visible in a persistent retryable Alert.
- [ ] All eleven approved Add Client acceptance scenarios pass across the required theme and browser matrix.
