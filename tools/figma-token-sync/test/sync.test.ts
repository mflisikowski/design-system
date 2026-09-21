import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type {
  CurrentDocument,
  CurrentVariable,
  ManifestVariable,
  TokenManifest,
} from "../src/contract";
import { validateManifest } from "../src/manifest";
import { applyItems, pruneItems } from "../src/operations";
import { buildSyncPlan, variableFingerprint } from "../src/plan";

const packageDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function generatedManifest() {
  return validateManifest(
    JSON.parse(
      await readFile(
        path.resolve(packageDirectory, "../../packages/tokens/dist/figma/variables.json"),
        "utf8",
      ),
    ),
  );
}

function currentVariable(variable: ManifestVariable): CurrentVariable {
  return {
    appliedFingerprint: variableFingerprint(variable),
    canonicalId: variable.id,
    figmaId: `figma-variable:${variable.id}`,
    shape: structuredClone(variable),
  };
}

function appliedDocument(manifest: TokenManifest): CurrentDocument {
  return {
    collections: manifest.collections.map((collection) => ({
      canonicalId: collection.id,
      figmaId: `figma-collection:${collection.id}`,
      hiddenFromPublishing: collection.hiddenFromPublishing,
      modes: collection.modes.map((mode) => ({
        canonicalId: mode.id,
        figmaId: `figma-mode:${collection.id}:${mode.id}`,
        name: mode.name,
      })),
      name: collection.name,
    })),
    variables: manifest.variables.map(currentVariable),
  };
}

describe("MFD Figma manifest", () => {
  it("accepts the generated repository artifact and covers every approved mode", async () => {
    const manifest = await generatedManifest();
    const collectionModes = Object.fromEntries(
      manifest.collections.map((collection) => [
        collection.name,
        collection.modes.map((mode) => mode.name),
      ]),
    );

    expect(collectionModes).toEqual({
      "MFD Density": ["Comfortable", "Compact"],
      "MFD Reference Color": ["Atlas Light", "Atlas Dark", "Bloom Light", "Bloom Dark"],
      "MFD Semantic Color": ["Atlas Light", "Atlas Dark", "Bloom Light", "Bloom Dark"],
    });
    expect(
      manifest.variables.find((variable) => variable.id === "color.bg.canvas")?.valuesByMode,
    ).toEqual({
      "atlas-dark": { alias: "reference.color.neutral-dark.1" },
      "atlas-light": { alias: "reference.color.neutral-light.1" },
      "bloom-dark": { alias: "reference.color.neutral-dark.1" },
      "bloom-light": { alias: "reference.color.neutral-light.1" },
    });
    expect(
      manifest.variables.find((variable) => variable.id === "size.control-height.md")?.valuesByMode,
    ).toEqual({ comfortable: 40, compact: 32 });
  });

  it("rejects alias indexes that disagree with variable mode values", async () => {
    const manifest = structuredClone(await generatedManifest()) as unknown as Record<
      string,
      unknown
    >;
    manifest.aliases = [];

    expect(() => validateManifest(manifest)).toThrow(
      "aliases must exactly index the aliases declared by variable mode values",
    );
  });
});

