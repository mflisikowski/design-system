import { mkdir, mkdtemp, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { removeDevelopmentSnapshot } from "../scripts/snapshot-utils.mjs";

describe("release snapshot cleanup", () => {
  it("removes mutable 0.0.0 output before an immutable release", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "mfd-snapshot-cleanup-"));
    const publicRoot = path.join(root, "public", "r");
    const durableRoot = path.join(root, "durable", "v");
    await mkdir(path.join(publicRoot, "v", "0.0.0"), { recursive: true });
    await mkdir(path.join(durableRoot, "0.0.0"), { recursive: true });
    await mkdir(path.join(durableRoot, "0.0.1"), { recursive: true });
    await writeFile(path.join(publicRoot, "v", "0.0.0", "sample.json"), "{}\n");
    await writeFile(path.join(durableRoot, "0.0.0", "sample.json"), "{}\n");
    await writeFile(path.join(durableRoot, "0.0.1", "sample.json"), "{}\n");

    await removeDevelopmentSnapshot({
      publicRoot,
      durableRoot,
      releaseVersion: "0.1.0",
    });

    await expect(readdir(path.join(publicRoot, "v"))).resolves.toEqual([]);
    await expect(readdir(durableRoot)).resolves.toEqual(["0.0.1"]);
  });

  it("keeps the development snapshot while preparing development output", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "mfd-snapshot-cleanup-"));
    const publicRoot = path.join(root, "public", "r");
    const durableRoot = path.join(root, "durable", "v");
    await mkdir(path.join(publicRoot, "v", "0.0.0"), { recursive: true });
    await mkdir(path.join(durableRoot, "0.0.0"), { recursive: true });

    await removeDevelopmentSnapshot({
      publicRoot,
      durableRoot,
      releaseVersion: "0.0.0",
    });

    await expect(readdir(path.join(publicRoot, "v"))).resolves.toEqual(["0.0.0"]);
    await expect(readdir(durableRoot)).resolves.toEqual(["0.0.0"]);
  });
});
