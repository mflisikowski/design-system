import { cp, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { run } from "./run-process.mjs";
import { directoriesEqual, pathExists, removeDevelopmentSnapshot } from "./snapshot-utils.mjs";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageDirectory, "../..");
const releaseVersion = JSON.parse(
  await readFile(path.join(packageDirectory, "package.json"), "utf8"),
).version;
const publicSnapshot = path.join(repositoryRoot, "apps/docs/public/r/v", releaseVersion);
const durableSnapshot = path.join(repositoryRoot, "registry/snapshots/v", releaseVersion);
const publicRoot = path.join(repositoryRoot, "apps/docs/public/r");
const durableRoot = path.join(repositoryRoot, "registry/snapshots/v");

await removeDevelopmentSnapshot({ publicRoot, durableRoot, releaseVersion });

await run(process.execPath, [path.join(packageDirectory, "scripts/build-registry.mjs")], {
  cwd: repositoryRoot,
  stdio: "inherit",
});

if (await pathExists(durableSnapshot)) {
  if (releaseVersion !== "0.0.0" && !(await directoriesEqual(durableSnapshot, publicSnapshot))) {
    throw new Error(`Refusing to replace durable registry snapshot v/${releaseVersion}.`);
  }
  if (releaseVersion === "0.0.0") {
    await rm(durableSnapshot, { force: true, recursive: true });
  }
}
if (!(await pathExists(durableSnapshot))) {
  await mkdir(path.dirname(durableSnapshot), { recursive: true });
  await cp(publicSnapshot, durableSnapshot, { recursive: true });
}

console.log(`Prepared durable registry snapshot v/${releaseVersion}.`);
