import { readFile } from "node:fs/promises";

import { defineConfig, parse } from "@terrazzo/parser";
import { describe, expect, it } from "vitest";

const resolverUrl = new URL("../src/mfd.resolver.json", import.meta.url);
const config = defineConfig({}, { cwd: new URL("../", import.meta.url) });

async function loadResolver() {
  const source = JSON.parse(await readFile(resolverUrl, "utf8"));
  const { resolver } = await parse([{ filename: resolverUrl, src: source }], { config });

  if (!resolver) {
    throw new Error("Expected the canonical source to parse as a DTCG resolver.");
  }

  return resolver;
}

function tokenValue(tokens: Record<string, { $value: unknown }>, id: string) {
  const token = tokens[id];

  if (!token) {
    throw new Error(`Missing resolved token: ${id}`);
  }

  return token.$value;
}

describe("canonical token resolver", () => {
  it("resolves the Atlas/Bloom, light/dark, and comfortable/compact cross-product", async () => {
    const resolver = await loadResolver();

    const permutations = resolver.listPermutations?.();

    expect(permutations).toHaveLength(8);
    expect(permutations).toEqual(
      expect.arrayContaining([
        { brand: "atlas", colorScheme: "light", density: "comfortable" },
        { brand: "atlas", colorScheme: "light", density: "compact" },
        { brand: "atlas", colorScheme: "dark", density: "comfortable" },
        { brand: "atlas", colorScheme: "dark", density: "compact" },
        { brand: "bloom", colorScheme: "light", density: "comfortable" },
        { brand: "bloom", colorScheme: "light", density: "compact" },
        { brand: "bloom", colorScheme: "dark", density: "comfortable" },
        { brand: "bloom", colorScheme: "dark", density: "compact" },
      ]),
    );
    expect(resolver.orthogonal).toBe(true);
  });

  it("keeps brand, color scheme, and density as independent inputs", async () => {
    const resolver = await loadResolver();
    const atlasLightComfortable = resolver.apply({
      brand: "atlas",
      colorScheme: "light",
      density: "comfortable",
    });
    const bloomLightComfortable = resolver.apply({
      brand: "bloom",
      colorScheme: "light",
      density: "comfortable",
    });
    const atlasDarkComfortable = resolver.apply({
      brand: "atlas",
      colorScheme: "dark",
      density: "comfortable",
    });
    const atlasLightCompact = resolver.apply({
      brand: "atlas",
      colorScheme: "light",
      density: "compact",
    });

    expect(tokenValue(atlasLightComfortable, "reference.font.family.body")).toEqual([
      "Geist Sans",
      "sans-serif",
    ]);
    expect(tokenValue(bloomLightComfortable, "reference.font.family.body")).toEqual([
      "DM Sans",
      "sans-serif",
    ]);
    expect(tokenValue(atlasLightComfortable, "color.bg.canvas")).not.toEqual(
      tokenValue(atlasDarkComfortable, "color.bg.canvas"),
    );
    expect(tokenValue(atlasLightComfortable, "color.selection.bg")).not.toEqual(
      tokenValue(bloomLightComfortable, "color.selection.bg"),
    );
    expect(tokenValue(atlasLightComfortable, "size.control-height.md")).toEqual({
      value: 40,
      unit: "px",
    });
    expect(tokenValue(atlasLightCompact, "size.control-height.md")).toEqual({
      value: 32,
      unit: "px",
    });
    expect(tokenValue(atlasLightComfortable, "typography.body")).toEqual(
      tokenValue(atlasLightCompact, "typography.body"),
    );
  });

  it("encodes the approved foundation contracts", async () => {
    const resolver = await loadResolver();
    const atlasLight = resolver.apply({
      brand: "atlas",
      colorScheme: "light",
      density: "comfortable",
    });
    const bloomDark = resolver.apply({
      brand: "bloom",
      colorScheme: "dark",
      density: "compact",
    });

    expect(tokenValue(atlasLight, "reference.font.size.display")).toEqual({
      value: 40,
      unit: "px",
    });
    expect(tokenValue(atlasLight, "reference.font.line-height.display")).toBe(1.1);
    expect(tokenValue(atlasLight, "reference.font.weight.semi-bold")).toBe(600);
    expect(tokenValue(atlasLight, "reference.dimension.spacing.half")).toEqual({
      value: 2,
      unit: "px",
    });
    expect(tokenValue(atlasLight, "reference.dimension.spacing.1")).toEqual({
      value: 4,
      unit: "px",
    });
    expect(tokenValue(atlasLight, "reference.radius.scale.md")).toEqual({
      value: 6,
      unit: "px",
    });
    expect(tokenValue(bloomDark, "reference.radius.scale.md")).toEqual({
      value: 10,
      unit: "px",
    });
    expect(tokenValue(atlasLight, "elevation.overlay")).not.toEqual(
      tokenValue(bloomDark, "elevation.overlay"),
    );
    expect(tokenValue(atlasLight, "motion.duration.fast")).toEqual({
      value: 100,
      unit: "ms",
    });
    expect(tokenValue(atlasLight, "motion.easing.standard")).toEqual([0.2, 0, 0, 1]);
    expect(tokenValue(atlasLight, "motion.scale.pressed")).toBe(0.96);
    expect(tokenValue(atlasLight, "color.text.inverse")).toEqual(
      tokenValue(atlasLight, "reference.color.neutral-light.1"),
    );
    expect(tokenValue(atlasLight, "color.text.inverse")).not.toEqual(
      tokenValue(atlasLight, "color.text.primary"),
    );
    expect(tokenValue(atlasLight, "color.status.danger.text")).toMatchObject({
      colorSpace: "oklch",
      components: [0.42, 0.14, 25],
    });
    expect(tokenValue(atlasLight, "color.status.success.solid")).toMatchObject({
      colorSpace: "oklch",
      components: [0.535, 0.16, 145],
    });
    expect(tokenValue(bloomDark, "color.status.warning.border")).toMatchObject({
      colorSpace: "oklch",
      components: [0.55, 0.1, 85],
    });
  });

  it("uses the approved token path grammars without component exceptions", async () => {
    const resolver = await loadResolver();
    const tokens = resolver.apply({
      brand: "atlas",
      colorScheme: "light",
      density: "comfortable",
    });
    const tokenIds = Object.keys(tokens);

    expect(tokenIds.some((id) => id.startsWith("semantic."))).toBe(false);
    expect(tokenIds.some((id) => id.startsWith("component."))).toBe(false);
    expect(tokenIds).toEqual(
      expect.arrayContaining([
        "reference.color.neutral-light.1",
        "color.bg.canvas",
        "radius.control",
        "radius.surface",
        "radius.pill",
        "size.control-height.md",
        "typography.body",
      ]),
    );
    expect(tokenValue(tokens, "radius.control")).toEqual({ value: 6, unit: "px" });
    expect(tokenValue(tokens, "radius.surface")).toEqual({ value: 8, unit: "px" });
    expect(
      tokenIds.every((id) =>
        id.split(".").every((part) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part)),
      ),
    ).toBe(true);
    expect(
      tokenIds
        .filter((id) => id.startsWith("reference."))
        .every((id) => id.split(".").length === 4),
    ).toBe(true);
    expect(
      tokenIds
        .filter((id) => /^reference\.color\.(danger|success|warning)-/.test(id))
        .every((id) => ["2", "7", "9", "11"].includes(id.split(".").at(-1) ?? "")),
    ).toBe(true);
    expect(tokenIds.filter((id) => id.startsWith("color.status.danger."))).toEqual([
      "color.status.danger.bg",
      "color.status.danger.border",
      "color.status.danger.solid",
      "color.status.danger.text",
    ]);
  });

  it("authors every canonical color in structured OKLCH without hand-written fallbacks", async () => {
    const resolver = await loadResolver();
    const tokens = resolver.apply({
      brand: "atlas",
      colorScheme: "light",
      density: "comfortable",
    });
    const colorValues: Array<Record<string, unknown>> = [];

    function visit(value: unknown) {
      if (!value || typeof value !== "object") {
        return;
      }

      if ("colorSpace" in value) {
        colorValues.push(value as Record<string, unknown>);
      }

      for (const child of Object.values(value)) {
        visit(child);
      }
    }

    for (const token of Object.values(tokens)) {
      visit(token.$value);
    }

    expect(colorValues.length).toBeGreaterThan(0);
    expect(colorValues.every((value) => value.colorSpace === "oklch")).toBe(true);
    expect(colorValues.every((value) => !("hex" in value))).toBe(true);
  });
});
