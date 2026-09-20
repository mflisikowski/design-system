import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../../..");
const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("A command is required.");
  process.exit(1);
}

const result = spawnSync(command, args, {
  cwd: repositoryRoot,
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
