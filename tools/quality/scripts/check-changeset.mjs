import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { evaluateChangesetPolicy } from "../src/changeset-policy.mjs";

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

function localChanges() {
  return [
    ...git(["diff", "--name-only", "--diff-filter=ACMR"]),
    ...git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]),
    ...git(["ls-files", "--others", "--exclude-standard"]),
  ];
}

function pullRequestChanges(baseReference) {
  return git(["diff", "--name-only", "--diff-filter=ACMR", `${baseReference}...HEAD`]);
}

const baseReference =
  process.env.CHANGESET_BASE_REF ??
  (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : undefined);
const changedFiles = baseReference ? pullRequestChanges(baseReference) : localChanges();
const result = evaluateChangesetPolicy(changedFiles);

if (!result.required) {
  console.log("Changeset check passed: no public contract paths changed.");
  process.exit(0);
}

if (result.satisfied) {
  console.log(`Changeset check passed with ${result.changesets.join(", ")}.`);
  process.exit(0);
}

console.error("A changeset is required because this change affects public contracts:");
for (const impact of result.publicImpact) {
  console.error(`- ${impact.path} (${impact.label})`);
}
console.error("Run `pnpm changeset` and commit the generated markdown file.");
process.exit(1);
