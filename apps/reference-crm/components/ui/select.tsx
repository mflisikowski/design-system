"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { clsx } from "clsx";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { createContext, useContext } from "react";

import "./select.css";

const SelectLoadingContext = createContext(false);

export type SelectRootProps<Value> = BaseSelect.Root.Props<Value> & {
  loading?: boolean;
};

export function SelectRoot<Value>({ loading = false, readOnly, ...props }: SelectRootProps<Value>) {
  return (
    <SelectLoadingContext value={loading}>
      <BaseSelect.Root {...props} readOnly={loading || readOnly} />
    </SelectLoadingContext>
  );
}

export type SelectTriggerProps = ComponentPropsWithRef<typeof BaseSelect.Trigger> & {
  loading?: boolean;
  size?: "sm" | "md" | "lg";
};

export function SelectTrigger({
  "aria-busy": ariaBusy,
  className,
  loading,
  size = "md",
  ...props
}: SelectTriggerProps) {
  const rootLoading = useContext(SelectLoadingContext);
  const isLoading = loading ?? rootLoading;

  return (
    <BaseSelect.Trigger
      {...props}
      aria-busy={isLoading || ariaBusy || undefined}
      className={clsx("mfd-select__trigger", className)}
      data-size={size}
    />
  );
}

export type SelectValueProps = ComponentPropsWithRef<typeof BaseSelect.Value>;

export function SelectValue(props: SelectValueProps) {
  return <BaseSelect.Value {...props} />;
}

export type SelectIconProps = ComponentPropsWithRef<typeof BaseSelect.Icon> & {
  loading?: boolean;
};

export function SelectIcon({ className, children = "⌄", loading, ...props }: SelectIconProps) {
  const rootLoading = useContext(SelectLoadingContext);
  const isLoading = loading ?? rootLoading;

  return (
    <BaseSelect.Icon {...props} className={clsx("mfd-select__icon", className)}>
      <span aria-hidden="true" className={isLoading ? "mfd-select__spinner" : undefined}>
        {isLoading ? null : children}
      </span>
    </BaseSelect.Icon>
  );
}

export type SelectContentProps = ComponentPropsWithRef<typeof BaseSelect.Popup> & {
  children?: ReactNode;
};

export function SelectContent({ children, className, ...props }: SelectContentProps) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner className="mfd-select__positioner" sideOffset={4}>
        <BaseSelect.Popup {...props} className={clsx("mfd-select__popup", className)}>
          <BaseSelect.List>{children}</BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export type SelectItemProps = ComponentPropsWithRef<typeof BaseSelect.Item>;

export function SelectItem({ children, className, ...props }: SelectItemProps) {
  return (
    <BaseSelect.Item {...props} className={clsx("mfd-select__item", className)}>
      <span className="mfd-select__item-label">{children}</span>
      <BaseSelect.ItemIndicator className="mfd-select__item-indicator">✓</BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

export type SelectItemIndicatorProps = ComponentPropsWithRef<typeof BaseSelect.ItemIndicator>;

export function SelectItemIndicator(props: SelectItemIndicatorProps) {
  return <BaseSelect.ItemIndicator {...props} />;
}

export type SelectProps = Readonly<{
  Root: typeof SelectRoot;
  Trigger: typeof SelectTrigger;
  Value: typeof SelectValue;
  Icon: typeof SelectIcon;
  Content: typeof SelectContent;
  Item: typeof SelectItem;
  ItemIndicator: typeof SelectItemIndicator;
}>;

export const Select: SelectProps = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Icon: SelectIcon,
  Content: SelectContent,
  Item: SelectItem,
  ItemIndicator: SelectItemIndicator,
};
