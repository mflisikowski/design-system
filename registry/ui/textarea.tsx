"use client";

import { clsx } from "clsx";
import type { ComponentPropsWithRef } from "react";

import { useFieldControlProps } from "./field";
import "./input.css";

export type TextareaProps = Omit<ComponentPropsWithRef<"textarea">, "size"> & {
  size?: "sm" | "md" | "lg";
};

export function Textarea({ className, size = "md", ...props }: TextareaProps) {
  const fieldProps = useFieldControlProps(props);
  return (
    <textarea
      {...props}
      {...fieldProps}
      className={clsx("mfd-textarea", className)}
      data-size={size}
    />
  );
}
