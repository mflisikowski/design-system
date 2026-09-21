import type {
  ApplySummary,
  CurrentCollection,
  CurrentDocument,
  CurrentVariable,
  CurrentVariableValue,
  ManifestValue,
  ManifestVariable,
  PruneSummary,
  SyncPlan,
  TokenManifest,
} from "./contract";
import { validateManifest } from "./manifest";
import { applyItems, plansMatch, pruneItems } from "./operations";
import { buildSyncPlan, variableFingerprint } from "./plan";

const panelWidth = 460;
const collectionIdKey = "canonical-collection-id";
const collectionModesKey = "canonical-mode-map";
const variableIdKey = "canonical-variable-id";
const variableFingerprintKey = "applied-variable-fingerprint";
const variableUnitKey = "canonical-unit";
const manifestMetadataKey = "applied-manifest";

type UiMessage =
  | { height: number; type: "resize" }
  | { manifest: unknown; type: "check" }
  | { type: "apply" }
  | { confirmation: string; type: "prune" };

type PluginOperation = "apply" | "check" | "prune";

let activeManifest: TokenManifest | undefined;
let activePlan: SyncPlan | undefined;

function parseModeMap(collection: VariableCollection) {
  const raw = collection.getPluginData(collectionModesKey);
  if (!raw) {
    return {} as Record<string, string>;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {} as Record<string, string>;
    }
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  } catch {
    return {} as Record<string, string>;
  }
}

function writeModeMap(collection: VariableCollection, modeMap: Record<string, string>) {
  collection.setPluginData(collectionModesKey, JSON.stringify(modeMap));
}

function channelToHex(channel: number) {
  return Math.round(Math.min(1, Math.max(0, channel)) * 255)
    .toString(16)
    .padStart(2, "0");
}

function figmaValue(
  value: VariableValue,
  canonicalVariableIdByFigmaId: ReadonlyMap<string, string>,
): CurrentVariableValue {
  if (typeof value === "object" && "type" in value && value.type === "VARIABLE_ALIAS") {
    const canonicalId = canonicalVariableIdByFigmaId.get(value.id);
    return canonicalId ? { alias: canonicalId } : { alias: `figma:${value.id}` };
  }
  if (typeof value === "object" && "r" in value && "g" in value && "b" in value) {
    return {
      alpha: "a" in value ? value.a : 1,
      hex: `#${channelToHex(value.r)}${channelToHex(value.g)}${channelToHex(value.b)}`,
    };
  }
  if (typeof value === "number") {
    return value;
  }
  throw new Error("A managed token contains a Figma value type unsupported by this manifest.");
}

