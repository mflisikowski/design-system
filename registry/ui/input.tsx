"use client";

import { clsx } from "clsx";
import type { ComponentPropsWithRef } from "react";

import { useFieldControlProps } from "./field";
import "./input.css";

export type InputProps = Omit<ComponentPropsWithRef<"input">, "size"> & {
  size?: "sm" | "md" | "lg";
};

export function Input({ className, size = "md", ...props }: InputProps) {
  const fieldProps = useFieldControlProps(props);
  return (
    <input {...props} {...fieldProps} className={clsx("mfd-input", className)} data-size={size} />
  );
}
