import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

import "./table.css";

export function Table({ className, ...props }: ComponentPropsWithoutRef<"table">) {
  return <table {...props} className={clsx("mfd-table", className)} />;
}

export function TableCaption({ className, ...props }: ComponentPropsWithoutRef<"caption">) {
  return <caption {...props} className={clsx("mfd-table__caption", className)} />;
}

export function TableHeader({ className, ...props }: ComponentPropsWithoutRef<"thead">) {
  return <thead {...props} className={clsx("mfd-table__header", className)} />;
}

export function TableBody({ className, ...props }: ComponentPropsWithoutRef<"tbody">) {
  return <tbody {...props} className={clsx("mfd-table__body", className)} />;
}

export function TableRow({ className, ...props }: ComponentPropsWithoutRef<"tr">) {
  return <tr {...props} className={clsx("mfd-table__row", className)} />;
}

export function TableHead({ className, scope = "col", ...props }: ComponentPropsWithoutRef<"th">) {
  return <th {...props} className={clsx("mfd-table__head", className)} scope={scope} />;
}

export function TableCell({ className, ...props }: ComponentPropsWithoutRef<"td">) {
  return <td {...props} className={clsx("mfd-table__cell", className)} />;
}
