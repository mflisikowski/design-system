import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { registrySampleDocumentation } from "./registry-sample-docs";

type RegistryItem = Readonly<{
  name: string;
  dependencies: readonly string[];
  registryDependencies: readonly string[];
  meta: Readonly<{
    installation: Readonly<{ latest: string; snapshot: string }>;
  }>;
}>;

describe("Registry Sample documentation contract", () => {
  it("keeps installation commands and dependencies aligned with registry metadata", () => {
    const registry = JSON.parse(
      readFileSync(new URL("../../../registry/ui/registry.json", import.meta.url), "utf8"),
    ) as { items: RegistryItem[] };
    const item = registry.items.find(({ name }) => name === "registry-sample");

    expect(item).toBeDefined();
    expect(registrySampleDocumentation.installation).toMatchObject({
      dependencies: item?.dependencies,
      latest: item?.meta.installation.latest,
      registryDependencies: item?.registryDependencies,
      snapshot: item?.meta.installation.snapshot,
    });
  });

  it("keeps the API table aligned with the canonical exported props", () => {
    const source = readFileSync(
      new URL("../../../registry/ui/registry-sample.tsx", import.meta.url),
      "utf8",
    );
    const propsBody = /export type RegistrySampleProps =[\s\S]+?& \{([\s\S]+?)\};/.exec(
      source,
    )?.[1];
    const exportedProps = [...(propsBody?.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*)\??:/gm) ?? [])].map(
      (match) => match[1],
    );
    const documentedProps = registrySampleDocumentation.apiRows
      .map(({ name }) => name)
      .filter((name) => name !== "...props");

    expect(documentedProps).toEqual(exportedProps);
    expect(source).toContain("...props");
    expect(registrySampleDocumentation.apiRows.at(-1)?.name).toBe("...props");
  });
});
