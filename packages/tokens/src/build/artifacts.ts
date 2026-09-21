import { createHash } from "node:crypto";

import type { Plugin, Resolver, TokenNormalized } from "@terrazzo/parser";

import resolverDocument from "../mfd.resolver.json";

type TokenContext = {
  brand: string;
  colorScheme: string;
  density: string;
};

type ColorValue = {
  alpha?: number;
  colorSpace: string;
  components: [number, number, number];
  hex?: string;
};

type FigmaMode = { id: string; name: string };
type FigmaCollection = {
  hiddenFromPublishing?: boolean;
  id: string;
  modes: FigmaMode[];
  name: string;
};

type FigmaVariable = {
  codeSyntax: { WEB: string };
  collectionId: string;
  description: string;
  id: string;
  name: string;
  scopes: string[];
  type: "COLOR" | "FLOAT";
  unit?: string;
  valuesByMode: Record<string, unknown>;
};

type ContrastCategory = "boundary" | "focus" | "foreground" | "on-solid" | "selection";
type ContrastPair = {
  background: string;
  category: ContrastCategory;
  foreground: string;
  id: string;
  minimum: number;
};

const modifiers = resolverDocument.modifiers as Record<
  keyof TokenContext,
  { contexts: Record<string, unknown>; default: string }
>;
const brands = Object.keys(modifiers.brand.contexts);
const colorSchemes = Object.keys(modifiers.colorScheme.contexts);
const densities = Object.keys(modifiers.density.contexts);
const defaultContext: TokenContext = {
  brand: modifiers.brand.default,
  colorScheme: modifiers.colorScheme.default,
  density: modifiers.density.default,
};

export const tokenContexts: TokenContext[] = brands.flatMap((brand) =>
  colorSchemes.flatMap((colorScheme) =>
    densities.map((density) => ({ brand, colorScheme, density })),
  ),
);

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${stableStringify(child)}`);
    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(value);
}

function digest(value: unknown): string {
  return `sha256:${createHash("sha256").update(stableStringify(value)).digest("hex")}`;
}

function isColorValue(value: unknown): value is ColorValue {
  return Boolean(
    value &&
      typeof value === "object" &&
      "colorSpace" in value &&
      "components" in value &&
      Array.isArray((value as ColorValue).components),
  );
}

function linearSrgb([lightness, chroma, hue]: ColorValue["components"]) {
  const angle = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(angle);
  const b = chroma * Math.sin(angle);
  const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function colorHex(value: ColorValue, tokenId: string): string {
  if (value.colorSpace !== "oklch") {
    throw new Error(`${tokenId} must use canonical OKLCH, received ${value.colorSpace}.`);
  }

  const linear = linearSrgb(value.components);
  const epsilon = 0.000_001;
  if (linear.some((component) => component < -epsilon || component > 1 + epsilon)) {
    throw new Error(`${tokenId} is outside the approved sRGB gamut.`);
  }

  const encoded = linear.map((component) => {
    const clamped = Math.min(1, Math.max(0, component));
    const srgb = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
    return Math.round(srgb * 255)
      .toString(16)
      .padStart(2, "0");
  });

  return `#${encoded.join("")}`;
}

const contrastPairs: ContrastPair[] = [
  {
    id: "primary-on-canvas",
    category: "foreground",
    foreground: "color.text.primary",
    background: "color.bg.canvas",
    minimum: 4.5,
  },
  {
    id: "primary-on-surface",
    category: "foreground",
    foreground: "color.text.primary",
    background: "color.bg.surface",
    minimum: 4.5,
  },
  {
    id: "secondary-on-surface",
    category: "foreground",
    foreground: "color.text.secondary",
    background: "color.bg.surface",
    minimum: 4.5,
  },
  {
    id: "muted-on-surface",
    category: "foreground",
    foreground: "color.text.muted",
    background: "color.bg.surface",
    minimum: 4.5,
  },
  {
    id: "muted-on-canvas",
    category: "foreground",
    foreground: "color.text.muted",
    background: "color.bg.canvas",
    minimum: 4.5,
  },
  {
    id: "accent-text-on-accent-bg",
    category: "foreground",
    foreground: "color.accent.text",
    background: "color.accent.bg",
    minimum: 4.5,
  },
  {
    id: "accent-on-solid",
    category: "on-solid",
    foreground: "color.accent.on-solid",
    background: "color.accent.solid",
    minimum: 4.5,
  },
  {
    id: "focus-on-canvas",
    category: "focus",
    foreground: "color.border.focus",
    background: "color.bg.canvas",
    minimum: 3,
  },
  {
    id: "strong-border-on-canvas",
    category: "boundary",
    foreground: "color.border.strong",
    background: "color.bg.canvas",
    minimum: 3,
  },
  {
    id: "strong-border-on-surface",
    category: "boundary",
    foreground: "color.border.strong",
    background: "color.bg.surface",
    minimum: 3,
  },
  {
    id: "selection-text-on-selection-bg",
    category: "selection",
    foreground: "color.selection.text",
    background: "color.selection.bg",
    minimum: 4.5,
  },
  ...(["danger", "success", "warning"] as const).flatMap((tone) => [
    {
      id: `${tone}-text-on-bg`,
      category: "foreground" as const,
      foreground: `color.status.${tone}.text`,
      background: `color.status.${tone}.bg`,
      minimum: 4.5,
    },
    {
      id: `${tone}-border-on-bg`,
      category: "boundary" as const,
      foreground: `color.status.${tone}.border`,
      background: `color.status.${tone}.bg`,
      minimum: 3,
    },
    {
      id: `inverse-on-${tone}-solid`,
      category: "on-solid" as const,
      foreground: "color.text.inverse",
      background: `color.status.${tone}.solid`,
      minimum: 4.5,
    },
  ]),
];