async function readCurrentDocument(): Promise<CurrentDocument> {
  const figmaCollections = (await figma.variables.getLocalVariableCollectionsAsync()).filter(
    (collection) => !collection.remote,
  );
  const collectionByFigmaId = new Map(
    figmaCollections.map((collection) => [collection.id, collection]),
  );
  const collections: CurrentCollection[] = figmaCollections.map((collection) => {
    const modeMap = parseModeMap(collection);
    const canonicalModeByFigmaId = new Map(
      Object.entries(modeMap).map(([canonicalId, figmaId]) => [figmaId, canonicalId]),
    );
    const canonicalId = collection.getPluginData(collectionIdKey) || undefined;
    return {
      ...(canonicalId ? { canonicalId } : {}),
      figmaId: collection.id,
      hiddenFromPublishing: collection.hiddenFromPublishing,
      modes: collection.modes.map((mode) => ({
        ...(canonicalModeByFigmaId.get(mode.modeId)
          ? { canonicalId: canonicalModeByFigmaId.get(mode.modeId) }
          : {}),
        figmaId: mode.modeId,
        name: mode.name,
      })),
      name: collection.name,
    };
  });
  const collectionSnapshotByFigmaId = new Map(
    collections.map((collection) => [collection.figmaId, collection]),
  );
  const figmaVariables = (await figma.variables.getLocalVariablesAsync()).filter(
    (variable) => !variable.remote,
  );
  const canonicalVariableIdByFigmaId = new Map(
    figmaVariables.flatMap((variable) => {
      const canonicalId = variable.getPluginData(variableIdKey);
      return canonicalId ? [[variable.id, canonicalId] as const] : [];
    }),
  );
  const variables: CurrentVariable[] = figmaVariables.map((variable) => {
    const collection = collectionSnapshotByFigmaId.get(variable.variableCollectionId);
    const figmaCollection = collectionByFigmaId.get(variable.variableCollectionId);
    const modeMap = figmaCollection ? parseModeMap(figmaCollection) : {};
    const supportedType = variable.resolvedType === "COLOR" || variable.resolvedType === "FLOAT";
    const valuesByMode = supportedType
      ? Object.fromEntries(
          Object.entries(modeMap).flatMap(([canonicalModeId, figmaModeId]) => {
            const value = variable.valuesByMode[figmaModeId];
            return value === undefined
              ? []
              : [[canonicalModeId, figmaValue(value, canonicalVariableIdByFigmaId)] as const];
          }),
        )
      : {};
    const canonicalId = variable.getPluginData(variableIdKey) || undefined;
    const appliedFingerprint = variable.getPluginData(variableFingerprintKey) || undefined;
    const unit = variable.getPluginData(variableUnitKey) || undefined;
    return {
      ...(appliedFingerprint ? { appliedFingerprint } : {}),
      ...(canonicalId ? { canonicalId } : {}),
      figmaId: variable.id,
      shape: {
        codeSyntax: { WEB: variable.codeSyntax.WEB ?? "" },
        collectionId: collection?.canonicalId ?? `figma:${variable.variableCollectionId}`,
        description: variable.description,
        id: canonicalId ?? `figma:${variable.id}`,
        name: variable.name,
        scopes: [...variable.scopes],
        type: variable.resolvedType,
        ...(unit ? { unit } : {}),
        valuesByMode,
      },
    };
  });

  const rawManifestMetadata = figma.root.getPluginData(manifestMetadataKey);
  let appliedManifest: CurrentDocument["appliedManifest"];
  if (rawManifestMetadata) {
    try {
      const parsed = JSON.parse(rawManifestMetadata) as Record<string, unknown>;
      if (
        typeof parsed.contentHash === "string" &&
        typeof parsed.schemaVersion === "number" &&
        typeof parsed.sourceRevision === "string"
      ) {
        appliedManifest = {
          contentHash: parsed.contentHash,
          schemaVersion: parsed.schemaVersion,
          sourceRevision: parsed.sourceRevision,
        };
      }
    } catch {
      appliedManifest = undefined;
    }
  }

  return { ...(appliedManifest ? { appliedManifest } : {}), collections, variables };
}

function postError(error: unknown) {
  figma.ui.postMessage({
    message: error instanceof Error ? error.message : "Unexpected plugin error.",
    type: "error",
  });
}

function postPlan(
  operation: PluginOperation,
  plan: SyncPlan,
  summary?: ApplySummary | PruneSummary,
) {
  activePlan = plan;
  figma.ui.postMessage({ operation, plan, ...(summary ? { summary } : {}), type: "result" });
}

async function check(manifest: TokenManifest) {
  const plan = buildSyncPlan(manifest, await readCurrentDocument());
  postPlan("check", plan);
  return plan;
}

