import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import js from "@terrazzo/plugin-js";

import { artifactPlugin, tokenContexts } from "./src/build/artifacts.js";

export default defineConfig({
  tokens: "./src/mfd.resolver.json",
  outDir: "./dist",
  plugins: [
    css({
      filename: "css/tokens.css",
      omitTypographyShorthand: true,
      permutations: tokenContexts.map((context) => ({
        input: context,
        prepare: (contents) =>
          `:root[data-brand="${context.brand}"][data-color-scheme="${context.colorScheme}"][data-density="${context.density}"] {\n  ${contents}\n}`,
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
