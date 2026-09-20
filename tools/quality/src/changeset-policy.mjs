const PUBLIC_IMPACT_RULES = [
  {
    label: "public token contract",
    matches: (path) => path.startsWith("packages/tokens/"),
  },
  {
    label: "public lint policy",
    matches: (path) => path.startsWith("packages/lint-config/"),
  },
  {
    label: "public registry contract",
    matches: (path) => path === "registry.json" || path.startsWith("registry/"),
  },
];

function normalizePath(path) {
  return path.replaceAll("\\", "/").replace(/^\.\//, "");
}

export function isChangesetFile(path) {
  const normalizedPath = normalizePath(path);

  return (
    /^\.changeset\/[^/]+\.md$/.test(normalizedPath) && normalizedPath !== ".changeset/README.md"
  );
}

export function classifyPublicImpact(paths) {
  return paths.flatMap((path) => {
    const normalizedPath = normalizePath(path);
    const rule = PUBLIC_IMPACT_RULES.find((candidate) => candidate.matches(normalizedPath));

    return rule ? [{ label: rule.label, path: normalizedPath }] : [];
  });
}

export function evaluateChangesetPolicy(paths) {
  const normalizedPaths = [...new Set(paths.map(normalizePath))].sort();
  const publicImpact = classifyPublicImpact(normalizedPaths);
  const changesets = normalizedPaths.filter(isChangesetFile);

  return {
    changesets,
    publicImpact,
    required: publicImpact.length > 0,
    satisfied: publicImpact.length === 0 || changesets.length > 0,
  };
}