function desiredColor(value: Extract<ManifestValue, { hex: string }>): RGB | RGBA {
  const red = Number.parseInt(value.hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(value.hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(value.hex.slice(5, 7), 16) / 255;
  return value.alpha === 1
    ? { b: blue, g: green, r: red }
    : { a: value.alpha, b: blue, g: green, r: red };
}

function setManifestMetadata(manifest: TokenManifest) {
  figma.root.setPluginData(
    manifestMetadataKey,
    JSON.stringify({
      contentHash: manifest.contentHash,
      schemaVersion: manifest.schemaVersion,
      sourceRevision: manifest.sourceRevision,
    }),
  );
  figma.root.setRelaunchData({ sync: "Open MFD Token Sync" });
}

async function ensureCollections(manifest: TokenManifest) {
  const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const byCanonicalId = new Map(
    existingCollections.flatMap((collection) => {
      const canonicalId = collection.getPluginData(collectionIdKey);
      return canonicalId ? [[canonicalId, collection] as const] : [];
    }),
  );
  const collectionByCanonicalId = new Map<string, VariableCollection>();
  const modeIdsByCollection = new Map<string, Record<string, string>>();

  for (const desired of manifest.collections) {
    let collection = byCanonicalId.get(desired.id);
    if (!collection) {
      collection = figma.variables.createVariableCollection(desired.name);
      collection.setPluginData(collectionIdKey, desired.id);
    }
    collection.name = desired.name;
    collection.hiddenFromPublishing = desired.hiddenFromPublishing;

    const modeMap = parseModeMap(collection);
    const usedModeIds = new Set(Object.values(modeMap));
    for (const [index, desiredMode] of desired.modes.entries()) {
      let figmaModeId = modeMap[desiredMode.id];
      let existingMode = collection.modes.find((mode) => mode.modeId === figmaModeId);
      if (!existingMode) {
        existingMode = collection.modes.find(
          (mode) => !usedModeIds.has(mode.modeId) && mode.name === desiredMode.name,
        );
      }
      if (!existingMode && index === 0 && collection.modes.length === 1 && usedModeIds.size === 0) {
        existingMode = collection.modes[0];
      }
      figmaModeId = existingMode?.modeId ?? collection.addMode(desiredMode.name);
      collection.renameMode(figmaModeId, desiredMode.name);
      modeMap[desiredMode.id] = figmaModeId;
      usedModeIds.add(figmaModeId);
    }
    writeModeMap(collection, modeMap);
    collectionByCanonicalId.set(desired.id, collection);
    modeIdsByCollection.set(desired.id, modeMap);
  }

  return { collectionByCanonicalId, modeIdsByCollection };
}

function configureVariable(variable: Variable, desired: ManifestVariable) {
  variable.name = desired.name;
  variable.description = desired.description;
  variable.scopes = desired.scopes as VariableScope[];
  variable.setVariableCodeSyntax("WEB", desired.codeSyntax.WEB);
  for (const platform of ["ANDROID", "iOS"] as const) {
    if (variable.codeSyntax[platform] !== undefined) {
      variable.removeVariableCodeSyntax(platform);
    }
  }
  variable.setPluginData(variableIdKey, desired.id);
  variable.setPluginData(variableUnitKey, desired.unit ?? "");
}

async function applyManifest(manifest: TokenManifest, plan: SyncPlan): Promise<ApplySummary> {
  const actionable = applyItems(plan);
  const summary: ApplySummary = {
    created: plan.counts.create,
    conflictsResolved: plan.items.filter((item) => item.category === "conflict" && item.applicable)
      .length,
    unchanged: plan.counts.unchanged,
    updated: plan.counts.update,
  };
  if (actionable.length === 0) {
    if (plan.metadataChanged) {
      setManifestMetadata(manifest);
    }
    return summary;
  }

  const { collectionByCanonicalId, modeIdsByCollection } = await ensureCollections(manifest);
  const existingVariables = await figma.variables.getLocalVariablesAsync();
  const variableByCanonicalId = new Map(
    existingVariables.flatMap((variable) => {
      const canonicalId = variable.getPluginData(variableIdKey);
      return canonicalId ? [[canonicalId, variable] as const] : [];
    }),
  );

  for (const desired of manifest.variables) {
    let variable = variableByCanonicalId.get(desired.id);
    if (!variable) {
      const collection = collectionByCanonicalId.get(desired.collectionId);
      if (!collection) {
        throw new Error(`Missing managed collection ${desired.collectionId}.`);
      }
      variable = figma.variables.createVariable(desired.name, collection, desired.type);
      variableByCanonicalId.set(desired.id, variable);
    }
    configureVariable(variable, desired);
  }

  for (const aliases of [false, true]) {
    for (const desired of manifest.variables) {
      const variable = variableByCanonicalId.get(desired.id);
      const modeMap = modeIdsByCollection.get(desired.collectionId);
      if (!variable || !modeMap) {
        throw new Error(`Unable to resolve managed variable ${desired.id}.`);
      }
      for (const [canonicalModeId, desiredValue] of Object.entries(desired.valuesByMode)) {
        const isAlias = typeof desiredValue === "object" && "alias" in desiredValue;
        if (isAlias !== aliases) {
          continue;
        }
        const figmaModeId = modeMap[canonicalModeId];
        if (!figmaModeId) {
          throw new Error(`Missing managed mode ${desired.collectionId}:${canonicalModeId}.`);
        }
        let value: VariableValue;
        if (typeof desiredValue === "number") {
          value = desiredValue;
        } else if ("alias" in desiredValue) {
          const target = variableByCanonicalId.get(desiredValue.alias);
          if (!target) {
            throw new Error(`Missing alias target ${desiredValue.alias}.`);
          }
          value = figma.variables.createVariableAlias(target);
        } else {
          value = desiredColor(desiredValue);
        }
        variable.setValueForMode(figmaModeId, value);
      }
      variable.setPluginData(variableFingerprintKey, variableFingerprint(desired));
    }
  }

  setManifestMetadata(manifest);
  return summary;
}

async function reviewedCurrentPlan(manifest: TokenManifest) {
  const currentPlan = buildSyncPlan(manifest, await readCurrentDocument());
  if (!activePlan || !plansMatch(activePlan, currentPlan)) {
    activePlan = currentPlan;
    figma.ui.postMessage({
      message: "The Figma file changed after Check. Review the refreshed diff before continuing.",
      plan: currentPlan,
      type: "refresh-required",
    });
    return undefined;
  }
  return currentPlan;
}

async function pruneManifest(
  manifest: TokenManifest,
  plan: SyncPlan,
  confirmation: string,
): Promise<PruneSummary> {
  const staleItems = pruneItems(plan, confirmation);
  const staleCollectionIds = new Set(
    staleItems.filter((item) => item.entity === "collection").map((item) => item.figmaId),
  );
  const summary: PruneSummary = { collections: 0, modes: 0, variables: 0 };

  for (const item of staleItems.filter((candidate) => candidate.entity === "variable")) {
    const variable = await figma.variables.getVariableByIdAsync(item.figmaId ?? "");
    if (variable && !staleCollectionIds.has(variable.variableCollectionId)) {
      variable.remove();
      summary.variables += 1;
    }
  }

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  for (const item of staleItems.filter((candidate) => candidate.entity === "mode")) {
    const collection = collections.find((candidate) =>
      candidate.modes.some((mode) => mode.modeId === item.figmaId),
    );
    if (!collection || staleCollectionIds.has(collection.id)) {
      continue;
    }
    if (collection.modes.length <= 1) {
      throw new Error(`Cannot prune the only mode from ${collection.name}.`);
    }
    collection.removeMode(item.figmaId ?? "");
    const modeMap = Object.fromEntries(
      Object.entries(parseModeMap(collection)).filter(
        ([, figmaModeId]) => figmaModeId !== item.figmaId,
      ),
    );
    writeModeMap(collection, modeMap);
    summary.modes += 1;
  }

  for (const item of staleItems.filter((candidate) => candidate.entity === "collection")) {
    const collection = await figma.variables.getVariableCollectionByIdAsync(item.figmaId ?? "");
    if (collection) {
      collection.remove();
      summary.collections += 1;
    }
  }

  if (staleItems.length > 0) {
    setManifestMetadata(manifest);
  }
  return summary;
}

figma.showUI(__html__, { height: 620, themeColors: true, width: panelWidth });

figma.ui.onmessage = async (message: UiMessage) => {
  try {
    if (message.type === "resize") {
      figma.ui.resize(panelWidth, Math.max(420, Math.min(760, Math.round(message.height))));
      return;
    }
    if (message.type === "check") {
      activeManifest = validateManifest(message.manifest);
      await check(activeManifest);
      return;
    }
    if (!activeManifest) {
      throw new Error("Choose and check a generated variables.json manifest first.");
    }
    const plan = await reviewedCurrentPlan(activeManifest);
    if (!plan) {
      return;
    }
    if (message.type === "apply") {
      const summary = await applyManifest(activeManifest, plan);
      postPlan("apply", buildSyncPlan(activeManifest, await readCurrentDocument()), summary);
      return;
    }
    if (message.type === "prune") {
      const summary = await pruneManifest(activeManifest, plan, message.confirmation);
      postPlan("prune", buildSyncPlan(activeManifest, await readCurrentDocument()), summary);
    }
  } catch (error) {
    postError(error);
  }
};
