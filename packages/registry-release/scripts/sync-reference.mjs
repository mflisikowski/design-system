import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { run } from "./run-process.mjs";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageDirectory, "../..");
const appDirectory = path.join(repositoryRoot, "apps/reference-crm");
const publicRegistryRoot = path.join(repositoryRoot, "apps/docs/public/r");
const releaseVersion = JSON.parse(
  await readFile(path.join(packageDirectory, "package.json"), "utf8"),
).version;

await run(process.execPath, [path.join(packageDirectory, "scripts/build-registry.mjs")], {
  cwd: repositoryRoot,
  stdio: "inherit",
});

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Registry sync server address is unavailable.");
    }
    const origin = `http://127.0.0.1:${address.port}`;
    const relativePath = requestUrl.pathname.replace(/^\/r\//, "");
    const filePath = path.resolve(publicRegistryRoot, relativePath);
    if (!filePath.startsWith(`${publicRegistryRoot}${path.sep}`)) {
      response.writeHead(403).end();
      return;
    }
    const content = (await readFile(filePath, "utf8")).replaceAll(
      "https://design-system.mflisikowski.dev",
      origin,
    );
    response.setHeader("content-type", "application/json");
    response.end(content);
  } catch (error) {
    response.writeHead(404).end(error instanceof Error ? error.message : String(error));
  }
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => resolve(undefined));
});

try {
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Registry sync server address is unavailable.");
  }
  const itemUrl = `http://127.0.0.1:${address.port}/r/v/${releaseVersion}/registry-sample.json`;
  await run(
    path.join(packageDirectory, "node_modules/.bin/shadcn"),
    ["add", itemUrl, "--yes", "--overwrite", "--cwd", appDirectory],
    { cwd: appDirectory, stdio: "inherit" },
  );
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve(undefined)));
  });
}
