import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

/** @typedef {{ file: string, line: number, message: string }} ExceptionDiagnostic */
/** @typedef {{ count?: number, file: string, line?: number, reason: string, rule: string }} ExceptionRecord */
/** @typedef {{ absolutePath: string, relativePath: string }} SourceFile */

const approvedRules = new Set([
  "shadcn/no-arbitrary-values",
  "shadcn/no-inline-styles",
  "shadcn/no-raw-colors",
  "shadcn/no-restyle",
  "shadcn/no-unknown-classes",
  "shadcn/require-static-classes",
]);

/**
 * @param {string} file
 * @param {number} line
 * @param {string} message
 * @returns {ExceptionDiagnostic}
 */
function diagnostic(file, line, message) {
  return { file, line, message };
}

/**
 * @param {string} source
 * @param {string} file
 */
export function inspectLintExceptions(source, file) {
  const diagnostics = [];
  const exceptions = [];

  for (const [index, lineText] of source.split("\n").entries()) {
    const comment = lineText
      .trim()
      .match(/^(?:\/\/|\/\*|\*|\{\/\*)\s*((?:eslint|oxlint)-disable(?:-next-line|-line)?\b.*)$/);
    if (!comment) continue;

    const directive = comment[1].replace(/\*\/.*$/, "").trim();
    if (!directive.includes("shadcn/")) continue;

    const line = index + 1;
    if (!directive.startsWith("oxlint-disable-next-line ")) {
      diagnostics.push(
        diagnostic(
          file,
          line,
          "Use oxlint-disable-next-line for MFD lint exceptions so the suppression cannot escape the justified statement.",
        ),
      );
      continue;
    }

    const body = directive.slice("oxlint-disable-next-line ".length);
    const separator = body.indexOf(" -- ");
    const ruleText = (separator === -1 ? body : body.slice(0, separator)).trim();

    if (!/^shadcn\/[a-z-]+$/.test(ruleText)) {
      diagnostics.push(
        diagnostic(file, line, "An MFD lint exception must suppress exactly one shadcn rule."),
      );
      continue;
    }

    if (!approvedRules.has(ruleText)) {
      diagnostics.push(
        diagnostic(file, line, `The exception targets unapproved rule ${ruleText}.`),
      );
      continue;
    }

    if (separator === -1 || !body.slice(separator + 4).startsWith("MFD exception:")) {
      diagnostics.push(
        diagnostic(
          file,
          line,
          "An MFD lint exception requires an inline reason after `-- MFD exception:`.",
        ),
      );
      continue;
    }

    const reason = body.slice(separator + 4 + "MFD exception:".length).trim();
    if (reason.length < 20) {
      diagnostics.push(
        diagnostic(
          file,
          line,
          "An MFD lint exception needs a specific reason of at least 20 characters.",
        ),
      );
      continue;
    }

    exceptions.push({ file, line, reason, rule: ruleText });
  }

  return { diagnostics, exceptions };
}

/** @param {ExceptionRecord} exception */
function exceptionKey({ file, reason, rule }) {
  return JSON.stringify([file, rule, reason]);
}

/** @param {ExceptionRecord[]} exceptions */
function countExceptions(exceptions) {
  const counts = new Map();

  for (const exception of exceptions) {
    const key = exceptionKey(exception);
    counts.set(key, (counts.get(key) ?? 0) + (exception.count ?? 1));
  }

  return counts;
}

/**
 * @param {ExceptionRecord[]} exceptions
 * @param {ExceptionRecord[]} baseline
 */
export function compareExceptionBaseline(exceptions, baseline) {
  const diagnostics = [];
  const actualCounts = countExceptions(exceptions);
  const baselineCounts = countExceptions(baseline);
  const checkedActual = new Set();

  for (const exception of exceptions) {
    const key = exceptionKey(exception);
    if (checkedActual.has(key)) continue;
    checkedActual.add(key);
    const actual = actualCounts.get(key) ?? 0;
    const reviewed = baselineCounts.get(key) ?? 0;
    if (actual <= reviewed) continue;

    diagnostics.push(
      diagnostic(
        exception.file,
        exception.line ?? 1,
        `Found ${actual - reviewed} unreviewed MFD lint exception(s) for ${exception.rule}; update the exception baseline only after owner review.`,
      ),
    );
  }

  const checkedBaseline = new Set();
  for (const exception of baseline) {
    const key = exceptionKey(exception);
    if (checkedBaseline.has(key)) continue;
    checkedBaseline.add(key);
    const actual = actualCounts.get(key) ?? 0;
    const reviewed = baselineCounts.get(key) ?? 0;
    if (actual >= reviewed) continue;

    diagnostics.push(
      diagnostic(
        exception.file,
        1,
        `The reviewed exception baseline is stale for ${exception.rule}; remove or reduce this entry.`,
      ),
    );
    baselineCounts.delete(key);
  }

  return { diagnostics, total: exceptions.length };
}

const ignoredDirectoryNames = new Set([
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
]);
const sourceExtensions = new Set([".cjs", ".cts", ".js", ".jsx", ".mjs", ".mts", ".ts", ".tsx"]);

/**
 * @param {string} directory
 * @param {string} root
 * @param {SourceFile[]} files
 */
async function collectSourceFiles(directory, root, files) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectoryNames.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectSourceFiles(absolutePath, root, files);
      continue;
    }

    if (!entry.isFile() || !sourceExtensions.has(path.extname(entry.name))) continue;
    files.push({
      absolutePath,
      relativePath: path.relative(root, absolutePath).split(path.sep).join("/"),
    });
  }
}

/**
 * @param {string} root
 * @param {string} [baselinePath]
 */
export async function checkExceptionRepository(
  root,
  baselinePath = path.join(root, ".mfd-lint-exceptions.json"),
) {
  /** @type {SourceFile[]} */
  const files = [];
  await collectSourceFiles(root, root, files);
  files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));

  const diagnostics = [];
  const exceptions = [];
  for (const file of files) {
    const result = inspectLintExceptions(
      await readFile(file.absolutePath, "utf8"),
      file.relativePath,
    );
    diagnostics.push(...result.diagnostics);
    exceptions.push(...result.exceptions);
  }

  /** @type {{ exceptions?: ExceptionRecord[] }} */
  const baselineDocument = JSON.parse(await readFile(baselinePath, "utf8"));
  if (!Array.isArray(baselineDocument.exceptions)) {
    throw new TypeError(`${baselinePath} must contain an exceptions array.`);
  }

  const comparison = compareExceptionBaseline(exceptions, baselineDocument.exceptions);
  return {
    diagnostics: [...diagnostics, ...comparison.diagnostics],
    exceptions,
    total: comparison.total,
  };
}
