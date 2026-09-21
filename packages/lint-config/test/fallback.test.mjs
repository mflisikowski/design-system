import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { evaluateOxlintFallback } from "../src/fallback.mjs";

describe("Oxlint fallback threshold", () => {
  it("does not permit ESLint for a transient load failure or ordinary diagnostics", () => {
    expect(evaluateOxlintFallback({ ciLoadFailures: 1 })).toEqual({
      permitted: false,
      reasons: [],
    });
    expect(evaluateOxlintFallback({})).toEqual({ permitted: false, reasons: [] });
  });

  it.each([
    [{ ciLoadFailures: 2 }, "repeated CI plugin load failures"],
    [{ nondeterministicOrStaleResults: true }, "nondeterministic or stale results"],
    [{ unavoidableFalsePositives: true }, "unavoidable component-contract false positives"],
    [{ monorepoResolutionFailure: true }, "monorepo resolution failure"],
    [
      { upgradeBlockedWithoutWorkingPinnedVersion: true },
      "upgrade blocked without a working pinned version",
    ],
  ])("permits evaluation only with documented evidence %#", (evidence, reason) => {
    expect(evaluateOxlintFallback(evidence)).toEqual({ permitted: true, reasons: [reason] });
  });

  it("keeps ESLint absent from the production package", async () => {
    const manifest = JSON.parse(
      await readFile(new URL("../package.json", import.meta.url), "utf8"),
    );

    expect(manifest.dependencies).not.toHaveProperty("eslint");
    expect(manifest.devDependencies).not.toHaveProperty("eslint");
  });
});
