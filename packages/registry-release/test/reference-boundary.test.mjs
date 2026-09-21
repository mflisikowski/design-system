import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { inspectReferenceBoundary } from "../scripts/reference-boundary.mjs";

describe("Reference CRM registry boundary", () => {
  it("accepts a committed installed primitive that matches registry output", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "mfd-registry-boundary-"));
    const app = path.join(root, "apps/reference-crm");
    const registryOutput = path.join(root, "apps/docs/public/r");
    await mkdir(path.join(app, "components/ui"), { recursive: true });
    await mkdir(registryOutput, { recursive: true });
    await writeFile(
      path.join(app, "components/ui/registry-sample.tsx"),
      "export const RegistrySample = () => null;\n",
    );
    await writeFile(
      path.join(registryOutput, "registry-sample.json"),
      JSON.stringify({
        files: [
          {
            content: "export const RegistrySample = () => null;\n",
            target: "components/ui/registry-sample.tsx",
            type: "registry:ui",
          },
        ],
      }),
    );

    await expect(
      inspectReferenceBoundary({ appDirectory: app, registryOutputDirectory: registryOutput }),
    ).resolves.toEqual([]);
  });

  it("reports primitive drift and private registry-source imports", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "mfd-registry-boundary-"));
    const app = path.join(root, "apps/reference-crm");
    const registryOutput = path.join(root, "apps/docs/public/r");
    await mkdir(path.join(app, "components/ui"), { recursive: true });
    await mkdir(path.join(app, "features"), { recursive: true });
    await mkdir(registryOutput, { recursive: true });
    await writeFile(
      path.join(app, "components/ui/registry-sample.tsx"),
      "export const RegistrySample = () => 'changed';\n",
    );
    await writeFile(
      path.join(app, "features/private.ts"),
      'import { RegistrySample } from "../../../registry/ui/registry-sample";\n',
    );
    await writeFile(
      path.join(registryOutput, "registry-sample.json"),
      JSON.stringify({
        files: [
          {
            content: "export const RegistrySample = () => null;\n",
            target: "components/ui/registry-sample.tsx",
            type: "registry:ui",
          },
        ],
      }),
    );

    const findings = await inspectReferenceBoundary({
      appDirectory: app,
      registryOutputDirectory: registryOutput,
    });

    expect(findings).toEqual([
      expect.stringContaining("installed primitive drift"),
      expect.stringContaining("private registry source import"),
    ]);
  });
});