function resolvedColor(tokens: Record<string, TokenNormalized>, id: string) {
  const value = tokens[id]?.$value;
  if (!isColorValue(value) || value.colorSpace !== "oklch") {
    throw new Error(`Contrast pair token ${id} must resolve to an OKLCH color.`);
  }
  if (value.alpha !== undefined && value.alpha !== 1) {
    throw new Error(`Contrast pair token ${id} must be opaque or define a rendered backdrop.`);
  }

  return value;
}

function relativeLuminance(value: ColorValue) {
  const [red = 0, green = 0, blue = 0] = linearSrgb(value.components);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: ColorValue, background: ColorValue) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

function contrastReport(
  contexts: Array<{ context: TokenContext; tokens: Record<string, TokenNormalized> }>,
) {
  const reportContexts = contexts.map(({ context, tokens }) => {
    const pairs = contrastPairs.map((pair) => {
      const ratio = contrastRatio(
        resolvedColor(tokens, pair.foreground),
        resolvedColor(tokens, pair.background),
      );

      if (ratio < pair.minimum) {
        throw new Error(
          `${contextName(context)} ${pair.id} has ${ratio.toFixed(2)}:1 contrast; expected at least ${pair.minimum}:1.`,
        );
      }

      return {
        ...pair,
        ratio: Number(ratio.toFixed(2)),
        result: "pass",
      };
    });

    return { id: contextName(context), context, pairs };
  });

  return {
    schemaVersion: 1,
    method: "WCAG 2.x relative luminance from canonical OKLCH converted to linear sRGB",
    contexts: reportContexts,
  };
}

function stringUnion(values: string[]) {
  return values.map((value) => JSON.stringify(value)).join(" | ");
}

function runtimeContract() {
  const colorSchemePreferences = ["system", ...colorSchemes];
  const defaults = {
    brand: defaultContext.brand,
    colorScheme: "system",
    density: defaultContext.density,
  };
  const javascript = `${[
    "/* Generated by the MFD Terrazzo pipeline. Do not edit. */",
    `export const themeBrands = ${JSON.stringify(brands)};`,
    `export const colorSchemePreferences = ${JSON.stringify(colorSchemePreferences)};`,
    `export const themeDensities = ${JSON.stringify(densities)};`,
    `export const themeDefaults = ${JSON.stringify(defaults)};`,
    `export const resolvedThemeContexts = ${JSON.stringify(tokenContexts)};`,
    `export const contrastPairs = ${JSON.stringify(contrastPairs)};`,
  ].join("\n")}\n`;
  const declarations = `${[
    `export type ThemeBrand = ${stringUnion(brands)};`,
    `export type ResolvedColorScheme = ${stringUnion(colorSchemes)};`,
    `export type ColorSchemePreference = ${stringUnion(colorSchemePreferences)};`,
    `export type ThemeDensity = ${stringUnion(densities)};`,
    `export type ContrastCategory = ${stringUnion(["boundary", "focus", "foreground", "on-solid", "selection"])};`,
    "export type ThemePreferences = Readonly<{ brand: ThemeBrand; colorScheme: ColorSchemePreference; density: ThemeDensity }>;",
    "export type ResolvedThemeContext = Readonly<{ brand: ThemeBrand; colorScheme: ResolvedColorScheme; density: ThemeDensity }>;",
    "export type ContrastPair = Readonly<{ id: string; category: ContrastCategory; foreground: string; background: string; minimum: number }>;",
    "export declare const themeBrands: readonly ThemeBrand[];",
    "export declare const colorSchemePreferences: readonly ColorSchemePreference[];",
    "export declare const themeDensities: readonly ThemeDensity[];",
    "export declare const themeDefaults: ThemePreferences;",
    "export declare const resolvedThemeContexts: readonly ResolvedThemeContext[];",
    "export declare const contrastPairs: readonly ContrastPair[];",
  ].join("\n")}\n`;

  return { declarations, javascript };
}

