import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { run } from "./run-process.mjs";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageDirectory, "../..");
const publicRegistryRoot = path.join(repositoryRoot, "apps/docs/public/r");
const tokensDirectory = path.join(repositoryRoot, "packages/tokens");
const shadcnBinary = path.join(packageDirectory, "node_modules/.bin/shadcn");
const typescriptBinary = path.join(packageDirectory, "node_modules/.bin/tsc");
const releaseVersion = JSON.parse(
  await readFile(path.join(packageDirectory, "package.json"), "utf8"),
).version;

/**
 * @param {string} directory
 * @param {string} fixture
 */
async function createConsumerFixture(directory, fixture) {
  await mkdir(path.join(directory, "src/components/ui"), { recursive: true });
  await mkdir(path.join(directory, "src/lib"), { recursive: true });
  await writeFile(path.join(directory, "src/globals.css"), "/* Fixture stylesheet. */\n");
  await writeFile(
    path.join(directory, "package.json"),
    `${JSON.stringify(
      {
        name: `mfd-registry-${fixture}-fixture`,
        version: "0.0.0",
        private: true,
        packageManager: "pnpm@12.5.1",
        dependencies: {
          react: "19.3.0",
        },
        devDependencies: {
          "@types/react": "19.3.0",
          typescript: "7.0.2",
        },
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    path.join(directory, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          jsx: "react-jsx",
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          paths: { "@/*": ["./src/*"] },
          skipLibCheck: true,
          strict: true,
          target: "ES2022",
        },
        include: ["src/**/*.ts", "src/**/*.tsx"],
      },
      null,
      2,
    )}\n`,
  );

  if (fixture === "existing-project") {
    await writeFile(
      path.join(directory, "src/components/ui/existing.tsx"),
      "export function Existing() { return <span>Preserve me</span>; }\n",
    );
  }
}

/** @param {string} pathname */
function contentType(pathname) {
  return pathname.endsWith(".json") ? "application/json" : "application/octet-stream";
}

