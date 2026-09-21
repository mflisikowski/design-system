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
    const propsDeclaration =
      /export type RegistrySampleProps =\s*([\s\S]+?)\s*&\s*\{([\s\S]+?)\};/.exec(source);
    const inheritedProps = propsDeclaration?.[1]?.trim();
    const ownProps = [
      ...(propsDeclaration?.[2]?.matchAll(/^\s*(\w+)(\?)?:\s*([^;]+);/gm) ?? []),
    ].map(([, name, optional, type]) => ({
      name,
      required: optional !== "?",
      type: type?.trim(),
    }));
    const documentedContract = registrySampleDocumentation.apiRows.map(
      ({ name, required, type }) => ({ name, required, type }),
    );

    expect(documentedContract).toEqual([
      ...ownProps,
      {
        name: "...props",
        required: false,
        type: inheritedProps,
      },
    ]);
    expect(source).toContain("{label ?? registrySampleLabel(brand)}");
    expect(registrySampleDocumentation.apiRows).toMatchObject([
      { name: "brand", defaultValue: "—" },
      { name: "label", defaultValue: "Generated from brand" },
      { name: "...props", defaultValue: "—" },
    ]);
  });
});
