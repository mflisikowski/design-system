import { describe, expect, it } from "vitest";

import { safeReturnTo } from "../../lib/demo-session";

describe("demo session return-to", () => {
  it("keeps local application paths including their query", () => {
    expect(safeReturnTo("/clients?view=all")).toBe("/clients?view=all");
  });

  it.each([undefined, "", "https://evil.example", "//evil.example", "/\\evil.example"])(
    "falls back for unsafe destination %s",
    (destination) => {
      expect(safeReturnTo(destination)).toBe("/clients");
    },
  );
});
