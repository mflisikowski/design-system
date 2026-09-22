"use client";

import { clsx } from "clsx";
import type { ChangeEventHandler, ComponentPropsWithRef, KeyboardEvent } from "react";
import { useRef, useState } from "react";

import { useFieldControlProps } from "./field";
import { Icon } from "./icon";
import "./search-field.css";

export type SearchFieldProps = Omit<
  ComponentPropsWithRef<"input">,
  "defaultValue" | "onChange" | "onKeyDown" | "onSubmit" | "size" | "type" | "value"
> & {
  defaultValue?: string;
  loading?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onClear?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSubmit?: (value: string) => void;
  onValueChange?: (value: string) => void;
  size?: "sm" | "md" | "lg";
  value?: string;
};

export function SearchField({
  className,
  defaultValue = "",
  disabled,
  loading = false,
  onChange,
  onClear,
  onKeyDown,
  onSubmit,
  onValueChange,
  size = "md",
  value,
  ...props
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = value ?? uncontrolledValue;
  const fieldProps = useFieldControlProps(props);

  function updateValue(nextValue: string) {
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  function clearValue() {
    if (disabled) {
      return;
    }

    updateValue("");
    onClear?.();
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Escape" && currentValue) {
      event.preventDefault();
      clearValue();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit?.(event.currentTarget.value);
    }
  }

  return (
    <div
      className={clsx("mfd-search-field", className)}
      data-loading={loading || undefined}
      data-size={size}
    >
      <span aria-hidden="true" className="mfd-search-field__leading-icon">
        <Icon name="search" />
      </span>
      <input
        {...props}
        {...fieldProps}
        ref={inputRef}
        className="mfd-search-field__input"
        disabled={disabled}
        onChange={(event) => {
          updateValue(event.target.value);
          onChange?.(event);
        }}
        onKeyDown={handleKeyDown}
        type="search"
        value={currentValue}
      />
      {currentValue && !disabled ? (
        <button
          aria-label="Clear search"
          className="mfd-search-field__clear"
          onClick={clearValue}
          type="button"
        >
          <Icon name="close" />
        </button>
      ) : null}
      {loading ? <span aria-hidden="true" className="mfd-search-field__loading" /> : null}
    </div>
  );
}
