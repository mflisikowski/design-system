import { clsx } from "clsx";
import {
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Ellipsis,
  type LucideIcon,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { ComponentPropsWithRef } from "react";

import "./icon.css";

const iconMap = {
  plus: Plus,
  close: X,
  success: CircleCheck,
  error: CircleAlert,
  users: Users,
  search: Search,
  ellipsis: Ellipsis,
  "chevron-down": ChevronDown,
  trash: Trash2,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;

export type IconProps = Omit<ComponentPropsWithRef<"svg">, "children"> & {
  name: IconName;
  size?: "sm" | "md" | "lg";
  label?: string;
};

export function Icon({ className, label, name, size = "md", ...props }: IconProps) {
  const Glyph = iconMap[name];

  return (
    <Glyph
      {...props}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={clsx("mfd-icon", className)}
      data-size={size}
      role={label ? "img" : undefined}
      strokeWidth={2}
    />
  );
}

export type IconButtonProps = Omit<ComponentPropsWithRef<"button">, "aria-label"> & {
  label: string;
  size?: "sm" | "md" | "lg";
};

export function IconButton({
  children,
  className,
  label,
  size = "md",
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      aria-label={label}
      className={clsx("mfd-icon-button", className)}
      data-size={size}
      type={type}
    >
      {children}
    </button>
  );
}