function addColorFallbacks(value: unknown, tokenId: string): unknown {
  if (isColorValue(value)) {
    return { ...value, hex: colorHex(value, tokenId) };
  }

  if (Array.isArray(value)) {
    return value.map((child) => addColorFallbacks(child, tokenId));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, addColorFallbacks(child, tokenId)]),
    );
  }

  return value;
}

function runtimeTokens(tokens: Record<string, TokenNormalized>) {
  return Object.fromEntries(
    Object.keys(tokens)
      .sort()
      .map((id) => {
        const token = tokens[id];
        if (!token) {
          throw new Error(`Missing resolved token ${id}.`);
        }

        return [
          id,
          {
            $type: token.$type,
            $value: addColorFallbacks(token.$value, id),
            ...(token.$description ? { $description: token.$description } : {}),
            ...(token.aliasOf ? { aliasOf: token.aliasOf } : {}),
          },
        ];
      }),
  );
}

function contextName(context: TokenContext) {
  return `${context.brand}-${context.colorScheme}-${context.density}`;
}

function tokenSignature(tokens: Record<string, TokenNormalized>) {
  return Object.fromEntries(
    Object.keys(tokens)
      .sort()
      .map((id) => [id, tokens[id]?.$type]),
  );
}

const tokenSegmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const statePattern =
  /(?:^|-)(?:active|checked|disabled|focus|hover|invalid|loading|open|pressed|read-only|selected)(?:-|$)/;

function validateTokenNames(tokens: Record<string, TokenNormalized>) {
  for (const id of Object.keys(tokens)) {
    const segments = id.split(".");
    if (!segments.every((segment) => tokenSegmentPattern.test(segment))) {
      throw new Error(`${id} does not use lowercase kebab-case token path segments.`);
    }

    if (segments[0] === "reference") {
      if (segments.length !== 4) {
        throw new Error(`${id} does not match reference.<category>.<family>.<step-or-name>.`);
      }
      continue;
    }

    if (segments.some((segment) => /^\d+$/.test(segment))) {
      throw new Error(`${id} uses a numbered public semantic or component role.`);
    }
    if (segments[0] === "semantic") {
      throw new Error(`${id} repeats the forbidden semantic prefix.`);
    }
    if (segments[0] === "component" && segments.length < 5) {
      throw new Error(`${id} does not match component.<component>.<part>.<property>.<variant>.`);
    }

    const stateSegment = segments.findIndex((segment) => statePattern.test(segment));
    if (stateSegment !== -1 && stateSegment !== segments.length - 1) {
      throw new Error(`${id} places an interaction state before the final segment.`);
    }
  }
}

function validatePermutationCompleteness(
  contexts: Array<{ context: TokenContext; tokens: Record<string, TokenNormalized> }>,
) {
  const baseline = contexts[0];
  if (!baseline) {
    throw new Error("The canonical resolver did not produce any contexts.");
  }

  const baselineSignature = stableStringify(tokenSignature(baseline.tokens));
  for (const candidate of contexts.slice(1)) {
    if (stableStringify(tokenSignature(candidate.tokens)) !== baselineSignature) {
      throw new Error(
        `Token identifiers and types in ${contextName(candidate.context)} do not match ${contextName(baseline.context)}.`,
      );
    }
  }
}

