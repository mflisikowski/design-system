import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { applicationRules, createOxlintConfig, registryRules } from "../src/policy.mjs";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * @param {string} relativePath
 * @param {string} [cwd]
 */
function runFixture(relativePath, cwd = packageDirectory) {
  const result = spawnSync(
    path.join(packageDirectory, "node_modules/.bin/oxlint"),
    ["--format", "json", "--config", path.join(packageDirectory, "oxlint.json"), relativePath],
    {
      cwd,
      encoding: "utf8",
    },
  );
  /** @type {{ diagnostics: { code: string, message: string, severity: string }[] }} */
  const report = JSON.parse(result.stdout);

  return {
    ...result,
    output: `${result.stdout}${result.stderr}`,
    report,
  };
}

describe("MFD design-system lint policy", () => {
  it("publishes the approved application severities and the narrow registry ownership override", () => {
    expect(applicationRules).toEqual({
      "shadcn/no-arbitrary-values": "error",
      "shadcn/no-inline-styles": "error",
      "shadcn/no-raw-colors": "error",
      "shadcn/no-restyle": ["error", { allow: ["layout"] }],
      "shadcn/no-unknown-classes": "warn",
      "shadcn/require-static-classes": "error",
    });
    expect(registryRules).toEqual({
      "shadcn/no-restyle": "off",
    });

    expect(createOxlintConfig()).toMatchObject({
      jsPlugins: ["@shadcn/lint"],
      settings: {
        shadcn: {
          note: expect.stringContaining("semantic tokens"),
        },
      },
      rules: applicationRules,
      overrides: [
        {
          files: ["**/registry/**/*.{js,jsx,ts,tsx}"],
          rules: registryRules,
        },
      ],
    });
  });

  it("keeps the published Oxlint preset identical to the programmatic policy", async () => {
    const publishedConfig = JSON.parse(
      await readFile(path.join(packageDirectory, "oxlint.json"), "utf8"),
    );

    expect(publishedConfig).toEqual(createOxlintConfig());
  });

  it.each([
    ["no-restyle", "error"],
    ["no-raw-colors", "error"],
    ["no-arbitrary-values", "error"],
    ["no-inline-styles", "error"],
    ["require-static-classes", "error"],
    ["no-unknown-classes", "warning"],
  ])("reports invalid %s usage at %s severity with actionable guidance", (rule, severity) => {
    const result = runFixture(`test/fixtures/application/invalid/${rule}.tsx`);
    const diagnostic = result.report.diagnostics.find((entry) => entry.code === `shadcn(${rule})`);

    expect(result.status).toBe(severity === "error" ? 1 : 0);
    expect(diagnostic).toMatchObject({ code: `shadcn(${rule})`, severity });
    expect(diagnostic?.message).toContain("semantic tokens");
    expect(diagnostic?.message).toContain("docs/specification.md#15-linting-and-agent-policy");
  });

  it.each([
    "no-restyle",
    "no-raw-colors",
    "no-arbitrary-values",
    "no-inline-styles",
    "require-static-classes",
    "no-unknown-classes",
  ])("accepts the valid %s fixture", (rule) => {
    const result = runFixture(`test/fixtures/application/valid/${rule}.tsx`);

    expect(result.status).toBe(0);
    expect(result.report.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: `shadcn(${rule})` }),
    );
  });

  it("lets registry source define component internals without weakening token rules", () => {
    const ownershipFixture = path.join(packageDirectory, "test/fixtures/ownership");
    const applicationResult = runFixture("app/restyle.tsx", ownershipFixture);
    const registryResult = runFixture("registry/restyle.tsx", ownershipFixture);
    const registryRawColorResult = runFixture("registry/raw-color.tsx", ownershipFixture);

    expect(applicationResult.status).toBe(1);
    expect(applicationResult.report.diagnostics).toContainEqual(
      expect.objectContaining({ code: "shadcn(no-restyle)" }),
    );
    expect(registryResult.status).toBe(0);
    expect(registryResult.report.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "shadcn(no-restyle)" }),
    );
    expect(registryRawColorResult.status).toBe(1);
    expect(registryRawColorResult.report.diagnostics).toContainEqual(
      expect.objectContaining({ code: "shadcn(no-raw-colors)" }),
    );
  });
});
