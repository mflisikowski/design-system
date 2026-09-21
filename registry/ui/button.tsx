"use client";

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
  "aria-busy": ariaBusy,
  "aria-disabled": ariaDisabled,
  children,
  className,
  disabled,
  loading = false,
  loadingLabel = "Loading",
  onClick,
  size = "md",
  type = "button",
  variant = "accent",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={loading || ariaBusy || undefined}
      aria-disabled={loading || ariaDisabled || undefined}
      className={clsx("mfd-button", className)}
      data-size={size}
      data-variant={variant}
      disabled={disabled}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
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