describe("read-only Check plan", () => {
  it("reports every collection, mode, and variable as a create in an empty file", async () => {
    const manifest = await generatedManifest();
    const expectedCreates =
      manifest.collections.length +
      manifest.collections.reduce((sum, collection) => sum + collection.modes.length, 0) +
      manifest.variables.length;

    const plan = buildSyncPlan(manifest, { collections: [], variables: [] });

    expect(plan.counts).toEqual({
      conflict: 0,
      create: expectedCreates,
      stale: 0,
      unchanged: 0,
      update: 0,
    });
    expect(plan.hasBlockingConflicts).toBe(false);
  });

  it("makes an identical re-import a complete no-op", async () => {
    const manifest = await generatedManifest();
    const plan = buildSyncPlan(manifest, appliedDocument(manifest));

    expect(plan.counts.create).toBe(0);
    expect(plan.counts.update).toBe(0);
    expect(plan.counts.conflict).toBe(0);
    expect(plan.counts.stale).toBe(0);
    expect(plan.counts.unchanged).toBe(plan.items.length);
  });

  it("distinguishes a repository update from managed Figma drift", async () => {
    const original = await generatedManifest();
    const desired = structuredClone(original);
    const target = desired.variables.find((variable) => variable.id === "color.bg.canvas");
    if (!target) {
      throw new Error("Missing test token.");
    }
    target.description = "Updated repository description";

    const repositoryUpdatePlan = buildSyncPlan(desired, appliedDocument(original));
    expect(
      repositoryUpdatePlan.items.find(
        (item) => item.entity === "variable" && item.canonicalId === target.id,
      ),
    ).toMatchObject({ applicable: true, category: "update" });

    const drifted = appliedDocument(original);
    const currentTarget = drifted.variables.find((variable) => variable.canonicalId === target.id);
    if (!currentTarget) {
      throw new Error("Missing current test token.");
    }
    currentTarget.shape.description = "Edited directly in Figma";
    const driftPlan = buildSyncPlan(desired, drifted);

    expect(
      driftPlan.items.find((item) => item.entity === "variable" && item.canonicalId === target.id),
    ).toMatchObject({ applicable: true, category: "conflict" });
  });

  it("reports stale managed entries without folding them into Apply work", async () => {
    const manifest = await generatedManifest();
    const current = appliedDocument(manifest);
    const density = current.collections.find((collection) => collection.canonicalId === "density");
    if (!density) {
      throw new Error("Missing density collection.");
    }
    density.modes.push({
      canonicalId: "legacy",
      figmaId: "figma-mode:density:legacy",
      name: "Legacy",
    });
    current.variables.push({
      appliedFingerprint: "legacy",
      canonicalId: "size.legacy",
      figmaId: "figma-variable:size.legacy",
      shape: {
        codeSyntax: { WEB: "var(--mfd-size-legacy)" },
        collectionId: "density",
        description: "",
        id: "size.legacy",
        name: "size.legacy",
        scopes: ["WIDTH_HEIGHT"],
        type: "FLOAT",
        unit: "px",
        valuesByMode: { comfortable: 1, compact: 1, legacy: 1 },
      },
    });

    const plan = buildSyncPlan(manifest, current);

    expect(plan.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "stale", entity: "mode" }),
        expect.objectContaining({
          canonicalId: "size.legacy",
          category: "stale",
          entity: "variable",
        }),
      ]),
    );
    expect(plan.counts.create).toBe(0);
    expect(plan.counts.update).toBe(0);
    expect(applyItems(plan)).toHaveLength(0);
    expect(() => pruneItems(plan, "yes")).toThrow("explicit PRUNE confirmation");
    expect(pruneItems(plan, "PRUNE").map((item) => item.entity)).toEqual(["mode", "variable"]);
  });

  it("blocks Apply rather than adopting an unmanaged collection with the same name", async () => {
    const manifest = await generatedManifest();
    const firstCollection = manifest.collections[0];
    if (!firstCollection) {
      throw new Error("Missing generated collection.");
    }
    const current: CurrentDocument = {
      collections: [
        {
          figmaId: "unmanaged-collection",
          hiddenFromPublishing: false,
          modes: [{ figmaId: "unmanaged-mode", name: firstCollection.modes[0]?.name ?? "Mode 1" }],
          name: firstCollection.name,
        },
      ],
      variables: [],
    };

    const plan = buildSyncPlan(manifest, current);

    expect(plan.hasBlockingConflicts).toBe(true);
    expect(
      plan.items.find(
        (item) => item.entity === "collection" && item.canonicalId === firstCollection.id,
      ),
    ).toMatchObject({ applicable: false, category: "conflict" });
    expect(() => applyItems(plan)).toThrow("Apply is blocked");
  });

  it("selects managed drift for Apply so repository values win", async () => {
    const manifest = await generatedManifest();
    const current = appliedDocument(manifest);
    const drifted = current.variables[0];
    if (!drifted) {
      throw new Error("Missing generated variable.");
    }
    drifted.shape.description = "Edited directly in Figma";

    const selected = applyItems(buildSyncPlan(manifest, current));

    expect(selected).toContainEqual(
      expect.objectContaining({
        applicable: true,
        canonicalId: drifted.canonicalId,
        category: "conflict",
        entity: "variable",
      }),
    );
    expect(selected.some((item) => item.category === "stale")).toBe(false);
  });
});
