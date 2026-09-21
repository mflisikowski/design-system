import {
  type ManifestAlias,
  type ManifestCollection,
  type ManifestMode,
  type ManifestValue,
  type ManifestVariable,
  manifestSchemaVersion,
  type TokenManifest,
} from "./contract";

const digestPattern = /^sha256:[0-9a-f]{64}$/;
const colorPattern = /^#[0-9a-f]{6}$/;
const allowedScopes = new Set([
  "ALL_SCOPES",
  "CORNER_RADIUS",
  "EFFECT_COLOR",
  "EFFECT_FLOAT",
  "FONT_FAMILY",
  "FONT_SIZE",
  "FONT_STYLE",
  "FONT_WEIGHT",
  "FRAME_FILL",
  "GAP",
  "LETTER_SPACING",
  "LINE_HEIGHT",
  "OPACITY",
  "PARAGRAPH_INDENT",
  "PARAGRAPH_SPACING",
  "SHAPE_FILL",
  "STROKE_COLOR",
  "STROKE_FLOAT",
  "TEXT_CONTENT",
  "TEXT_FILL",
  "WIDTH_HEIGHT",
]);

function fail(message: string): never {
  throw new Error(`Invalid MFD Figma manifest: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringField(record: Record<string, unknown>, field: string, context: string) {
  const value = record[field];
  if (typeof value !== "string" || value.length === 0) {
    fail(`${context}.${field} must be a non-empty string.`);
  }
  return value;
}

function unique(values: string[], context: string) {
  if (new Set(values).size !== values.length) {
    fail(`${context} contains duplicate identifiers.`);
  }
}

function parseMode(value: unknown, context: string): ManifestMode {
  if (!isRecord(value)) {
    fail(`${context} must be an object.`);
  }
  return {
    id: stringField(value, "id", context),
    name: stringField(value, "name", context),
  };
}

function parseCollection(value: unknown, index: number): ManifestCollection {
  const context = `collections[${index}]`;
  if (!isRecord(value) || !Array.isArray(value.modes)) {
    fail(`${context} must be an object with modes.`);
  }
  const modes = value.modes.map((mode, modeIndex) =>
    parseMode(mode, `${context}.modes[${modeIndex}]`),
  );
  if (modes.length === 0) {
    fail(`${context} must contain at least one mode.`);
  }
  unique(
    modes.map((mode) => mode.id),
    `${context}.modes`,
  );
  unique(
    modes.map((mode) => mode.name),
    `${context}.modes`,
  );
  if (value.hiddenFromPublishing !== undefined && typeof value.hiddenFromPublishing !== "boolean") {
    fail(`${context}.hiddenFromPublishing must be a boolean.`);
  }
  return {
    hiddenFromPublishing: value.hiddenFromPublishing === true,
    id: stringField(value, "id", context),
    modes,
    name: stringField(value, "name", context),
  };
}

function parseValue(
  value: unknown,
  type: ManifestVariable["type"],
  context: string,
): ManifestValue {
  if (type === "FLOAT") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      fail(`${context} must be a finite number.`);
    }
    return value;
  }
  if (!isRecord(value)) {
    fail(`${context} must be a color or alias object.`);
  }
  if (typeof value.alias === "string" && value.alias.length > 0) {
    return { alias: value.alias };
  }
  if (typeof value.hex !== "string" || !colorPattern.test(value.hex)) {
    fail(`${context}.hex must be a lowercase six-digit color.`);
  }
  const alpha = value.alpha === undefined ? 1 : value.alpha;
  if (typeof alpha !== "number" || alpha < 0 || alpha > 1) {
    fail(`${context}.alpha must be between zero and one.`);
  }
  return { alpha, hex: value.hex };
}

function parseVariable(value: unknown, index: number): ManifestVariable {
  const context = `variables[${index}]`;
  if (!isRecord(value) || !isRecord(value.valuesByMode) || !isRecord(value.codeSyntax)) {
    fail(`${context} must contain valuesByMode and codeSyntax objects.`);
  }
  const type = value.type;
  if (type !== "COLOR" && type !== "FLOAT") {
    fail(`${context}.type must be COLOR or FLOAT.`);
  }
  if (!Array.isArray(value.scopes) || !value.scopes.every((scope) => typeof scope === "string")) {
    fail(`${context}.scopes must be an array of strings.`);
  }
  const scopes = value.scopes as string[];
  for (const scope of scopes) {
    if (!allowedScopes.has(scope)) {
      fail(`${context}.scopes contains unsupported scope ${scope}.`);
    }
  }
  unique(scopes, `${context}.scopes`);
  const valuesByMode = Object.fromEntries(
    Object.entries(value.valuesByMode).map(([modeId, modeValue]) => [
      modeId,
      parseValue(modeValue, type, `${context}.valuesByMode.${modeId}`),
    ]),
  );
  const unit = value.unit;
  if (unit !== undefined && typeof unit !== "string") {
    fail(`${context}.unit must be a string when present.`);
  }
  return {
    codeSyntax: { WEB: stringField(value.codeSyntax, "WEB", `${context}.codeSyntax`) },
    collectionId: stringField(value, "collectionId", context),
    description: typeof value.description === "string" ? value.description : "",
    id: stringField(value, "id", context),
    name: stringField(value, "name", context),
    scopes,
    type,
    ...(unit === undefined ? {} : { unit }),
    valuesByMode,
  };
}

function parseAlias(value: unknown, index: number): ManifestAlias {
  const context = `aliases[${index}]`;
  if (!isRecord(value)) {
    fail(`${context} must be an object.`);
  }
  return {
    modeId: stringField(value, "modeId", context),
    targetId: stringField(value, "targetId", context),
    variableId: stringField(value, "variableId", context),
  };
}

function aliasKey(alias: ManifestAlias) {
  return `${alias.variableId}:${alias.modeId}:${alias.targetId}`;
}

export function validateManifest(input: unknown): TokenManifest {
  if (!isRecord(input)) {
    fail("root must be an object.");
  }
  if (input.schemaVersion !== manifestSchemaVersion) {
    fail(`schemaVersion must be ${manifestSchemaVersion}.`);
  }
  if (!digestPattern.test(String(input.sourceRevision))) {
    fail("sourceRevision must be a sha256 digest.");
  }
  if (!digestPattern.test(String(input.contentHash))) {
    fail("contentHash must be a sha256 digest.");
  }
  if (
    !Array.isArray(input.collections) ||
    !Array.isArray(input.variables) ||
    !Array.isArray(input.aliases)
  ) {
    fail("collections, variables, and aliases must be arrays.");
  }

  const collections = input.collections.map(parseCollection);
  const variables = input.variables.map(parseVariable);
  const aliases = input.aliases.map(parseAlias);
  unique(
    collections.map((collection) => collection.id),
    "collections",
  );
  unique(
    variables.map((variable) => variable.id),
    "variables",
  );
  unique(aliases.map(aliasKey), "aliases");

  const collectionById = new Map(collections.map((collection) => [collection.id, collection]));
  const variableById = new Map(variables.map((variable) => [variable.id, variable]));
  const expectedAliases: ManifestAlias[] = [];

  for (const variable of variables) {
    const collection = collectionById.get(variable.collectionId);
    if (!collection) {
      fail(`${variable.id} references unknown collection ${variable.collectionId}.`);
    }
    const expectedModeIds = collection.modes.map((mode) => mode.id).sort();
    const actualModeIds = Object.keys(variable.valuesByMode).sort();
    if (JSON.stringify(actualModeIds) !== JSON.stringify(expectedModeIds)) {
      fail(`${variable.id} must define exactly the modes from ${collection.id}.`);
    }
    for (const [modeId, value] of Object.entries(variable.valuesByMode)) {
      if (typeof value === "object" && "alias" in value) {
        const target = variableById.get(value.alias);
        if (!target) {
          fail(`${variable.id}.${modeId} aliases unknown variable ${value.alias}.`);
        }
        if (target.type !== variable.type) {
          fail(`${variable.id}.${modeId} aliases a variable with a different type.`);
        }
        expectedAliases.push({ modeId, targetId: value.alias, variableId: variable.id });
      }
    }
  }

  const expectedAliasKeys = expectedAliases.map(aliasKey).sort();
  const actualAliasKeys = aliases.map(aliasKey).sort();
  if (JSON.stringify(actualAliasKeys) !== JSON.stringify(expectedAliasKeys)) {
    fail("aliases must exactly index the aliases declared by variable mode values.");
  }

  return {
    aliases,
    collections,
    contentHash: String(input.contentHash),
    schemaVersion: manifestSchemaVersion,
    sourceRevision: String(input.sourceRevision),
    variables,
  };
}
