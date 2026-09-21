import { clsx } from "clsx";
import type { ComponentPropsWithRef } from "react";

import "./link.css";

export type LinkProps = ComponentPropsWithRef<"a"> & {
  variant?: "inline" | "standalone";
};

export function Link({ className, variant = "inline", ...props }: LinkProps) {
  return <a {...props} className={clsx("mfd-link", className)} data-variant={variant} />;
}
