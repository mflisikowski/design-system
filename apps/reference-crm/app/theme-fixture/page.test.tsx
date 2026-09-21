import { readFile } from "node:fs/promises";
import path from "node:path";

import { contrastPairs, resolvedThemeContexts } from "@mflisikowski/tokens/runtime";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RootLayout from "../layout";
import ThemeFixturePage from "./page";

describe("runtime theme fixture", () => {
  it("renders the initial system preference on independent root attributes", () => {
    const markup = renderToStaticMarkup(createElement(RootLayout, null, createElement("div")));

    expect(markup).toContain(
      '<html lang="en" data-brand="atlas" data-color-scheme="system" data-density="comfortable">',
    );
  });

  it("renders all eight resolved contexts with representative native controls", () => {
    const markup = renderToStaticMarkup(createElement(ThemeFixturePage));

    for (const context of resolvedThemeContexts) {
      const id = `${context.brand}-${context.colorScheme}-${context.density}`;
      expect(markup).toContain(`data-theme-context="${id}"`);
    }
    for (const pair of contrastPairs) {
      expect(markup.match(new RegExp(`data-contrast-pair="${pair.id}"`, "g"))).toHaveLength(8);
    }

    expect(markup.match(/<input/g)).toHaveLength(8);
    expect(markup.match(/<select/g)).toHaveLength(8);
  });

  it("loads the approved font families from self-hosted Latin Extended files", async () => {
    const css = await readFile(path.join(import.meta.dirname, "..", "globals.css"), "utf8");

    expect(css).toContain("@fontsource-variable/geist/files/geist-latin-ext-wght-normal.woff2");
    expect(css).toContain(
      "@fontsource-variable/geist-mono/files/geist-mono-latin-ext-wght-normal.woff2",
    );
    expect(css).toContain("@fontsource-variable/dm-sans/files/dm-sans-latin-ext-wght-normal.woff2");
    expect(css).toContain("@fontsource-variable/lora/files/lora-latin-ext-wght-normal.woff2");
  });

  it("preserves mobile input text and touch target minimums", async () => {
    const css = await readFile(path.join(import.meta.dirname, "theme-fixture.module.css"), "utf8");

    expect(css).toContain("font-size: var(--mfd-typography-body-lg-font-size);");
    expect(css).toContain("min-height: var(--mfd-size-hit-target-minimum);");
  });
});
