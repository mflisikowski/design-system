import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

import "./alert.css";

export type AlertProps = ComponentPropsWithoutRef<"div"> & {
  tone?: "danger" | "success";
  live?: boolean;
};

export function Alert({ className, live = false, tone = "danger", ...props }: AlertProps) {
  return (
    <div
      {...props}
      className={clsx("mfd-alert", className)}
      data-tone={tone}
      role={live ? "alert" : undefined}
    />
  );
}

export function AlertTitle({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return <h2 {...props} className={clsx("mfd-alert__title", className)} />;
}

export function AlertDescription({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div {...props} className={clsx("mfd-alert__description", className)} />;
}

export function AlertAction({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div {...props} className={clsx("mfd-alert__action", className)} />;
}