/** @param {string} [registryOutputDirectory] */
export async function verifyCleanInstallFixtures(registryOutputDirectory = publicRegistryRoot) {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "mfd-registry-install-"));
  const packDirectory = path.join(temporaryRoot, "pack");
  await mkdir(packDirectory, { recursive: true });

  try {
    await run("corepack", ["pnpm", "--filter", "@mflisikowski/tokens", "build"], {
      cwd: repositoryRoot,
    });
    await run(
      "corepack",
      ["pnpm", "--filter", "@mflisikowski/tokens", "pack", "--pack-destination", packDirectory],
      { cwd: repositoryRoot },
    );
    const archiveName = (await readdir(packDirectory)).find((name) => name.endsWith(".tgz"));
    if (!archiveName) {
      throw new Error("Token package archive was not created.");
    }
    const archivePath = path.join(packDirectory, archiveName);
    const archive = await readFile(archivePath);
    const integrity = `sha512-${createHash("sha512").update(archive).digest("base64")}`;
    const shasum = createHash("sha1").update(archive).digest("hex");
    const tokenManifest = JSON.parse(
      await readFile(path.join(tokensDirectory, "package.json"), "utf8"),
    );

    const server = createServer(async (request, response) => {
      try {
        const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
        const address = server.address();
        if (!address || typeof address === "string") {
          throw new Error("Fixture server address is unavailable.");
        }
        const origin = `http://127.0.0.1:${address.port}`;

        if (
          requestUrl.pathname.includes("mflisikowski") &&
          requestUrl.pathname.endsWith("tokens")
        ) {
          response.setHeader("content-type", "application/json");
          response.end(
            JSON.stringify({
              name: tokenManifest.name,
              "dist-tags": { latest: tokenManifest.version },
              versions: {
                [tokenManifest.version]: {
                  name: tokenManifest.name,
                  version: tokenManifest.version,
                  dependencies: { "@terrazzo/token-types": "2.7.1" },
                  dist: {
                    integrity,
                    shasum,
                    tarball: `${origin}/npm/tokens/-/${archiveName}`,
                  },
                },
              },
            }),
          );
          return;
        }

        if (requestUrl.pathname === `/npm/tokens/-/${archiveName}`) {
          response.setHeader("content-type", "application/octet-stream");
          createReadStream(archivePath).pipe(response);
          return;
        }

        if (requestUrl.pathname.startsWith("/r/")) {
          const relativePath = requestUrl.pathname.slice("/r/".length);
          const filePath = path.resolve(registryOutputDirectory, relativePath);
          if (!filePath.startsWith(`${registryOutputDirectory}${path.sep}`)) {
            response.writeHead(403).end();
            return;
          }
          let content = await readFile(filePath, "utf8");
          if (relativePath.startsWith("v/")) {
            content = content.replaceAll("https://design-system.mflisikowski.dev", origin);
          }
          response.setHeader("content-type", contentType(filePath));
          response.end(content);
          return;
        }

        response.writeHead(404).end();
      } catch (error) {
        response.writeHead(500).end(error instanceof Error ? error.message : String(error));
      }
    });

    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => resolve(undefined));
    });

    try {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Fixture server address is unavailable.");
      }
      const origin = `http://127.0.0.1:${address.port}`;
      const results = [];

      for (const fixture of ["new-project", "existing-project"]) {
        const fixtureDirectory = path.join(temporaryRoot, fixture);
        await createConsumerFixture(fixtureDirectory, fixture);
        await writeFile(
          path.join(fixtureDirectory, "components.json"),
          `${JSON.stringify(
            {
              $schema: "https://ui.shadcn.com/schema.json",
              style: "base-nova",
              rsc: true,
              tsx: true,
              tailwind: {
                config: "",
                css: "src/globals.css",
                baseColor: "neutral",
                cssVariables: true,
                prefix: "",
              },
              iconLibrary: "lucide",
              aliases: {
                components: "@/components",
                ui: "@/components/ui",
                utils: "@/lib/utils",
                lib: "@/lib",
                hooks: "@/hooks",
              },
              registries: { "@mflisikowski": `${origin}/r/{name}.json` },
            },
            null,
            2,
          )}\n`,
        );
        await writeFile(
          path.join(fixtureDirectory, ".npmrc"),
          `@mflisikowski:registry=${origin}/npm/\nprefer-offline=true\n`,
        );

        const itemAddress =
          fixture === "new-project"
            ? "@mflisikowski/registry-sample"
            : `${origin}/r/v/${releaseVersion}/registry-sample.json`;
        await run(shadcnBinary, ["add", itemAddress, "--yes", "--cwd", fixtureDirectory], {
          cwd: fixtureDirectory,
          env: {
            ...process.env,
            COREPACK_ENABLE_PROJECT_SPEC: "0",
            npm_config_prefer_offline: "true",
          },
        });
        await run(typescriptBinary, ["--project", "tsconfig.json"], { cwd: fixtureDirectory });
        await access(path.join(fixtureDirectory, "src/components/ui/registry-sample.tsx"));
        await access(path.join(fixtureDirectory, "src/lib/registry-sample-label.ts"));
        const installedManifest = JSON.parse(
          await readFile(path.join(fixtureDirectory, "package.json"), "utf8"),
        );
        if (
          installedManifest.dependencies?.["@mflisikowski/tokens"] !== releaseVersion ||
          installedManifest.dependencies?.clsx !== "2.1.1"
        ) {
          throw new Error(`${fixture} did not retain the registry's exact package dependencies.`);
        }

        let preservedExistingFile = false;
        try {
          await access(path.join(fixtureDirectory, "src/components/ui/existing.tsx"));
          preservedExistingFile = true;
        } catch {
          preservedExistingFile = false;
        }
        results.push({ fixture, preservedExistingFile });
      }

      return results;
    } finally {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve(undefined)));
      });
    }
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}
