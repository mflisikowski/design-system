import { clsx } from "clsx";
import type { ComponentPropsWithRef } from "react";

import "./button.css";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: "accent" | "neutral" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({
  children,
  className,
  disabled,
  loading = false,
  loadingLabel = "Loading",
  size = "md",
  type = "button",
  variant = "accent",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={clsx("mfd-button", className)}
      data-size={size}
      data-variant={variant}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? (
        <>
          <span aria-hidden="true" className="mfd-button__spinner" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