function semanticUtility(tokenId: string): { name: string; property: string } | undefined {
  const parts = tokenId.split(".");

  if (parts[0] !== "color") {
    return undefined;
  }

  if (parts[1] === "bg") {
    return { name: `bg-${parts.slice(2).join("-")}`, property: "background-color" };
  }
  if (parts[1] === "text") {
    return { name: `text-${parts.slice(2).join("-")}`, property: "color" };
  }
  if (parts[1] === "border") {
    return { name: `border-${parts.slice(2).join("-")}`, property: "border-color" };
  }
  if (parts[1] === "accent") {
    const role = parts[2];
    if (role === "border") {
      return { name: "border-accent", property: "border-color" };
    }
    if (role === "text") {
      return { name: "text-accent", property: "color" };
    }
    if (role === "on-solid") {
      return { name: "text-on-accent", property: "color" };
    }
    if (role) {
      return {
        name: role === "bg" ? "bg-accent" : `bg-accent-${role.replace(/^bg-/, "")}`,
        property: "background-color",
      };
    }
  }
  if (parts[1] === "status") {
    const family = parts[2];
    const role = parts[3];
    if (!family || !role) {
      return undefined;
    }
    if (role === "border") {
      return { name: `border-${family}`, property: "border-color" };
    }
    if (role === "text") {
      return { name: `text-${family}`, property: "color" };
    }
    return {
      name: role === "bg" ? `bg-${family}` : `bg-${family}-${role}`,
      property: "background-color",
    };
  }
  if (parts[1] === "selection") {
    return {
      name: `selection-${parts[2]}`,
      property: parts[2] === "text" ? "color" : "background-color",
    };
  }
  if (parts[1] === "overlay") {
    return { name: "bg-overlay", property: "background-color" };
  }

  return undefined;
}

function tailwindUtilities(tokens: Record<string, TokenNormalized>) {
  const entries = Object.keys(tokens)
    .sort()
    .flatMap((id) => {
      const utility = semanticUtility(id);
      return utility ? [{ id, ...utility }] : [];
    });
  const names = entries.map(({ name }) => name);

  if (new Set(names).size !== names.length) {
    throw new Error("Semantic token mapping produced duplicate Tailwind utility names.");
  }

  return `${[
    "/* Generated by the MFD Terrazzo pipeline. Do not edit. */",
    ...entries.map(
      ({ id, name, property }) =>
        `@utility ${name} {\n  ${property}: var(--mfd-${id.replaceAll(".", "-")});\n}`,
    ),
  ].join("\n\n")}\n`;
}

function colorScopes(id: string): string[] {
  if (id.includes(".text") || id.endsWith(".on-solid")) {
    return ["TEXT_FILL"];
  }
  if (id.includes(".border.") || id.endsWith(".border")) {
    return ["STROKE_COLOR"];
  }
  return ["FRAME_FILL", "SHAPE_FILL"];
}

function colorModeId(context: Pick<TokenContext, "brand" | "colorScheme">) {
  return `${context.brand}-${context.colorScheme}`;
}

