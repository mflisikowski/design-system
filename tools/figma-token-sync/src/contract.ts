export const manifestSchemaVersion = 1;

export type ManifestColorValue = {
  alpha: number;
  hex: string;
};

export type ManifestAliasValue = {
  alias: string;
};

export type ManifestValue = ManifestAliasValue | ManifestColorValue | number;

export type ManifestMode = {
  id: string;
  name: string;
};

export type ManifestCollection = {
  hiddenFromPublishing: boolean;
  id: string;
  modes: ManifestMode[];
  name: string;
};

export type ManifestVariable = {
  codeSyntax: { WEB: string };
  collectionId: string;
  description: string;
  id: string;
  name: string;
  scopes: string[];
  type: "COLOR" | "FLOAT";
  unit?: string;
  valuesByMode: Record<string, ManifestValue>;
};

export type ManifestAlias = {
  modeId: string;
  targetId: string;
  variableId: string;
};

export type TokenManifest = {
  aliases: ManifestAlias[];
  collections: ManifestCollection[];
  contentHash: string;
  schemaVersion: number;
  sourceRevision: string;
  variables: ManifestVariable[];
};

export type CurrentMode = {
  canonicalId?: string;
  figmaId: string;
  name: string;
};

export type CurrentCollection = {
  canonicalId?: string;
  figmaId: string;
  hiddenFromPublishing: boolean;
  modes: CurrentMode[];
  name: string;
};

export type CurrentVariableValue = ManifestValue | { alias: `figma:${string}` } | boolean | string;

export type CurrentVariableShape = Omit<ManifestVariable, "type" | "valuesByMode"> & {
  type: ManifestVariable["type"] | "BOOLEAN" | "EASING" | "STRING" | "TIMING";
  valuesByMode: Record<string, CurrentVariableValue>;
};

export type CurrentVariable = {
  appliedFingerprint?: string;
  canonicalId?: string;
  figmaId: string;
  shape: CurrentVariableShape;
};

export type CurrentDocument = {
  appliedManifest?: {
    contentHash: string;
    schemaVersion: number;
    sourceRevision: string;
  };
  collections: CurrentCollection[];
  variables: CurrentVariable[];
};

export type DiffCategory = "conflict" | "create" | "stale" | "unchanged" | "update";
export type DiffEntity = "collection" | "mode" | "variable";

export type DiffItem = {
  after?: string;
  applicable: boolean;
  before?: string;
  canonicalId: string;
  category: DiffCategory;
  detail: string;
  entity: DiffEntity;
  figmaId?: string;
  label: string;
};

export type SyncPlan = {
  counts: Record<DiffCategory, number>;
  hasBlockingConflicts: boolean;
  items: DiffItem[];
  manifest: {
    contentHash: string;
    sourceRevision: string;
  };
  metadataChanged: boolean;
};

export type ApplySummary = {
  created: number;
  conflictsResolved: number;
  unchanged: number;
  updated: number;
};

export type PruneSummary = {
  collections: number;
  modes: number;
  variables: number;
};
