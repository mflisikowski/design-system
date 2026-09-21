export const applicationRules = Object.freeze({
  "shadcn/no-arbitrary-values": "error",
  "shadcn/no-inline-styles": "error",
  "shadcn/no-raw-colors": "error",
  "shadcn/no-restyle": ["error", { allow: ["layout"] }],
  "shadcn/no-unknown-classes": "warn",
  "shadcn/require-static-classes": "error",
});

export const registryRules = Object.freeze({
  "shadcn/no-restyle": "off",
});

export const policyNote =
  "MFD: use semantic tokens and documented component APIs. Application code controls placement; registry source owns component internals. See docs/specification.md#15-linting-and-agent-policy.";

export function createOxlintConfig() {
  return {
    jsPlugins: ["@shadcn/lint"],
    settings: {
      shadcn: {
        note: policyNote,
      },
    },
    rules: applicationRules,
    overrides: [
      {
        files: ["**/registry/**/*.{js,jsx,ts,tsx}"],
        rules: registryRules,
      },
    ],
  };
}
