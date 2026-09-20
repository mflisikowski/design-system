import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../../..");
const gate = process.argv[2];

const gates = {
  registry: {
    label: "Registry validation",
    sentinel: path.join(repositoryRoot, "registry.json"),
  },
  tokens: {
    label: "Token validation",
    sentinel: path.join(repositoryRoot, "packages/tokens/package.json"),
  },
};

const definition = gates[gate];

if (!definition) {
  console.error(`Unknown optional gate: ${gate ?? "(missing)"}`);
  process.exit(1);
}

if (!existsSync(definition.sentinel)) {
  console.log(`${definition.label}: not applicable until its canonical source exists.`);
  process.exit(0);
}

if (gate === "tokens") {
  const packageManifest = JSON.parse(readFileSync(definition.sentinel, "utf8"));
  if (packageManifest.scripts?.["tokens:check"]) {
    console.log(`${definition.label}: delegated to the package-owned Turbo task.`);
    process.exit(0);
  }
}

console.log(`${definition.label}: source exists; placeholder coverage remains active.`);
