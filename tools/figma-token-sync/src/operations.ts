import type { DiffItem, SyncPlan } from "./contract";

export function applyItems(plan: SyncPlan): DiffItem[] {
  if (plan.hasBlockingConflicts) {
    throw new Error(
      "Apply is blocked until unmanaged collisions or incompatible managed variables are resolved.",
    );
  }
  return plan.items.filter(
    (item) =>
      item.applicable &&
      (item.category === "create" || item.category === "update" || item.category === "conflict"),
  );
}

export function pruneItems(plan: SyncPlan, confirmation: string): DiffItem[] {
  if (confirmation !== "PRUNE") {
    throw new Error("Prune requires the explicit PRUNE confirmation.");
  }
  return plan.items.filter((item) => item.applicable && item.category === "stale" && item.figmaId);
}
