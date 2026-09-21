import { describe, expect, it } from "vitest";

import {
  classifyPublicImpact,
  evaluateChangesetPolicy,
  hasOnlyGeneratedManifestChanges,
  hasOnlyGeneratedRegistryMetadataChanges,
  isChangesetFile,
  isGeneratedReleasePublicPath,
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

  it("accepts only a validated Changesets-generated release shape", () => {
    const generatedPaths = [
      "packages/tokens/package.json",
      "packages/lint-config/CHANGELOG.md",
      "registry/ui/registry.json",
      "registry/snapshots/v/0.1.0/registry-sample.json",
      "registry/snapshots/v/0.0.0/registry-sample.json",
    ];
    expect(generatedPaths.every((path) => isGeneratedReleasePublicPath(path, "0.1.0"))).toBe(true);
    expect(
      evaluateChangesetPolicy(generatedPaths, {
        deletedChangesets: [".changeset/released-change.md"],
        releaseMode: true,
        releaseStateValid: true,
        releaseVersion: "0.1.0",
      }).satisfied,
    ).toBe(true);
  });

  it("rejects a claimed release with source edits or incomplete release evidence", () => {
    const sourceEdit = ["registry/ui/button.tsx"];
    const releaseOptions = {
      deletedChangesets: [".changeset/released-change.md"],
      releaseMode: true,
      releaseStateValid: true,
      releaseVersion: "0.1.0",
    };

    expect(evaluateChangesetPolicy(sourceEdit, releaseOptions).satisfied).toBe(false);
    expect(
      evaluateChangesetPolicy(["packages/tokens/package.json"], {
        ...releaseOptions,
        releaseStateValid: false,
      }).satisfied,
    ).toBe(false);
    expect(
      evaluateChangesetPolicy(["packages/tokens/package.json"], {
        ...releaseOptions,
        deletedChangesets: [],
      }).satisfied,
    ).toBe(false);
  });

  it("allows only generated version fields in release JSON", () => {
    const baseManifest = {
      name: "@mflisikowski/tokens",
      scripts: { build: "tz build" },
      version: "0.0.0",
    };
    expect(
      hasOnlyGeneratedManifestChanges(baseManifest, { ...baseManifest, version: "0.1.0" }),
    ).toBe(true);
    expect(
      hasOnlyGeneratedManifestChanges(baseManifest, {
        ...baseManifest,
        scripts: { build: "unreviewed command" },
        version: "0.1.0",
      }),
    ).toBe(false);

    const baseRegistry = {
      items: [
        {
          dependencies: ["@mflisikowski/tokens@0.0.0", "clsx@2.1.1"],
          files: [{ path: "registry-sample.tsx" }],
          meta: {
            installation: { snapshot: "https://example.test/r/v/0.0.0/sample.json" },
            version: "0.0.0",
          },
          name: "sample",
        },
      ],
    };
    const releaseRegistry = structuredClone(baseRegistry);
    releaseRegistry.items[0].dependencies[0] = "@mflisikowski/tokens@0.1.0";
    releaseRegistry.items[0].meta.installation.snapshot =
      "https://example.test/r/v/0.1.0/sample.json";
    releaseRegistry.items[0].meta.version = "0.1.0";
    expect(hasOnlyGeneratedRegistryMetadataChanges(baseRegistry, releaseRegistry)).toBe(true);

    releaseRegistry.items[0].files[0].path = "unreviewed-source.tsx";
    expect(hasOnlyGeneratedRegistryMetadataChanges(baseRegistry, releaseRegistry)).toBe(false);
  });
});