function titleCase(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function figmaColorVariables(resolver: Resolver, prefix: "reference.color." | "color.") {
  const contexts = brands.flatMap((brand) =>
    colorSchemes.map((colorScheme) => ({
      brand,
      colorScheme,
      density: defaultContext.density,
    })),
  );
  const ids = new Set<string>();

  for (const context of contexts) {
    const tokens = resolver.apply(context);
    for (const id of Object.keys(tokens)) {
      if (id.startsWith(prefix) && tokens[id]?.$type === "color") {
        ids.add(id);
      }
    }
  }

  return [...ids].sort().map((id): FigmaVariable => {
    const valuesByMode: Record<string, unknown> = {};
    let description = "";

    for (const context of contexts) {
      const modeId = colorModeId(context);
      const unresolved = resolver.apply(context, { resolveAliases: false })[id];
      const resolved = resolver.apply(context)[id];

      if (!unresolved || !resolved || !isColorValue(resolved.$value)) {
        throw new Error(`Unable to build Figma color variable ${id} in ${modeId}.`);
      }

      description ||= unresolved.$description ?? "";
      valuesByMode[modeId] =
        typeof unresolved.$value === "string" && unresolved.$value.startsWith("{")
          ? { alias: unresolved.$value.slice(1, -1) }
          : {
              alpha: resolved.$value.alpha ?? 1,
              hex: colorHex(resolved.$value, id),
            };
    }

    return {
      id,
      name: id,
      collectionId: prefix === "reference.color." ? "reference-color" : "semantic-color",
      type: "COLOR",
      description,
      scopes: colorScopes(id),
      codeSyntax: { WEB: `var(--mfd-${id.replaceAll(".", "-")})` },
      valuesByMode,
    };
  });
}

function figmaDensityVariables(resolver: Resolver) {
  const contexts = densities.map((density) => ({
    brand: defaultContext.brand,
    colorScheme: defaultContext.colorScheme,
    density,
  }));
  const ids = new Set<string>();

  for (const context of contexts) {
    for (const [id, token] of Object.entries(resolver.apply(context))) {
      if ((id.startsWith("size.") || id.startsWith("space.")) && token.$type === "dimension") {
        ids.add(id);
      }
    }
  }

  return [...ids].sort().map((id): FigmaVariable => {
    const valuesByMode: Record<string, unknown> = {};
    let description = "";
    let unit = "px";

    for (const context of contexts) {
      const token = resolver.apply(context)[id];
      if (!token || typeof token.$value !== "object" || !("value" in token.$value)) {
        throw new Error(`Unable to build Figma density variable ${id} in ${context.density}.`);
      }
      const value = token.$value as { unit: string; value: number };
      description ||= token.$description ?? "";
      unit = value.unit;
      valuesByMode[context.density] = value.value;
    }

    return {
      id,
      name: id,
      collectionId: "density",
      type: "FLOAT",
      unit,
      description,
      scopes: id.startsWith("space.") ? ["GAP"] : ["WIDTH_HEIGHT"],
      codeSyntax: { WEB: `var(--mfd-${id.replaceAll(".", "-")})` },
      valuesByMode,
    };
  });
}

function figmaManifest(resolver: Resolver, sourceRevision: string) {
  const colorModes = brands.flatMap((brand) =>
    colorSchemes.map((colorScheme) => ({
      id: `${brand}-${colorScheme}`,
      name: `${titleCase(brand)} ${titleCase(colorScheme)}`,
    })),
  );
  const densityModes = densities.map((density) => ({ id: density, name: titleCase(density) }));
  const collections: FigmaCollection[] = [
    {
      id: "reference-color",
      name: "MFD Reference Color",
      hiddenFromPublishing: true,
      modes: colorModes,
    },
    { id: "semantic-color", name: "MFD Semantic Color", modes: colorModes },
    { id: "density", name: "MFD Density", modes: densityModes },
  ];
  const variables = [
    ...figmaColorVariables(resolver, "reference.color."),
    ...figmaColorVariables(resolver, "color."),
    ...figmaDensityVariables(resolver),
  ].sort((left, right) => left.id.localeCompare(right.id));
  const aliases = variables
    .flatMap((variable) =>
      Object.entries(variable.valuesByMode).flatMap(([modeId, value]) =>
        value && typeof value === "object" && "alias" in value
          ? [{ modeId, targetId: value.alias, variableId: variable.id }]
          : [],
      ),
    )
    .sort((left, right) =>
      `${left.variableId}:${left.modeId}`.localeCompare(`${right.variableId}:${right.modeId}`),
    );
  const payload = { schemaVersion: 1, sourceRevision, collections, variables, aliases };

  return { ...payload, contentHash: digest(payload) };
}

export function artifactPlugin(): Plugin {
  return {
    name: "mfd-token-artifacts",
    build({ outputFile, resolver }) {
      const permutations = resolver.listPermutations?.();
      const expectedPermutationIds = tokenContexts.map(stableStringify).sort();
      const actualPermutationIds = permutations?.map(stableStringify).sort();
      if (
        !actualPermutationIds ||
        stableStringify(actualPermutationIds) !== stableStringify(expectedPermutationIds)
      ) {
        throw new Error("Resolver permutations do not match the canonical modifier cross-product.");
      }

      const resolvedTokenContexts = tokenContexts.map((context) => ({
        context,
        tokens: resolver.apply(context),
      }));
      validatePermutationCompleteness(resolvedTokenContexts);
      validateTokenNames(resolvedTokenContexts[0]?.tokens ?? {});
      const resolvedContexts = resolvedTokenContexts.map(({ context, tokens }) => ({
        context,
        tokens: runtimeTokens(tokens),
      }));
      const sourceRevision = digest(resolvedContexts);

      for (const artifact of resolvedContexts) {
        outputFile(
          `json/${contextName(artifact.context)}.json`,
          `${JSON.stringify(artifact, null, 2)}\n`,
        );
      }

      const defaultTokens = resolver.apply(defaultContext);
      const runtime = runtimeContract();
      outputFile(
        "css/tokens.css.d.ts",
        "declare const stylesheet: string;\nexport default stylesheet;\n",
      );
      outputFile("css/tailwind.css", tailwindUtilities(defaultTokens));
      outputFile("runtime/index.d.ts", runtime.declarations);
      outputFile("runtime/index.js", runtime.javascript);
      outputFile(
        "reports/contrast.json",
        `${JSON.stringify(contrastReport(resolvedTokenContexts), null, 2)}\n`,
      );
      outputFile(
        "figma/variables.json",
        `${JSON.stringify(figmaManifest(resolver, sourceRevision), null, 2)}\n`,
      );
    },
  };
}
