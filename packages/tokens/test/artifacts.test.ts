import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = path.join(packageDirectory, "dist");

const contextNames = [
  "atlas-dark-comfortable",
  "atlas-dark-compact",
  "atlas-light-comfortable",
  "atlas-light-compact",
  "bloom-dark-comfortable",
  "bloom-dark-compact",
  "bloom-light-comfortable",
  "bloom-light-compact",
];

async function artifactDigest() {
  const files: string[] = [];

  async function visit(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else {
        files.push(path.relative(distDirectory, absolutePath));
      }
    }
  }

  await visit(distDirectory);
  files.sort();

  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file);
    hash.update(await readFile(path.join(distDirectory, file)));
  }

  return hash.digest("hex");
}

describe("generated token artifacts", () => {
  it("emits complete runtime data for every resolver context", async () => {
    const files = (await readdir(path.join(distDirectory, "json")))
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(/\.json$/, ""))
      .sort();

    expect(files).toEqual(contextNames);

    const warningFallbacks = [
      "#faf1df",
      "#a68023",
      "#7d5e07",
      "#61490c",
      "#201704",
      "#8c6c1f",
      "#cb9d2a",
      "#e6c686",
    ];
    const emittedWarningFallbacks = new Set<string>();
    let expectedTokenSignature: string | undefined;

    for (const contextName of contextNames) {
      const artifact = JSON.parse(
        await readFile(path.join(distDirectory, "json", `${contextName}.json`), "utf8"),
      );
      const colorTokens = Object.values(artifact.tokens).filter(
        (token): token is { $type: string; $value: { hex: string } } =>
          (token as { $type?: string }).$type === "color",
      );

      expect(Object.keys(artifact.context).sort()).toEqual(["brand", "colorScheme", "density"]);
      expect(colorTokens.length).toBeGreaterThan(0);
      expect(colorTokens.every((token) => /^#[0-9a-f]{6}$/.test(token.$value.hex))).toBe(true);

      const tokenSignature = JSON.stringify(
        Object.fromEntries(
          Object.entries(artifact.tokens)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([id, token]) => [id, (token as { $type: string }).$type]),
        ),
      );
      expectedTokenSignature ??= tokenSignature;
      expect(tokenSignature).toBe(expectedTokenSignature);

      for (const role of ["bg", "border", "solid", "text"]) {
        emittedWarningFallbacks.add(artifact.tokens[`color.status.warning.${role}`].$value.hex);
      }
    }

    expect([...emittedWarningFallbacks].sort()).toEqual(warningFallbacks.sort());
  });

  it("provides MFD-prefixed runtime CSS for all eight context selectors", async () => {
    const css = await readFile(path.join(distDirectory, "css", "tokens.css"), "utf8");

    for (const contextName of contextNames) {
      const [brand, colorScheme, density] = contextName.split("-");
      expect(css).toContain(
        `:root[data-brand="${brand}"][data-color-scheme="${colorScheme}"][data-density="${density}"]`,
      );
    }

    expect(css).toContain("--mfd-color-bg-canvas:");
    expect(css).not.toMatch(/--color-bg-canvas:/);
  });

  it("exposes only property-appropriate semantic Tailwind utilities", async () => {
    const css = await readFile(path.join(distDirectory, "css", "tailwind.css"), "utf8");

    expect(css).toContain("@utility bg-canvas");
    expect(css).toContain("background-color: var(--mfd-color-bg-canvas)");
    expect(css).toContain("@utility text-primary");
    expect(css).toContain("color: var(--mfd-color-text-primary)");
    expect(css).toContain("@utility border-subtle");
    expect(css).toContain("border-color: var(--mfd-color-border-subtle)");
    expect(css).not.toContain("reference-color");
    expect(css).not.toMatch(
      /(?:slate|gray|blue|violet)-(?:50|100|200|300|400|500|600|700|800|900|950)/,
    );
  });

  it("exports a typed programmatic resolver", async () => {
    const declarations = await readFile(path.join(distDirectory, "index.d.ts"), "utf8");
    const module = await import(pathToFileURL(path.join(distDirectory, "index.js")).href);
    const resolved = module.resolver.apply({
      brand: "bloom",
      colorScheme: "dark",
      density: "compact",
    });

    expect(declarations).toContain("brand");
    expect(declarations).toContain("colorScheme");
    expect(declarations).toContain("density");
    expect(resolved["size.control-height.md"].$value).toEqual({ value: 32, unit: "px" });
  });

  it("emits a stable Figma manifest with canonical identities and aliases", async () => {
    const manifest = JSON.parse(
      await readFile(path.join(distDirectory, "figma", "variables.json"), "utf8"),
    );
    const variableIds = manifest.variables.map((variable: { id: string }) => variable.id);
    const semanticCanvas = manifest.variables.find(
      (variable: { id: string }) => variable.id === "color.bg.canvas",
    );

    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.sourceRevision).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(manifest.contentHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(manifest.collections.map((collection: { name: string }) => collection.name)).toEqual([
      "MFD Reference Color",
      "MFD Semantic Color",
      "MFD Density",
    ]);
    expect(variableIds).toEqual([...variableIds].sort());
    expect(new Set(variableIds).size).toBe(variableIds.length);
    expect(semanticCanvas.valuesByMode["atlas-light"]).toEqual({
      alias: "reference.color.neutral-light.1",
    });
    expect(semanticCanvas.scopes).toContain("FRAME_FILL");
    expect(semanticCanvas.codeSyntax.WEB).toBe("var(--mfd-color-bg-canvas)");
  });

  it("rebuilds byte-for-byte without artifact drift", async () => {
    const before = await artifactDigest();

    execFileSync(
      process.execPath,
      [
        path.join(packageDirectory, "node_modules", "@terrazzo", "cli", "bin", "cli.js"),
        "build",
        "--silent",
      ],
      {
        cwd: packageDirectory,
        stdio: "pipe",
      },
    );

    expect(await artifactDigest()).toBe(before);
  });
});

describe("component color usage validation", () => {
  it("rejects primitive colors while allowing semantic tokens", () => {
    const checker = path.join(packageDirectory, "tools", "check-component-token-usage.mjs");
    const invalid = spawnSync(process.execPath, [checker, "test/fixtures/invalid-primitive.tsx"], {
      cwd: packageDirectory,
      encoding: "utf8",
    });
    const valid = spawnSync(process.execPath, [checker, "test/fixtures/valid-semantic.tsx"], {
      cwd: packageDirectory,
      encoding: "utf8",
    });

    expect(invalid.status).toBe(1);
    expect(invalid.stderr).toContain("bg-blue-500");
    expect(invalid.stderr).toContain("oklch(");
    expect(invalid.stderr).toContain("#000");
    expect(invalid.stderr).toContain('color: "red');
    expect(valid.status).toBe(0);
  });
});
