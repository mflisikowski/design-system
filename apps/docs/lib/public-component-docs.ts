const namespaceConfig = `{
  "registries": {
    "@mflisikowski": "https://design-system.mflisikowski.dev/r/{name}.json"
  }
}`;

function component(name: string, dependencies: readonly string[]) {
  return {
    installation: {
      dependencies,
      latest: `pnpm dlx shadcn@latest add @mflisikowski/${name}`,
      namespaceConfig,
      registryDependencies: [] as readonly string[],
      snapshot: `pnpm dlx shadcn@latest add https://design-system.mflisikowski.dev/r/v/0.0.0/${name}.json`,
    },
  };
}

const commonDependencies = ["@mflisikowski/tokens@0.0.0", "clsx@2.1.1"] as const;

export const publicComponentDocumentation = {
  alert: component("alert", commonDependencies),
  button: component("button", commonDependencies),
  emptyState: component("empty-state", commonDependencies),
  icon: component("icon", [...commonDependencies, "lucide-react@1.47.0"]),
  link: component("link", commonDependencies),
  table: component("table", commonDependencies),
} as const;
