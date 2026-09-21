import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import js from "@terrazzo/plugin-js";

import { artifactPlugin, tokenContexts } from "./src/build/artifacts.js";

type TokenContext = (typeof tokenContexts)[number];

function contextSelector(context: TokenContext, colorScheme = context.colorScheme) {
  const attributes = `[data-brand="${context.brand}"][data-color-scheme="${colorScheme}"][data-density="${context.density}"]`;

  return `:root${attributes},\n[data-theme-context]${attributes}`;
}

function runtimeContextCss(contents: string, context: TokenContext) {
  const fixedContext = `${contextSelector(context)} {\n  color-scheme: ${context.colorScheme};\n  ${contents}\n}`;
  const systemContext = `@media (prefers-color-scheme: ${context.colorScheme}) {\n  ${contextSelector(context, "system").replaceAll("\n", "\n  ")} {\n    color-scheme: ${context.colorScheme};\n    ${contents.replaceAll("\n", "\n  ")}\n  }\n}`;
  const documentSchemeContract =
    context.brand === "atlas" &&
    context.colorScheme === "light" &&
    context.density === "comfortable"
      ? `:root {\n  color-scheme: light dark;\n}\n\n:root[data-color-scheme="light"] {\n  color-scheme: light;\n}\n\n:root[data-color-scheme="dark"] {\n  color-scheme: dark;\n}\n\n`
      : "";

  return `${documentSchemeContract}${fixedContext}\n\n${systemContext}`;
}

export default defineConfig({
  tokens: "./src/mfd.resolver.json",
  outDir: "./dist",
  plugins: [
    css({
      filename: "css/tokens.css",
      omitTypographyShorthand: true,
      permutations: tokenContexts.map((context) => ({
        input: context,
        prepare: (contents) => runtimeContextCss(contents, context),
      })),
      variableName: (token) => `--mfd-${token.id.replaceAll(".", "-")}`,
    }),
    js({
      filename: "index.js",
      properties: ["$type", "$value", "$description", "aliasOf"],
    }),
    artifactPlugin(),
  ],
});
