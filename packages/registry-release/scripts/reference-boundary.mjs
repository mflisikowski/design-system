import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function walkSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if ([".next", ".turbo", "node_modules", "test-results"].includes(entry.name)) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkSourceFiles(entryPath)));
    } else if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

/**
 * @param {string} source
 * @returns {string[]}
 */
function importSpecifiers(source) {
  const specifiers = /** @type {string[]} */ ([]);
  const pattern = /(?:from\s*|import\s*\(|require\s*\()\s*["']([^"']+)["']/g;
  for (const match of source.matchAll(pattern)) {
    specifiers.push(match[1]);
  }
  return specifiers;
}

/**
 * @param {string} appDirectory
 * @param {string} registryOutputDirectory
 * @returns {Promise<string[]>}
 */
async function approvedItemNames(appDirectory, registryOutputDirectory) {
  const manifestPath = path.join(appDirectory, "registry-installed.json");
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    return manifest.items;
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
      throw error;
    }
  }

  return (await readdir(registryOutputDirectory))
    .filter((name) => name.endsWith(".json") && name !== "registry.json")
    .map((name) => name.slice(0, -".json".length));
}

/**
 * @param {string} appDirectory
 * @param {string} target
 */
async function resolveInstalledTarget(appDirectory, target) {
  const match = target.match(/^@(components|ui|lib|hooks)\/(.+)$/);
  if (!match) {
    return path.join(appDirectory, target);
  }

  const config = JSON.parse(await readFile(path.join(appDirectory, "components.json"), "utf8"));
  const alias = config.aliases?.[match[1]];
  if (typeof alias !== "string" || !alias.startsWith("@/")) {
    throw new Error(`Cannot resolve installed target ${target}.`);
  }

  return path.join(appDirectory, alias.slice(2), match[2]);
}

/**
 * @param {{ appDirectory: string; registryOutputDirectory: string }} options
 * @returns {Promise<string[]>}
 */
export async function inspectReferenceBoundary({ appDirectory, registryOutputDirectory }) {
  const findings = /** @type {string[]} */ ([]);
  const repositoryRoot = path.resolve(appDirectory, "../..");
  const privateRegistryRoot = path.join(repositoryRoot, "registry");

  for (const sourcePath of await walkSourceFiles(appDirectory)) {
    const source = await readFile(sourcePath, "utf8");
    for (const specifier of importSpecifiers(source)) {
      const resolved = specifier.startsWith(".")
        ? path.resolve(path.dirname(sourcePath), specifier)
        : undefined;
      if (
        specifier === "registry" ||
        specifier.startsWith("registry/") ||
        specifier.includes("/registry/") ||
        (resolved &&
          (resolved === privateRegistryRoot || resolved.startsWith(`${privateRegistryRoot}/`)))
      ) {
        findings.push(
          `private registry source import in ${path.relative(appDirectory, sourcePath)}: ${specifier}`,
        );
      }
    }
  }

  for (const itemName of await approvedItemNames(appDirectory, registryOutputDirectory)) {
    const itemPath = path.join(registryOutputDirectory, `${itemName}.json`);
    const item = JSON.parse(await readFile(itemPath, "utf8"));

    for (const file of item.files ?? []) {
      if (!file.target || typeof file.content !== "string") {
        continue;
      }

      const installedPath = await resolveInstalledTarget(appDirectory, file.target);
      let installedContent;
      try {
        installedContent = await readFile(installedPath, "utf8");
      } catch (error) {
        if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
          throw error;
        }
      }

      if (installedContent !== file.content) {
        findings.push(
          `installed primitive drift: ${path.relative(appDirectory, installedPath)} differs from ${itemName}`,
        );
      }
    }
  }

  return findings.sort();
}
