"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import type { ComponentPropsWithRef, ReactElement, ReactNode, RefObject } from "react";

import "./dialog.css";

export type DialogOpenChangeReason =
  | "trigger"
  | "outside"
  | "escape"
  | "close"
  | "focus-out"
  | "programmatic";

export type DialogOpenChangeDetails = Readonly<{
  cancel: () => void;
  event: Event;
  reason: DialogOpenChangeReason;
}>;

export type DialogProps = Readonly<{
  children?: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  open?: boolean;
}>;

function mfdOpenChangeReason(reason: string): DialogOpenChangeReason {
  switch (reason) {
    case "trigger-press":
      return "trigger";
    case "outside-press":
      return "outside";
    case "escape-key":
      return "escape";
    case "close-press":
      return "close";
    case "focus-out":
      return "focus-out";
    default:
      return "programmatic";
  }
}

export function Dialog({ children, defaultOpen, onOpenChange, open }: DialogProps) {
  return (
    <BaseDialog.Root
      defaultOpen={defaultOpen}
      onOpenChange={(nextOpen, details) =>
        onOpenChange?.(nextOpen, {
          cancel: details.cancel,
          event: details.event,
          reason: mfdOpenChangeReason(details.reason),
        })
      }
      open={open}
    >
      {children}
    </BaseDialog.Root>
  );
}

type DialogButtonProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  children?: ReactNode;
  render?: ReactElement<Record<string, unknown>>;
};

export type DialogTriggerProps = DialogButtonProps;

export function DialogTrigger(props: DialogTriggerProps) {
  return <BaseDialog.Trigger {...props} />;
}

export type DialogCloseProps = DialogButtonProps;

export function DialogClose(props: DialogCloseProps) {
  return <BaseDialog.Close {...props} />;
}

export type DialogTitleProps = ComponentPropsWithRef<"h2">;

export function DialogTitle(props: DialogTitleProps) {
  return <BaseDialog.Title {...props} />;
}

export type DialogDescriptionProps = ComponentPropsWithRef<"p">;

export function DialogDescription(props: DialogDescriptionProps) {
  return <BaseDialog.Description {...props} />;
}

export type DialogInteractionType = "mouse" | "touch" | "pen" | "keyboard" | "unknown";
type DialogFocusTarget =
  | boolean
  | RefObject<HTMLElement | null>
  | ((interactionType: DialogInteractionType) => boolean | HTMLElement | null | undefined);

export type DialogContentProps = Omit<ComponentPropsWithRef<"div">, "size"> & {
  closeDisabled?: boolean;
  finalFocus?: DialogFocusTarget;
  initialFocus?: DialogFocusTarget;
  size?: "sm" | "md" | "lg";
};

function baseFocusTarget(focus: DialogFocusTarget | undefined) {
  if (typeof focus !== "function") {
    return focus;
  }
  return (interactionType: "mouse" | "touch" | "pen" | "keyboard" | "") =>
    focus(interactionType || "unknown");
}

export function DialogContent({
  children,
  className,
  closeDisabled = false,
  finalFocus,
  initialFocus,
  size = "md",
  ...props
}: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="mfd-dialog__backdrop" />
      <BaseDialog.Viewport className="mfd-dialog__viewport">
        <BaseDialog.Popup
          {...props}
          className={clsx("mfd-dialog__content", className)}
          data-size={size}
          finalFocus={baseFocusTarget(finalFocus)}
          initialFocus={baseFocusTarget(initialFocus)}
        >
          {children}
          <BaseDialog.Close
            aria-label="Close"
            className="mfd-dialog__close"
            disabled={closeDisabled}
          >
            <span aria-hidden="true">×</span>
          </BaseDialog.Close>
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

export type DialogHeaderProps = ComponentPropsWithRef<"header">;

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <header {...props} className={clsx("mfd-dialog__header", className)} />;
}

export type DialogBodyProps = ComponentPropsWithRef<"div">;

export function DialogBody({ className, ...props }: DialogBodyProps) {
  return <div {...props} className={clsx("mfd-dialog__body", className)} />;
}

export type DialogFooterProps = ComponentPropsWithRef<"footer">;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <footer {...props} className={clsx("mfd-dialog__footer", className)} />;
}
