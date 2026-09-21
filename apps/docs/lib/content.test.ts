import { describe, expect, it } from "vitest";

import { documentationPages, primaryNavigation } from "./content";

describe("documentation content manifest", () => {
  it("publishes the six approved primary destinations in learning order", () => {
    expect(primaryNavigation.map(({ label }) => label)).toEqual([
      "Foundations",
      "Components",
      "Patterns",
      "Themes",
      "Changelog",
      "Reference CRM",
    ]);
  });

  it("lists every local page explicitly instead of deriving navigation from the filesystem", () => {
    expect(documentationPages.map(({ slug }) => slug)).toEqual([
      "",
      "foundations",
      "components",
      "components/registry-sample",
      "components/button",
      "components/icon",
      "components/link",
      "components/alert",
      "components/empty-state",
      "components/table",
      "components/field",
      "components/input",
      "components/textarea",
      "components/dialog",
      "components/toast",
      "patterns",
      "themes",
      "changelog",
    ]);

    const localRoutes = new Set<string>(documentationPages.map(({ href }) => href));
    const internalDestinations = primaryNavigation.filter(
      (destination) => !("external" in destination),
    );

    for (const destination of internalDestinations) {
      expect(localRoutes.has(destination.href)).toBe(true);
    }
  });
});
