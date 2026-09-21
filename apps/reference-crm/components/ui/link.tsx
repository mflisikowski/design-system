"use client";

import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";

import "./link.css";

export type LinkProps = useRender.ComponentProps<"a"> & {
  variant?: "inline" | "standalone";
};

export function Link({ className, render, variant = "inline", ...props }: LinkProps) {
  return useRender({
    defaultTagName: "a",
    props: {
      ...props,
      className: clsx("mfd-link", className),
      "data-variant": variant,
    },
    render,
  });
}
