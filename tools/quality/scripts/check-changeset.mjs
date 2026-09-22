import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateChangesetPolicy,
  hasOnlyGeneratedManifestChanges,
  hasOnlyGeneratedRegistryMetadataChanges,
  isChangesetFile,
} from "../src/changeset-policy.mjs";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../../..");

function git(args) {
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** @param {string[]} lines */
function parseNameStatus(lines) {
  return lines.flatMap((line) => {
    const [rawStatus, ...paths] = line.split("\t");
    const status = rawStatus.charAt(0);
    if ((status === "R" || status === "C") && paths.length === 2) {
      return [
        { path: paths[0], status: "D" },
        { path: paths[1], status: "A" },
      ];
    }
    return paths[0] ? [{ path: paths[0], status }] : [];
  });
}

function localChanges() {
  return [
    ...parseNameStatus(git(["diff", "--name-status", "--diff-filter=ACMRD"])),
    ...parseNameStatus(git(["diff", "--cached", "--name-status", "--diff-filter=ACMRD"])),
    ...git(["ls-files", "--others", "--exclude-standard"]).map((path) => ({
      path,
      status: "A",
    })),
  ];
}

function pullRequestChanges(baseReference) {
  return parseNameStatus(
    git(["diff", "--name-status", "--diff-filter=ACMRD", `${baseReference}...HEAD`]),
  );
}

/**
 * @param {string} baseReference
 * @param {string} relativePath
 */
function readBaseJson(baseReference, relativePath) {
  return JSON.parse(
    execFileSync("git", ["show", `${baseReference}:${relativePath}`], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
}

/**
 * A release snapshot may be versioned while its tracer is being developed so the immutable
 * registry URL can be exercised before the release PR consumes its Changesets. In that case the
 * release commit still has to contain only generated release metadata and deleted Changesets.
 *
 * @param {Record<string, unknown>} baseManifest
 * @param {Record<string, unknown>} releaseManifest
 */
function isPreparedReleaseManifest(baseManifest, releaseManifest) {
  return JSON.stringify(baseManifest) === JSON.stringify(releaseManifest);
}

/** @param {string | undefined} baseReference */
function releaseState(baseReference) {
  if (!baseReference) {
    return { valid: false, version: undefined };
  }
  const readJson = (relativePath) =>
    JSON.parse(readFileSync(path.join(repositoryRoot, relativePath), "utf8"));
  const tokens = readJson("packages/tokens/package.json");
  const lintConfig = readJson("packages/lint-config/package.json");
  const registryRelease = readJson("packages/registry-release/package.json");
  const version = registryRelease.version;
  const registry = readJson("registry/ui/registry.json");
  const baseTokens = readBaseJson(baseReference, "packages/tokens/package.json");
  const baseLintConfig = readBaseJson(baseReference, "packages/lint-config/package.json");
  const baseRegistry = readBaseJson(baseReference, "registry/ui/registry.json");
  const snapshotPath = `registry/snapshots/v/${version}/registry-sample.json`;
  if (!existsSync(path.join(repositoryRoot, snapshotPath))) {
    return { valid: false, version };
  }
  const snapshot = readJson(snapshotPath);
  const itemsMatch = registry.items.every((item) => item.meta?.version === version);
  const mfdDependenciesMatch = registry.items.every((item) =>
    (item.dependencies ?? [])
      .filter((dependency) => dependency.startsWith("@mflisikowski/"))
      .every((dependency) => dependency.endsWith(`@${version}`)),
  );

  return {
    valid:
      version !== "0.0.0" &&
      tokens.version === version &&
      lintConfig.version === version &&
      itemsMatch &&
      mfdDependenciesMatch &&
      (hasOnlyGeneratedManifestChanges(baseTokens, tokens) ||
        isPreparedReleaseManifest(baseTokens, tokens)) &&
      (hasOnlyGeneratedManifestChanges(baseLintConfig, lintConfig) ||
        isPreparedReleaseManifest(baseLintConfig, lintConfig)) &&
      hasOnlyGeneratedRegistryMetadataChanges(baseRegistry, registry) &&
      snapshot.meta?.version === version,
    version,
  };
}

const baseReference =
  process.env.CHANGESET_BASE_REF ??
  (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : undefined);
const releaseMode = process.env.CHANGESET_RELEASE_PR === "true";
const releaseBaseReference = baseReference ?? (releaseMode ? "HEAD" : undefined);
const changes = baseReference ? pullRequestChanges(baseReference) : localChanges();
const currentRelease = releaseMode
  ? releaseState(releaseBaseReference)
  : { valid: false, version: undefined };
const result = evaluateChangesetPolicy(
  changes
    .filter(({ path, status }) => !(status === "D" && isChangesetFile(path)))
    .map(({ path }) => path),
  {
    deletedChangesets: changes.filter(({ status }) => status === "D").map(({ path }) => path),
    releaseMode,
    releaseStateValid: currentRelease.valid,
    releaseVersion: currentRelease.version,
  },
);

if (!result.required) {
  console.log("Changeset check passed: no public contract paths changed.");
  process.exit(0);
}

if (result.satisfied) {
  console.log(
    result.generatedRelease
      ? `Changeset check passed for generated release ${currentRelease.version}.`
      : `Changeset check passed with ${result.changesets.join(", ")}.`,
  );
  process.exit(0);
}

console.error("A changeset is required because this change affects public contracts:");
for (const impact of result.publicImpact) {
  console.error(`- ${impact.path} (${impact.label})`);
}
console.error("Run `pnpm changeset` and commit the generated markdown file.");
process.exit(1);
