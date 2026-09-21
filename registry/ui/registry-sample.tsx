import type { ThemeBrand } from "@mflisikowski/tokens/runtime";
import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

import { registrySampleLabel } from "@/lib/registry-sample-label";

export type RegistrySampleProps = Omit<ComponentPropsWithoutRef<"p">, "children"> & {
  brand: ThemeBrand;
  label?: string;
};

export function RegistrySample({ brand, className, label, ...props }: RegistrySampleProps) {
  return (
    <p {...props} className={clsx(className)} data-mfd-registry-sample="">
      {label ?? registrySampleLabel(brand)}
    </p>
  );
}
