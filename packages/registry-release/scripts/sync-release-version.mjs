import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageDirectory, "../..");
const registryPath = path.join(repositoryRoot, "registry/ui/registry.json");

const releaseManifest = JSON.parse(
  await readFile(path.join(packageDirectory, "package.json"), "utf8"),
);
const tokensManifest = JSON.parse(
  await readFile(path.join(repositoryRoot, "packages/tokens/package.json"), "utf8"),
);
const lintConfigManifest = JSON.parse(
  await readFile(path.join(repositoryRoot, "packages/lint-config/package.json"), "utf8"),
);
if (
  releaseManifest.version !== tokensManifest.version ||
  releaseManifest.version !== lintConfigManifest.version
) {
  throw new Error(
    "Registry release, token package, and lint-config versions must match before synchronization.",
  );
}

const releaseVersion = releaseManifest.version;
const registry = JSON.parse(await readFile(registryPath, "utf8"));
for (const item of registry.items) {
  item.meta.version = releaseVersion;
  if (item.meta.installation?.snapshot) {
    item.meta.installation.snapshot = item.meta.installation.snapshot.replace(
      /\/r\/v\/[^/]+\//,
      `/r/v/${releaseVersion}/`,
    );
  }
  if (Array.isArray(item.dependencies)) {
    item.dependencies = item.dependencies.map((/** @type {string} */ dependency) =>
      dependency.startsWith("@mflisikowski/tokens@")
        ? `@mflisikowski/tokens@${releaseVersion}`
        : dependency,
    );
  }
}

await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Synchronized registry release metadata to ${releaseVersion}.`);
