import { clsx } from "clsx";
import type { ComponentPropsWithRef } from "react";

import "./badge.css";

export type BadgeTone = "neutral" | "accent" | "warning" | "success" | "danger";

export type BadgeProps = ComponentPropsWithRef<"span"> & {
  tone?: BadgeTone;
  size?: "sm" | "md";
};

export function Badge({ className, size = "md", tone = "neutral", ...props }: BadgeProps) {
  return (
    <span {...props} className={clsx("mfd-badge", className)} data-size={size} data-tone={tone} />
  );
}
