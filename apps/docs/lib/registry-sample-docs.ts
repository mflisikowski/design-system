export const registrySampleDocumentation = {
  apiRows: [
    {
      defaultValue: "—",
      description: "Selects an approved MFD theme brand for the generated label.",
      name: "brand",
      required: true,
      type: "ThemeBrand",
    },
    {
      defaultValue: "Generated from brand",
      description: "Replaces the default visible message.",
      name: "label",
      required: false,
      type: "string",
    },
    {
      defaultValue: "—",
      description: "Forwards applicable native paragraph properties.",
      name: "...props",
      required: false,
      type: 'Omit<ComponentPropsWithoutRef<"p">, "children">',
    },
  ],
  installation: {
    dependencies: ["@mflisikowski/tokens@0.1.0", "clsx@2.1.1"],
    latest: "pnpm dlx shadcn@latest add @mflisikowski/registry-sample",
    namespaceConfig: [
      "{",
      '  "registries": {',
      '    "@mflisikowski": "https://design-system.mflisikowski.dev/r/{name}.json"',
      "  }",
      "}",
    ].join("\n"),
    registryDependencies: ["@mflisikowski/registry-sample-label"],
    snapshot:
      "pnpm dlx shadcn@latest add https://design-system.mflisikowski.dev/r/v/0.1.0/registry-sample.json",
  },
} as const;
