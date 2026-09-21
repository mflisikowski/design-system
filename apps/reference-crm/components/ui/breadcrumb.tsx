"use client";

import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

import { Link, type LinkProps } from "./link";

import "./breadcrumb.css";

export function Breadcrumb({ className, ...props }: ComponentPropsWithoutRef<"nav">) {
  return <nav {...props} aria-label="Breadcrumb" className={clsx("mfd-breadcrumb", className)} />;
}

export function BreadcrumbList({ className, ...props }: ComponentPropsWithoutRef<"ol">) {
  return <ol {...props} className={clsx("mfd-breadcrumb__list", className)} />;
}

export function BreadcrumbItem({ className, ...props }: ComponentPropsWithoutRef<"li">) {
  return <li {...props} className={clsx("mfd-breadcrumb__item", className)} />;
}

export function BreadcrumbLink({ className, ...props }: Omit<LinkProps, "variant">) {
  return <Link {...props} className={className} variant="standalone" />;
}

export function BreadcrumbCurrent({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return (
    <span {...props} aria-current="page" className={clsx("mfd-breadcrumb__current", className)} />
  );
}

export function BreadcrumbSeparator({ className, ...props }: ComponentPropsWithoutRef<"li">) {
  return (
    <li {...props} aria-hidden="true" className={clsx("mfd-breadcrumb__separator", className)}>
      <span>/</span>
    </li>
  );
}
