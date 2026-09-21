import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

import "./empty-state.css";

export function EmptyState({ className, ...props }: ComponentPropsWithoutRef<"section">) {
  return <section {...props} className={clsx("mfd-empty-state", className)} />;
}

export function EmptyStateIcon({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div {...props} aria-hidden="true" className={clsx("mfd-empty-state__icon", className)} />;
}

export function EmptyStateTitle({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return <h2 {...props} className={clsx("mfd-empty-state__title", className)} />;
}

export function EmptyStateDescription({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p {...props} className={clsx("mfd-empty-state__description", className)} />;
}

export function EmptyStateActions({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div {...props} className={clsx("mfd-empty-state__actions", className)} />;
}
