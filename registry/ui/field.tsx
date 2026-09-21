"use client";

import { clsx } from "clsx";
import {
  type AriaAttributes,
  type ComponentPropsWithRef,
  createContext,
  type ReactNode,
  useContext,
  useId,
} from "react";

import "./field.css";

type FieldContextValue = Readonly<{
  controlId: string;
  descriptionId: string;
  errorId: string;
  invalid: boolean;
}>;

const FieldContext = createContext<FieldContextValue | null>(null);

function useFieldContext(part: string) {
  const context = useContext(FieldContext);
  if (!context) {
    throw new Error(`${part} must be rendered inside Field.`);
  }
  return context;
}

export type FieldProps = ComponentPropsWithRef<"div"> & {
  invalid?: boolean;
};

export function Field({ children, className, invalid = false, ...props }: FieldProps) {
  const id = useId();
  const context = {
    controlId: `${id}-control`,
    descriptionId: `${id}-description`,
    errorId: `${id}-error`,
    invalid,
  };

  return (
    <FieldContext.Provider value={context}>
      <div {...props} className={clsx("mfd-field", className)} data-invalid={invalid || undefined}>
        {children}
      </div>
    </FieldContext.Provider>
  );
}

export type FieldLabelProps = ComponentPropsWithRef<"label">;

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  const field = useFieldContext("FieldLabel");
  return (
    <label {...props} className={clsx("mfd-field__label", className)} htmlFor={field.controlId} />
  );
}

export type FieldDescriptionProps = ComponentPropsWithRef<"p">;

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  const field = useFieldContext("FieldDescription");
  return (
    <p {...props} className={clsx("mfd-field__description", className)} id={field.descriptionId} />
  );
}

export type FieldErrorProps = ComponentPropsWithRef<"p"> & {
  children: ReactNode;
};

export function FieldError({ className, ...props }: FieldErrorProps) {
  const field = useFieldContext("FieldError");
  if (!field.invalid) {
    return null;
  }

  return <p {...props} className={clsx("mfd-field__error", className)} id={field.errorId} />;
}

export function useFieldControlProps(props: {
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  id?: string;
}) {
  const field = useFieldContext("A field control");
  const describedBy = [
    field.descriptionId,
    field.invalid ? field.errorId : undefined,
    props["aria-describedby"],
  ]
    .filter(Boolean)
    .join(" ");

  return {
    "aria-describedby": describedBy || undefined,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
    id: field.controlId,
  } as const;
}
