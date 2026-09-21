import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkExceptionRepository } from "@mflisikowski/lint-config/exceptions";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../../..");
const exceptionResult = await checkExceptionRepository(repositoryRoot);

for (const entry of exceptionResult.diagnostics) {
  console.error(`${entry.file}:${entry.line}: error mfd(lint-exception): ${entry.message}`);
}

if (exceptionResult.diagnostics.length > 0) {
  process.exit(1);
}

console.log(`MFD lint exceptions: ${exceptionResult.total} reviewed.`);

const result = spawnSync("oxlint", ["--config", ".oxlintrc.json", "--deny-warnings", "."], {
  cwd: repositoryRoot,
  env: process.env,
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
