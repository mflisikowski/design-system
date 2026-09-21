import type {
  CurrentCollection,
  CurrentDocument,
  CurrentVariableShape,
  DiffCategory,
  DiffItem,
  ManifestCollection,
  ManifestVariable,
  SyncPlan,
  TokenManifest,
} from "./contract";

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${stableStringify(child)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function variableFingerprint(variable: ManifestVariable | CurrentVariableShape) {
  return stableStringify({
    ...variable,
    scopes: [...variable.scopes].sort(),
    valuesByMode: Object.fromEntries(
      Object.entries(variable.valuesByMode).sort(([left], [right]) => left.localeCompare(right)),
    ),
  });
}

function planItem(item: DiffItem) {
  return item;
}

function managedCollectionsById(current: CurrentDocument) {
  const result = new Map<string, CurrentCollection[]>();
  for (const collection of current.collections) {
    if (!collection.canonicalId) {
      continue;
    }
    const matches = result.get(collection.canonicalId) ?? [];
    matches.push(collection);
    result.set(collection.canonicalId, matches);
  }
  return result;
}

function hasUnmanagedVariables(collection: CurrentCollection, current: CurrentDocument) {
  return current.variables.some(
    (variable) => !variable.canonicalId && variable.shape.collectionId === collection.canonicalId,
  );
}

function hasUnmanagedModes(collection: CurrentCollection) {
  return collection.modes.some((mode) => !mode.canonicalId);
}

function collectionItems(manifest: TokenManifest, current: CurrentDocument) {
  const items: DiffItem[] = [];
  const managed = managedCollectionsById(current);
  const desiredIds = new Set(manifest.collections.map((collection) => collection.id));

  for (const desired of manifest.collections) {
    const matches = managed.get(desired.id) ?? [];
    if (matches.length > 1) {
      for (const match of matches) {
        items.push(
          planItem({
            after: stableStringify(desired),
            applicable: false,
            before: stableStringify(match),
            canonicalId: desired.id,
            category: "conflict",
            detail: "More than one managed collection claims this canonical identifier.",
            entity: "collection",
            figmaId: match.figmaId,
            label: desired.name,
          }),
        );
      }
      continue;
    }

    const existing = matches[0];
    if (!existing) {
      const collision = current.collections.find(
        (collection) => !collection.canonicalId && collection.name === desired.name,
      );
      items.push(
        planItem({
          after: stableStringify(desired),
          applicable: !collision,
          ...(collision ? { before: stableStringify(collision) } : {}),
          canonicalId: desired.id,
          category: collision ? "conflict" : "create",
          detail: collision
            ? "An unmanaged collection already uses this name; it will not be adopted or overwritten."
            : "The managed collection does not exist yet.",
          entity: "collection",
          ...(collision ? { figmaId: collision.figmaId } : {}),
          label: desired.name,
        }),
      );
      continue;
    }

    const changed =
      existing.name !== desired.name ||
      existing.hiddenFromPublishing !== desired.hiddenFromPublishing;
    items.push(
      planItem({
        ...(changed ? { after: stableStringify(desired) } : {}),
        applicable: true,
        ...(changed ? { before: stableStringify(existing) } : {}),
        canonicalId: desired.id,
        category: changed ? "update" : "unchanged",
        detail: changed
          ? "Managed collection metadata differs from the manifest."
          : "Managed collection metadata matches the manifest.",
        entity: "collection",
        figmaId: existing.figmaId,
        label: desired.name,
      }),
    );
  }

  for (const collection of current.collections) {
    if (collection.canonicalId && !desiredIds.has(collection.canonicalId)) {
      const protectsUnmanagedContent =
        hasUnmanagedVariables(collection, current) || hasUnmanagedModes(collection);
      items.push(
        planItem({
          applicable: !protectsUnmanagedContent,
          before: stableStringify(collection),
          canonicalId: collection.canonicalId,
          category: "stale",
          detail: protectsUnmanagedContent
            ? "The collection is stale but contains unmanaged content, so Prune will preserve it."
            : "The managed collection is no longer present in the manifest.",
          entity: "collection",
          figmaId: collection.figmaId,
          label: collection.name,
        }),
      );
    }
  }

  return items;
}

function currentCollectionFor(
  desired: ManifestCollection,
  current: CurrentDocument,
): CurrentCollection | undefined {
  const matches = current.collections.filter((collection) => collection.canonicalId === desired.id);
  return matches.length === 1 ? matches[0] : undefined;
}

function modeItems(manifest: TokenManifest, current: CurrentDocument) {
  const items: DiffItem[] = [];

  for (const desiredCollection of manifest.collections) {
    const collection = currentCollectionFor(desiredCollection, current);
    const desiredModeIds = new Set(desiredCollection.modes.map((mode) => mode.id));

    for (const desiredMode of desiredCollection.modes) {
      const existing = collection?.modes.find((mode) => mode.canonicalId === desiredMode.id);
      const sameNameUnmapped = collection?.modes.find(
        (mode) => !mode.canonicalId && mode.name === desiredMode.name,
      );
      const parentBlocked =
        !collection &&
        current.collections.some(
          (candidate) => !candidate.canonicalId && candidate.name === desiredCollection.name,
        );

      if (sameNameUnmapped) {
        items.push(
          planItem({
            after: stableStringify(desiredMode),
            applicable: false,
            before: stableStringify(sameNameUnmapped),
            canonicalId: `${desiredCollection.id}:${desiredMode.id}`,
            category: "conflict",
            detail:
              "An unmanaged mode already uses this name; it will not be adopted or overwritten.",
            entity: "mode",
            figmaId: sameNameUnmapped.figmaId,
            label: `${desiredCollection.name} / ${desiredMode.name}`,
          }),
        );
        continue;
      }

      if (!existing) {
        items.push(
          planItem({
            after: stableStringify(desiredMode),
            applicable: !parentBlocked,
            canonicalId: `${desiredCollection.id}:${desiredMode.id}`,
            category: parentBlocked ? "conflict" : "create",
            detail: parentBlocked
              ? "The target collection is blocked by an unmanaged name collision."
              : "The managed mode does not exist yet.",
            entity: "mode",
            label: `${desiredCollection.name} / ${desiredMode.name}`,
          }),
        );
        continue;
      }

      const changed = existing.name !== desiredMode.name;
      items.push(
        planItem({
          ...(changed ? { after: stableStringify(desiredMode) } : {}),
          applicable: true,
          ...(changed ? { before: stableStringify(existing) } : {}),
          canonicalId: `${desiredCollection.id}:${desiredMode.id}`,
          category: changed ? "update" : "unchanged",
          detail: changed
            ? "The managed mode name differs from the manifest."
            : "The managed mode matches the manifest.",
          entity: "mode",
          figmaId: existing.figmaId,
          label: `${desiredCollection.name} / ${desiredMode.name}`,
        }),
      );
    }

    if (!collection) {
      continue;
    }
    for (const mode of collection.modes) {
      const retainedById = mode.canonicalId && desiredModeIds.has(mode.canonicalId);
      if (mode.canonicalId && !retainedById) {
        const protectsUnmanagedVariables = hasUnmanagedVariables(collection, current);
        items.push(
          planItem({
            applicable: !protectsUnmanagedVariables,
            before: stableStringify(mode),
            canonicalId: `${desiredCollection.id}:${mode.canonicalId ?? `unmapped-${mode.figmaId}`}`,
            category: "stale",
            detail: protectsUnmanagedVariables
              ? "This mode is stale but unmanaged variables use the collection, so Prune will preserve it."
              : "This mode exists only in the managed Figma collection.",
            entity: "mode",
            figmaId: mode.figmaId,
            label: `${desiredCollection.name} / ${mode.name}`,
          }),
        );
      }
    }
  }

  return items;
}

function variableItems(manifest: TokenManifest, current: CurrentDocument) {
  const items: DiffItem[] = [];
  const desiredIds = new Set(manifest.variables.map((variable) => variable.id));
  const managedById = new Map<string, typeof current.variables>();
  for (const variable of current.variables) {
    if (!variable.canonicalId) {
      continue;
    }
    const matches = managedById.get(variable.canonicalId) ?? [];
    matches.push(variable);
    managedById.set(variable.canonicalId, matches);
  }

  for (const desired of manifest.variables) {
    const matches = managedById.get(desired.id) ?? [];
    if (matches.length > 1) {
      for (const match of matches) {
        items.push(
          planItem({
            after: stableStringify(desired),
            applicable: false,
            before: stableStringify(match.shape),
            canonicalId: desired.id,
            category: "conflict",
            detail: "More than one managed variable claims this canonical token path.",
            entity: "variable",
            figmaId: match.figmaId,
            label: desired.name,
          }),
        );
      }
      continue;
    }

    const existing = matches[0];
    if (!existing) {
      const targetCollection = current.collections.find(
        (collection) => collection.canonicalId === desired.collectionId,
      );
      const parentBlocked =
        !targetCollection &&
        current.collections.some(
          (collection) =>
            !collection.canonicalId &&
            collection.name ===
              manifest.collections.find((candidate) => candidate.id === desired.collectionId)?.name,
        );
      const collision = current.variables.find(
        (variable) =>
          !variable.canonicalId &&
          variable.shape.collectionId === desired.collectionId &&
          variable.shape.name === desired.name,
      );
      items.push(
        planItem({
          after: stableStringify(desired),
          applicable: !collision && !parentBlocked,
          ...(collision ? { before: stableStringify(collision.shape) } : {}),
          canonicalId: desired.id,
          category: collision || parentBlocked ? "conflict" : "create",
          detail: collision
            ? "An unmanaged variable already uses this canonical name in the target collection."
            : parentBlocked
              ? "The target collection is blocked by an unmanaged name collision."
              : "The managed variable does not exist yet.",
          entity: "variable",
          ...(collision ? { figmaId: collision.figmaId } : {}),
          label: desired.name,
        }),
      );
      continue;
    }

    if (
      existing.shape.type !== desired.type ||
      existing.shape.collectionId !== desired.collectionId
    ) {
      items.push(
        planItem({
          after: stableStringify(desired),
          applicable: false,
          before: stableStringify(existing.shape),
          canonicalId: desired.id,
          category: "conflict",
          detail:
            "A managed variable cannot change its Figma type or owning collection without explicit removal.",
          entity: "variable",
          figmaId: existing.figmaId,
          label: desired.name,
        }),
      );
      continue;
    }

    const desiredFingerprint = variableFingerprint(desired);
    const currentFingerprint = variableFingerprint(existing.shape);
    if (desiredFingerprint === currentFingerprint) {
      items.push(
        planItem({
          applicable: true,
          canonicalId: desired.id,
          category: "unchanged",
          detail: "The managed variable matches the manifest.",
          entity: "variable",
          figmaId: existing.figmaId,
          label: desired.name,
        }),
      );
      continue;
    }

    const isRepositoryUpdate =
      existing.appliedFingerprint !== undefined &&
      existing.appliedFingerprint === currentFingerprint;
    items.push(
      planItem({
        after: stableStringify(desired),
        applicable: true,
        before: stableStringify(existing.shape),
        canonicalId: desired.id,
        category: isRepositoryUpdate ? "update" : "conflict",
        detail: isRepositoryUpdate
          ? "The repository value changed since the last successful Apply."
          : "The managed Figma value drifted from its last applied repository snapshot.",
        entity: "variable",
        figmaId: existing.figmaId,
        label: desired.name,
      }),
    );
  }

  for (const variable of current.variables) {
    if (variable.canonicalId && !desiredIds.has(variable.canonicalId)) {
      items.push(
        planItem({
          applicable: true,
          before: stableStringify(variable.shape),
          canonicalId: variable.canonicalId,
          category: "stale",
          detail: "The managed variable is no longer present in the manifest.",
          entity: "variable",
          figmaId: variable.figmaId,
          label: variable.shape.name,
        }),
      );
    }
  }

  return items;
}

export function buildSyncPlan(manifest: TokenManifest, current: CurrentDocument): SyncPlan {
  const items = [
    ...collectionItems(manifest, current),
    ...modeItems(manifest, current),
    ...variableItems(manifest, current),
  ].sort((left, right) => {
    const categoryOrder: DiffCategory[] = ["conflict", "create", "update", "stale", "unchanged"];
    return (
      categoryOrder.indexOf(left.category) - categoryOrder.indexOf(right.category) ||
      left.entity.localeCompare(right.entity) ||
      left.canonicalId.localeCompare(right.canonicalId)
    );
  });
  const counts: Record<DiffCategory, number> = {
    conflict: 0,
    create: 0,
    stale: 0,
    unchanged: 0,
    update: 0,
  };
  for (const item of items) {
    counts[item.category] += 1;
  }

  return {
    counts,
    hasBlockingConflicts: items.some((item) => item.category === "conflict" && !item.applicable),
    items,
    manifest: {
      contentHash: manifest.contentHash,
      sourceRevision: manifest.sourceRevision,
    },
    metadataChanged:
      current.appliedManifest?.contentHash !== manifest.contentHash ||
      current.appliedManifest?.schemaVersion !== manifest.schemaVersion ||
      current.appliedManifest?.sourceRevision !== manifest.sourceRevision,
  };
}
