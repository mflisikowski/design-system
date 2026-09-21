const namespaceConfig = `{
  "registries": {
    "@mflisikowski": "https://design-system.mflisikowski.dev/r/{name}.json"
  }
}`;

function component(
  name: string,
  dependencies: readonly string[],
  registryDependencies: readonly string[] = [],
) {
  return {
    installation: {
      dependencies,
      latest: `pnpm dlx shadcn@latest add @mflisikowski/${name}`,
      namespaceConfig,
      registryDependencies,
      snapshot: `pnpm dlx shadcn@latest add https://design-system.mflisikowski.dev/r/v/0.0.0/${name}.json`,
    },
  };
}

const commonDependencies = ["@mflisikowski/tokens@0.0.0", "clsx@2.1.1"] as const;

export const publicComponentDocumentation = {
  alert: component("alert", commonDependencies),
  button: component("button", commonDependencies),
  emptyState: component("empty-state", commonDependencies),
  field: component("field", commonDependencies),
  icon: component("icon", [...commonDependencies, "lucide-react@1.47.0"]),
  input: component("input", commonDependencies, ["@mflisikowski/field"]),
  link: component("link", commonDependencies),
  table: component("table", commonDependencies),
  textarea: component("textarea", commonDependencies, [
    "@mflisikowski/field",
    "@mflisikowski/input",
  ]),
  dialog: component("dialog", ["@base-ui/react@1.8.0", "@mflisikowski/tokens@0.0.0", "clsx@2.1.1"]),
  toast: component("toast", ["@mflisikowski/tokens@0.0.0", "sonner@2.0.8"]),
} as const;
