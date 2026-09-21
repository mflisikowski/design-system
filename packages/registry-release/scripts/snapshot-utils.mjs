import { access, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

/** @param {string} targetPath */
export async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/** @param {string} directory */
async function relativeFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)))
    .sort();
}

/**
 * @param {string} left
 * @param {string} right
 */
export async function directoriesEqual(left, right) {
  const [leftFiles, rightFiles] = await Promise.all([relativeFiles(left), relativeFiles(right)]);
  if (leftFiles.join("\0") !== rightFiles.join("\0")) {
    return false;
  }

  const comparisons = await Promise.all(
    leftFiles.map(async (relativeFile) => {
      const [leftContent, rightContent] = await Promise.all([
        readFile(path.join(left, relativeFile)),
        readFile(path.join(right, relativeFile)),
      ]);
      return leftContent.equals(rightContent);
    }),
  );
  return comparisons.every(Boolean);
}

/**
 * Remove the mutable pre-release snapshot before creating the first immutable
 * release. Version 0.0.0 is development output, not a historical release.
 *
 * @param {{ publicRoot: string; durableRoot: string; releaseVersion: string }} options
 */
export async function removeDevelopmentSnapshot({ publicRoot, durableRoot, releaseVersion }) {
  if (releaseVersion === "0.0.0") {
    return;
  }

  await Promise.all([
    rm(path.join(publicRoot, "v", "0.0.0"), { force: true, recursive: true }),
    rm(path.join(durableRoot, "0.0.0"), { force: true, recursive: true }),
  ]);
}
