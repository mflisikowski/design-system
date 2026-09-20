import { describe, expect, it } from "vitest";

import {
  classifyPublicImpact,
  evaluateChangesetPolicy,
  isChangesetFile,
} from "./changeset-policy.mjs";

describe("changeset policy", () => {
  it("does not require a changeset for documentation and internal application work", () => {
    const result = evaluateChangesetPolicy([
      "docs/specification.md",
      "apps/docs/app/page.tsx",
      "apps/reference-crm/app/page.tsx",
      "tools/quality/package.json",
    ]);

    expect(result.required).toBe(false);
    expect(result.satisfied).toBe(true);
  });

  it("requires a changeset for every public contract boundary", () => {
    expect(
      classifyPublicImpact([
        "packages/tokens/src/colors.json",
        "packages/lint-config/index.mjs",
        "registry/ui/button.tsx",
        "registry.json",
      ]).map(({ label }) => label),
    ).toEqual([
      "public token contract",
      "public lint policy",
      "public registry contract",
      "public registry contract",
    ]);
  });

  it("accepts a real changeset when a public contract changes", () => {
    const result = evaluateChangesetPolicy([
      "packages/tokens/src/colors.json",
      ".changeset/bright-colors.md",
    ]);

    expect(result.satisfied).toBe(true);
    expect(result.changesets).toEqual([".changeset/bright-colors.md"]);
  });

  it("does not treat the Changesets README as release intent", () => {
    expect(isChangesetFile(".changeset/README.md")).toBe(false);
    expect(
      evaluateChangesetPolicy(["registry/ui/button.tsx", ".changeset/README.md"]).satisfied,
    ).toBe(false);
  });
});
