import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../../..");
const spikeRoot = path.join(repositoryRoot, "spikes/oxlint-shadcn-lint");

describe("Oxlint and shadcn lint compatibility fixture", () => {
  it("retains the pinned spike and its valid and invalid examples", async () => {
    const packageManifest = JSON.parse(
      await readFile(path.join(spikeRoot, "package.json"), "utf8"),
    );
    const [validFixture, invalidFixture, oxlintConfig] = await Promise.all([
      readFile(path.join(spikeRoot, "src/valid.tsx"), "utf8"),
      readFile(path.join(spikeRoot, "src/invalid.tsx"), "utf8"),
      readFile(path.join(spikeRoot, ".oxlintrc.json"), "utf8"),
    ]);

    expect(packageManifest.devDependencies).toMatchObject({
      "@shadcn/lint": "0.1.1",
      oxlint: "1.80.0",
      tailwindcss: "4.3.3",
    });
    expect(validFixture).toContain('className="mt-4 w-full"');
    expect(invalidFixture).toContain('className="bg-pink-500 p-[13px] hover:rounded-full"');
    expect(oxlintConfig).toContain("shadcn/no-restyle");
  });
});
