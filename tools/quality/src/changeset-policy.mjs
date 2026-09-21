const PUBLIC_IMPACT_RULES = [
  {
    label: "public token contract",
    matches: (path) => path.startsWith("packages/tokens/"),
  },
  {
    label: "public lint policy",
    matches: (path) => path.startsWith("packages/lint-config/"),
  },
  {
    label: "public registry contract",
    matches: (path) => path === "registry.json" || path.startsWith("registry/"),
  },
];

function normalizePath(path) {
  return path.replaceAll("\\", "/").replace(/^\.\//, "");
}

export function isChangesetFile(path) {
  const normalizedPath = normalizePath(path);

  return (
    /^\.changeset\/[^/]+\.md$/.test(normalizedPath) && normalizedPath !== ".changeset/README.md"
  );
}

export function classifyPublicImpact(paths) {
  return paths.flatMap((path) => {
    const normalizedPath = normalizePath(path);
    const rule = PUBLIC_IMPACT_RULES.find((candidate) => candidate.matches(normalizedPath));

    return rule ? [{ label: rule.label, path: normalizedPath }] : [];
  });
}

/**
 * @param {string} path
 * @param {string} releaseVersion
 */
export function isGeneratedReleasePublicPath(path, releaseVersion) {
  const normalizedPath = normalizePath(path);
  const snapshotPrefix = `registry/snapshots/v/${releaseVersion}/`;
  const snapshotFile = normalizedPath.startsWith(snapshotPrefix)
    ? normalizedPath.slice(snapshotPrefix.length)
    : "";
  const fixedPackageFiles = [
    "packages/tokens/package.json",
    "packages/tokens/CHANGELOG.md",
    "packages/lint-config/package.json",
    "packages/lint-config/CHANGELOG.md",
  ];

  return (
    fixedPackageFiles.includes(normalizedPath) ||
    normalizedPath === "registry/ui/registry.json" ||
    (snapshotFile.endsWith(".json") && !snapshotFile.includes("/"))
  );
}

/**
 * @param {Record<string, unknown>} baseManifest
 * @param {Record<string, unknown>} releaseManifest
 */
export function hasOnlyGeneratedManifestChanges(baseManifest, releaseManifest) {
  if (
    typeof baseManifest.version !== "string" ||
    typeof releaseManifest.version !== "string" ||
    baseManifest.version === releaseManifest.version
  ) {
    return false;
  }

  return isDeepStrictEqual(baseManifest, {
    ...releaseManifest,
    version: baseManifest.version,
  });
}

/** @param {string} dependency */
function mfdPackageName(dependency) {
  return dependency.match(/^(@mflisikowski\/[^@]+)@/)?.[1];
}

/**
 * @param {{ items?: Array<Record<string, any>> }} baseRegistry
 * @param {{ items?: Array<Record<string, any>> }} releaseRegistry
 */
export function hasOnlyGeneratedRegistryMetadataChanges(baseRegistry, releaseRegistry) {
  if (!Array.isArray(baseRegistry.items) || !Array.isArray(releaseRegistry.items)) {
    return false;
  }

  const normalizedRelease = structuredClone(releaseRegistry);
  const baseItems = new Map(baseRegistry.items.map((item) => [item.name, item]));
  for (const item of normalizedRelease.items) {
    const baseItem = baseItems.get(item.name);
    if (!baseItem) {
      return false;
    }
    item.meta.version = baseItem.meta.version;
    if (item.meta.installation?.snapshot && baseItem.meta.installation?.snapshot) {
      item.meta.installation.snapshot = baseItem.meta.installation.snapshot;
    }
    if (Array.isArray(item.dependencies)) {
      item.dependencies = item.dependencies.map((/** @type {string} */ dependency) => {
        const packageName = mfdPackageName(dependency);
        if (!packageName) {
          return dependency;
        }
        return (
          baseItem.dependencies?.find(
            (/** @type {string} */ baseDependency) =>
              mfdPackageName(baseDependency) === packageName,
          ) ?? dependency
        );
      });
    }
  }

  return isDeepStrictEqual(baseRegistry, normalizedRelease);
}

/**
 * @param {string[]} paths
 * @param {{ deletedChangesets?: string[]; releaseMode?: boolean; releaseStateValid?: boolean; releaseVersion?: string }} [options]
 */
export function evaluateChangesetPolicy(paths, options = {}) {
  const normalizedPaths = [...new Set(paths.map(normalizePath))].sort();
  const publicImpact = classifyPublicImpact(normalizedPaths);
  const changesets = normalizedPaths.filter(isChangesetFile);
  const deletedChangesets = (options.deletedChangesets ?? []).map(normalizePath);
  const generatedRelease =
    options.releaseMode === true &&
    options.releaseStateValid === true &&
    typeof options.releaseVersion === "string" &&
    deletedChangesets.some(isChangesetFile) &&
    publicImpact.every(({ path }) =>
      isGeneratedReleasePublicPath(path, /** @type {string} */ (options.releaseVersion)),
    );

  return {
    changesets,
    generatedRelease,
    publicImpact,
    required: publicImpact.length > 0,
    satisfied: publicImpact.length === 0 || changesets.length > 0 || generatedRelease,
  };
}

import { isDeepStrictEqual } from "node:util";
