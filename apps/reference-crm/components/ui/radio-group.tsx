"use client";

import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import type { BaseUIEvent } from "@base-ui/react/types";
import { clsx } from "clsx";
import type { ComponentPropsWithRef, KeyboardEvent, ReactNode } from "react";

import "./radio-group.css";

export type RadioGroupOrientation = "horizontal" | "vertical";

export type RadioGroupRootProps<Value> = BaseRadioGroup.Props<Value> & {
  loading?: boolean;
  orientation?: RadioGroupOrientation;
};

export function RadioGroupRoot<Value>({
  "aria-busy": ariaBusy,
  className,
  loading = false,
  onKeyDownCapture,
  orientation = "vertical",
  readOnly,
  ...props
}: RadioGroupRootProps<Value>) {
  const handleKeyDownCapture = (event: BaseUIEvent<KeyboardEvent<HTMLDivElement>>) => {
    onKeyDownCapture?.(event);
    const isVerticalArrow = event.key === "ArrowUp" || event.key === "ArrowDown";
    const isHorizontalArrow = event.key === "ArrowLeft" || event.key === "ArrowRight";
    if (
      (orientation === "vertical" && isHorizontalArrow) ||
      (orientation === "horizontal" && isVerticalArrow)
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <BaseRadioGroup
      {...props}
      aria-busy={loading || ariaBusy || undefined}
      aria-orientation={orientation}
      className={clsx("mfd-radio-group", className)}
      data-orientation={orientation}
      onKeyDownCapture={handleKeyDownCapture}
      readOnly={loading || readOnly}
    />
  );
}

export type RadioGroupItemProps<Value> = ComponentPropsWithRef<typeof BaseRadio.Root<Value>>;

export function RadioGroupItem<Value>({
  className,
  children,
  ...props
}: RadioGroupItemProps<Value>) {
  return (
    <BaseRadio.Root {...props} className={clsx("mfd-radio-group__item", className)}>
      {children ?? <BaseRadio.Indicator className="mfd-radio-group__indicator" />}
    </BaseRadio.Root>
  );
}

export type RadioGroupIndicatorProps = ComponentPropsWithRef<typeof BaseRadio.Indicator>;

export function RadioGroupIndicator({ className, ...props }: RadioGroupIndicatorProps) {
  return (
    <BaseRadio.Indicator {...props} className={clsx("mfd-radio-group__indicator", className)} />
  );
}

export type RadioCardProps<Value> = Omit<RadioGroupItemProps<Value>, "children"> & {
  children: ReactNode;
  description?: ReactNode;
  preview?: ReactNode;
};

export function RadioCard<Value>({
  children,
  className,
  description,
  preview,
  ...props
}: RadioCardProps<Value>) {
  return (
    <label className={clsx("mfd-radio-card", className)}>
      <RadioGroupItem {...props}>
        <RadioGroupIndicator />
      </RadioGroupItem>
      {preview ? (
        <span aria-hidden="true" className="mfd-radio-card__preview">
          {preview}
        </span>
      ) : null}
      <span className="mfd-radio-card__content">
        <span className="mfd-radio-card__label">{children}</span>
        {description ? <span className="mfd-radio-card__description">{description}</span> : null}
      </span>
    </label>
  );
}

export type RadioGroupParts = Readonly<{
  Root: typeof RadioGroupRoot;
  Item: typeof RadioGroupItem;
  Indicator: typeof RadioGroupIndicator;
  Card: typeof RadioCard;
}>;

export const RadioGroup: RadioGroupParts = {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
  Indicator: RadioGroupIndicator,
  Card: RadioCard,
};
