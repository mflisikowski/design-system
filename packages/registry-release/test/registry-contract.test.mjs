import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(packageDirectory, "../../..");

/** @param {string} relativePath */
async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repositoryRoot, relativePath), "utf8"));
}

describe("canonical registry sample contract", () => {
  it("declares exact MFD, external, registry, maturity, and installation metadata", async () => {
    const releaseManifest = await readJson("packages/registry-release/package.json");
    const releaseVersion = releaseManifest.version;
    const registry = await readJson("registry.json");
    const uiRegistry = await readJson("registry/ui/registry.json");
    const sample = uiRegistry.items.find(
      (/** @type {{ name: string }} */ item) => item.name === "registry-sample",
    );
    const supporting = uiRegistry.items.find(
      (/** @type {{ name: string }} */ item) => item.name === "registry-sample-label",
    );

    expect(registry.include).toContain("registry/ui/registry.json");
    expect(sample).toMatchObject({
      dependencies: [`@mflisikowski/tokens@${releaseVersion}`, "clsx@2.1.1"],
      registryDependencies: ["@mflisikowski/registry-sample-label"],
      meta: {
        maturity: "experimental",
        version: releaseVersion,
        installation: {
          latest: "pnpm dlx shadcn@latest add @mflisikowski/registry-sample",
          snapshot: `pnpm dlx shadcn@latest add https://design-system.mflisikowski.dev/r/v/${releaseVersion}/registry-sample.json`,
        },
      },
    });
    expect(supporting).toMatchObject({
      dependencies: [],
      registryDependencies: [],
      docs: expect.any(String),
      meta: {
        maturity: "experimental",
        version: releaseVersion,
        installation: {
          latest: "pnpm dlx shadcn@latest add @mflisikowski/registry-sample-label",
          snapshot: `pnpm dlx shadcn@latest add https://design-system.mflisikowski.dev/r/v/${releaseVersion}/registry-sample-label.json`,
        },
      },
    });
  });

  it("publishes every Reference CRM foundation with reviewed metadata", async () => {
    const releaseManifest = await readJson("packages/registry-release/package.json");
    const uiRegistry = await readJson("registry/ui/registry.json");
    const items = new Map(
      uiRegistry.items.map((/** @type {{ name: string }} */ item) => [item.name, item]),
    );

    for (const name of ["button", "icon", "link", "alert", "empty-state", "table"]) {
      expect(items.get(name)).toMatchObject({
        dependencies: expect.arrayContaining([
          `@mflisikowski/tokens@${releaseManifest.version}`,
          "clsx@2.1.1",
        ]),
        docs: expect.any(String),
        meta: {
          maturity: "experimental",
          version: releaseManifest.version,
          installation: {
            latest: `pnpm dlx shadcn@latest add @mflisikowski/${name}`,
            snapshot: `pnpm dlx shadcn@latest add https://design-system.mflisikowski.dev/r/v/${releaseManifest.version}/${name}.json`,
          },
        },
      });

      await expect(readJson(`apps/docs/public/r/${name}.json`)).resolves.toMatchObject({ name });
      await expect(
        readJson(`apps/docs/public/r/v/${releaseManifest.version}/${name}.json`),
      ).resolves.toMatchObject({ name });
    }
  });

  it("emits latest and immutable snapshot items with reproducible internal dependencies", async () => {
    const releaseManifest = await readJson("packages/registry-release/package.json");
    const releaseVersion = releaseManifest.version;
    const latest = await readJson("apps/docs/public/r/registry-sample.json");
    const snapshot = await readJson(`apps/docs/public/r/v/${releaseVersion}/registry-sample.json`);
    const durableSnapshot = await readJson(
      `registry/snapshots/v/${releaseVersion}/registry-sample.json`,
    );

    expect(latest.registryDependencies).toEqual(["@mflisikowski/registry-sample-label"]);
    expect(snapshot.registryDependencies).toEqual([
      `https://design-system.mflisikowski.dev/r/v/${releaseVersion}/registry-sample-label.json`,
    ]);
    expect(snapshot.files).toEqual(latest.files);
    expect(durableSnapshot).toEqual(snapshot);
  });
});
