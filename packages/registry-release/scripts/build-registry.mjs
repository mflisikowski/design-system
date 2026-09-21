import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { directoriesEqual, pathExists } from "./snapshot-utils.mjs";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageDirectory, "../..");
const packageManifest = JSON.parse(
  await readFile(path.join(packageDirectory, "package.json"), "utf8"),
);
const releaseVersion = packageManifest.version;
const defaultPublicRoot = path.join(repositoryRoot, "apps/docs/public/r");
const defaultPackedRoot = path.join(packageDirectory, "dist/r");
const durableSnapshotsRoot = path.join(repositoryRoot, "registry/snapshots/v");
const shadcnBinary = path.join(packageDirectory, "node_modules/.bin/shadcn");

/**
 * @param {string | undefined} configuredPath
 * @param {string} defaultPath
 */
function resolveOutputRoot(configuredPath, defaultPath) {
  if (!configuredPath) {
    return defaultPath;
  }

  const resolvedPath = path.resolve(configuredPath);
  const temporaryRoot = path.resolve(os.tmpdir());
  if (
    resolvedPath !== defaultPath &&
    !resolvedPath.startsWith(`${temporaryRoot}${path.sep}mfd-registry-`)
  ) {
    throw new Error(`Refusing unsafe registry output path: ${resolvedPath}`);
  }
  return resolvedPath;
}

const publicRoot = resolveOutputRoot(process.env.MFD_REGISTRY_PUBLIC_ROOT, defaultPublicRoot);
const snapshotRoot = path.join(publicRoot, "v", releaseVersion);
const packedRoot = resolveOutputRoot(process.env.MFD_REGISTRY_PACKED_ROOT, defaultPackedRoot);
const registryOrigin = "https://design-system.mflisikowski.dev";

const tokensManifest = JSON.parse(
  await readFile(path.join(repositoryRoot, "packages/tokens/package.json"), "utf8"),
);
const lintConfigManifest = JSON.parse(
  await readFile(path.join(repositoryRoot, "packages/lint-config/package.json"), "utf8"),
);
const uiRegistry = JSON.parse(
  await readFile(path.join(repositoryRoot, "registry/ui/registry.json"), "utf8"),
);
const invalidVersionItems = uiRegistry.items.filter(
  (/** @type {{ meta?: { version?: string }, dependencies?: string[] }} */ item) =>
    item.meta?.version !== releaseVersion ||
    item.dependencies?.some(
      (dependency) =>
        dependency.startsWith("@mflisikowski/") && !dependency.endsWith(`@${releaseVersion}`),
    ),
);
if (
  tokensManifest.version !== releaseVersion ||
  lintConfigManifest.version !== releaseVersion ||
  invalidVersionItems.length > 0
) {
  throw new Error(
    `Registry release, public package, item metadata, and MFD dependency versions must all be ${releaseVersion}.`,
  );
}

/** @param {string[]} arguments_ */
function runShadcn(arguments_) {
  const result = spawnSync(shadcnBinary, arguments_, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.status !== 0) {
    throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n"));
  }
}

/** @param {string} directory */
async function rewriteSnapshotDependencies(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map(async (entry) => {
        const itemPath = path.join(directory, entry.name);
        const item = JSON.parse(await readFile(itemPath, "utf8"));

        if (Array.isArray(item.registryDependencies)) {
          item.registryDependencies = item.registryDependencies.map(
            (/** @type {string} */ dependency) => {
              const prefix = "@mflisikowski/";
              if (!dependency.startsWith(prefix)) {
                return dependency;
              }

              const itemName = dependency.slice(prefix.length);
              return `${registryOrigin}/r/v/${releaseVersion}/${itemName}.json`;
            },
          );
        }

        await writeFile(itemPath, `${JSON.stringify(item, null, 2)}\n`);
      }),
  );
}

const buildRoot = await mkdtemp(path.join(os.tmpdir(), "mfd-registry-build-"));
const latestBuildRoot = path.join(buildRoot, "latest");
const snapshotBuildRoot = path.join(buildRoot, "snapshot");

try {
  await mkdir(latestBuildRoot, { recursive: true });

  runShadcn(["registry", "validate", "registry.json"]);
  runShadcn(["build", "registry.json", "--output", latestBuildRoot]);

  await mkdir(snapshotBuildRoot, { recursive: true });
  for (const entry of await readdir(latestBuildRoot, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      await cp(path.join(latestBuildRoot, entry.name), path.join(snapshotBuildRoot, entry.name));
    }
  }
  await rewriteSnapshotDependencies(snapshotBuildRoot);

  await mkdir(path.join(publicRoot, "v"), { recursive: true });
  if (await pathExists(durableSnapshotsRoot)) {
    for (const entry of await readdir(durableSnapshotsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const durableSnapshot = path.join(durableSnapshotsRoot, entry.name);
      const publicSnapshot = path.join(publicRoot, "v", entry.name);
      if (await pathExists(publicSnapshot)) {
        if (
          !(entry.name === releaseVersion && releaseVersion === "0.0.0") &&
          !(await directoriesEqual(durableSnapshot, publicSnapshot))
        ) {
          throw new Error(`Public snapshot v/${entry.name} conflicts with its durable archive.`);
        }
      } else {
        await cp(durableSnapshot, publicSnapshot, { recursive: true });
      }
    }
  }

  const snapshotExists = await pathExists(snapshotRoot);
  if (
    snapshotExists &&
    releaseVersion !== "0.0.0" &&
    !(await directoriesEqual(snapshotRoot, snapshotBuildRoot))
  ) {
    throw new Error(`Refusing to overwrite immutable registry snapshot v/${releaseVersion}.`);
  }

  await mkdir(publicRoot, { recursive: true });
  for (const entry of await readdir(publicRoot, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      await rm(path.join(publicRoot, entry.name));
    }
  }
  for (const entry of await readdir(latestBuildRoot, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      await cp(path.join(latestBuildRoot, entry.name), path.join(publicRoot, entry.name));
    }
  }

  if (!snapshotExists || releaseVersion === "0.0.0") {
    await rm(snapshotRoot, { force: true, recursive: true });
    await mkdir(path.dirname(snapshotRoot), { recursive: true });
    await cp(snapshotBuildRoot, snapshotRoot, { recursive: true });
  }

  await rm(packedRoot, { force: true, recursive: true });
  await mkdir(path.join(packedRoot, "v"), { recursive: true });
  for (const entry of await readdir(latestBuildRoot, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      await cp(path.join(latestBuildRoot, entry.name), path.join(packedRoot, entry.name));
    }
  }
  if (await pathExists(durableSnapshotsRoot)) {
    for (const entry of await readdir(durableSnapshotsRoot, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        await cp(
          path.join(durableSnapshotsRoot, entry.name),
          path.join(packedRoot, "v", entry.name),
          {
            recursive: true,
          },
        );
      }
    }
  }
  const packedCurrentSnapshot = path.join(packedRoot, "v", releaseVersion);
  await rm(packedCurrentSnapshot, { force: true, recursive: true });
  await cp(snapshotBuildRoot, packedCurrentSnapshot, { recursive: true });
} finally {
  await rm(buildRoot, { force: true, recursive: true });
}

console.log(`Built registry latest and v/${releaseVersion} artifacts.`);
