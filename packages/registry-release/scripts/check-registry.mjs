import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { inspectReferenceBoundary } from "./reference-boundary.mjs";
import { run } from "./run-process.mjs";
import { verifyCleanInstallFixtures } from "./verify-clean-install.mjs";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageDirectory, "../..");
const releaseVersion = JSON.parse(
  await readFile(path.join(packageDirectory, "package.json"), "utf8"),
).version;

/** @param {string} directory */
async function artifactDigest(directory) {
  const entries = await readdir(directory, { withFileTypes: true, recursive: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(path.relative(directory, file));
    hash.update(await readFile(file));
  }
  return hash.digest("hex");
}

const verificationRoot = await mkdtemp(path.join(os.tmpdir(), "mfd-registry-build-"));
const firstPublicRoot = path.join(verificationRoot, "first/public/r");
const firstPackedRoot = path.join(verificationRoot, "first/dist/r");
const secondPublicRoot = path.join(verificationRoot, "second/public/r");
const secondPackedRoot = path.join(packageDirectory, "dist/r");
const historicalRelativePath = "v/99.99.99/registry-history-proof.json";
const historicalContents = '{"version":"99.99.99"}\n';

try {
  for (const outputRoot of [firstPublicRoot, secondPublicRoot]) {
    const historicalPath = path.join(outputRoot, historicalRelativePath);
    await mkdir(path.dirname(historicalPath), { recursive: true });
    await writeFile(historicalPath, historicalContents);
  }
  await run(process.execPath, [path.join(packageDirectory, "scripts/build-registry.mjs")], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      MFD_REGISTRY_PACKED_ROOT: firstPackedRoot,
      MFD_REGISTRY_PUBLIC_ROOT: firstPublicRoot,
    },
  });
  const firstDigest = await artifactDigest(firstPublicRoot);
  await run(process.execPath, [path.join(packageDirectory, "scripts/build-registry.mjs")], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      MFD_REGISTRY_PACKED_ROOT: secondPackedRoot,
      MFD_REGISTRY_PUBLIC_ROOT: secondPublicRoot,
    },
  });
  const secondDigest = await artifactDigest(secondPublicRoot);
  if (firstDigest !== secondDigest) {
    throw new Error("Registry build is not deterministic.");
  }
  if (
    (await readFile(path.join(secondPublicRoot, historicalRelativePath), "utf8")) !==
    historicalContents
  ) {
    throw new Error("Registry build removed or changed a historical immutable snapshot.");
  }

  const findings = await inspectReferenceBoundary({
    appDirectory: path.join(repositoryRoot, "apps/reference-crm"),
    registryOutputDirectory: secondPublicRoot,
  });
  if (findings.length > 0) {
    throw new Error(findings.join("\n"));
  }

  await verifyCleanInstallFixtures(secondPublicRoot);
} finally {
  await rm(verificationRoot, { force: true, recursive: true });
}

const packDirectory = await mkdtemp(path.join(os.tmpdir(), "mfd-registry-pack-"));
try {
  await run(
    "corepack",
    ["pnpm", "--filter", "@mflisikowski/tokens", "pack", "--pack-destination", packDirectory],
    { cwd: repositoryRoot },
  );
  await run(
    "corepack",
    ["pnpm", "--filter", "@mflisikowski/lint-config", "pack", "--pack-destination", packDirectory],
    { cwd: repositoryRoot },
  );
  await run(
    "corepack",
    [
      "pnpm",
      "--filter",
      "@mflisikowski/registry-release",
      "pack",
      "--pack-destination",
      packDirectory,
    ],
    { cwd: repositoryRoot },
  );
  const archives = (await readdir(packDirectory)).filter((name) => name.endsWith(".tgz"));
  if (archives.length !== 3) {
    throw new Error(`Expected three coordinated release archives, received ${archives.length}.`);
  }

  const registryArchive = archives.find((name) => name.includes("registry-release"));
  const lintConfigArchive = archives.find((name) => name.includes("lint-config"));
  const tokensArchive = archives.find((name) => name.includes("tokens"));
  if (!registryArchive || !lintConfigArchive || !tokensArchive) {
    throw new Error("Release archives do not identify every coordinated artifact.");
  }

  const registryListing = await run("tar", ["-tzf", path.join(packDirectory, registryArchive)], {
    cwd: repositoryRoot,
  });
  const tokenListing = await run("tar", ["-tzf", path.join(packDirectory, tokensArchive)], {
    cwd: repositoryRoot,
  });
  const lintConfigListing = await run(
    "tar",
    ["-tzf", path.join(packDirectory, lintConfigArchive)],
    { cwd: repositoryRoot },
  );
  for (const expected of [
    "package/dist/r/registry-sample.json",
    `package/dist/r/v/${releaseVersion}/registry-sample.json`,
  ]) {
    if (!registryListing.split("\n").includes(expected)) {
      throw new Error(`Registry archive is missing ${expected}.`);
    }
  }
  if (registryListing.split("\n").includes(`package/dist/r/${historicalRelativePath}`)) {
    throw new Error("Registry archive contains synthetic local snapshot data.");
  }
  for (const expected of ["package/dist/css/tokens.css", "package/dist/runtime/index.js"]) {
    if (!tokenListing.split("\n").includes(expected)) {
      throw new Error(`Token archive is missing ${expected}.`);
    }
  }
  if (!lintConfigListing.split("\n").includes("package/package.json")) {
    throw new Error("Lint-config archive is missing its package manifest.");
  }
} finally {
  await rm(packDirectory, { force: true, recursive: true });
}

console.log(
  "Registry source, deterministic output, consumer installs, boundary, and packs verified.",
);
