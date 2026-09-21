"use client";

import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  createContext,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useContext,
} from "react";

import "./alert-dialog.css";

export type AlertDialogOpenChangeReason =
  | "trigger"
  | "outside"
  | "escape"
  | "close"
  | "focus-out"
  | "programmatic";

export type AlertDialogOpenChangeDetails = Readonly<{
  cancel: () => void;
  event: Event;
  reason: AlertDialogOpenChangeReason;
}>;

export type AlertDialogProps = Readonly<{
  children?: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: AlertDialogOpenChangeDetails) => void;
  open?: boolean;
  pending?: boolean;
}>;

const AlertDialogPendingContext = createContext(false);

function mfdOpenChangeReason(reason: string): AlertDialogOpenChangeReason {
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

export function AlertDialog({
  children,
  defaultOpen,
  onOpenChange,
  open,
  pending = false,
}: AlertDialogProps) {
  return (
    <AlertDialogPendingContext value={pending}>
      <BaseAlertDialog.Root
        defaultOpen={defaultOpen}
        onOpenChange={(nextOpen, details) => {
          if (!nextOpen && pending) {
            details.cancel();
            return;
          }
          onOpenChange?.(nextOpen, {
            cancel: details.cancel,
            event: details.event,
            reason: mfdOpenChangeReason(details.reason),
          });
        }}
        open={open}
      >
        {children}
      </BaseAlertDialog.Root>
    </AlertDialogPendingContext>
  );
}

type AlertDialogButtonProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  children?: ReactNode;
  render?: ReactElement<Record<string, unknown>>;
};

export type AlertDialogTriggerProps = AlertDialogButtonProps;

export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <BaseAlertDialog.Trigger {...props} />;
}

export type AlertDialogInteractionType = "mouse" | "touch" | "pen" | "keyboard" | "unknown";
export type AlertDialogFocusTarget =
  | boolean
  | RefObject<HTMLElement | null>
  | ((interactionType: AlertDialogInteractionType) => boolean | HTMLElement | null | undefined);

export type AlertDialogContentProps = ComponentPropsWithRef<"div"> & {
  finalFocus?: AlertDialogFocusTarget;
  initialFocus?: AlertDialogFocusTarget;
};

function baseFocusTarget(focus: AlertDialogFocusTarget | undefined) {
  if (typeof focus !== "function") {
    return focus;
  }
  return (interactionType: "mouse" | "touch" | "pen" | "keyboard" | "") =>
    focus(interactionType || "unknown");
}

export function AlertDialogContent({
  children,
  className,
  finalFocus,
  initialFocus,
  ...props
}: AlertDialogContentProps) {
  const pending = useContext(AlertDialogPendingContext);

  return (
    <BaseAlertDialog.Portal>
      <BaseAlertDialog.Backdrop className="mfd-alert-dialog__backdrop" />
      <BaseAlertDialog.Viewport className="mfd-alert-dialog__viewport">
        <BaseAlertDialog.Popup
          {...props}
          aria-busy={pending || undefined}
          className={clsx("mfd-alert-dialog__content", className)}
          finalFocus={baseFocusTarget(finalFocus)}
          initialFocus={baseFocusTarget(initialFocus)}
        >
          {children}
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Viewport>
    </BaseAlertDialog.Portal>
  );
}

export type AlertDialogTitleProps = ComponentPropsWithRef<"h2">;

export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <BaseAlertDialog.Title {...props} className={clsx("mfd-alert-dialog__title", className)} />
  );
}

export type AlertDialogDescriptionProps = ComponentPropsWithRef<"p">;

export function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <BaseAlertDialog.Description
      {...props}
      className={clsx("mfd-alert-dialog__description", className)}
    />
  );
}

export type AlertDialogFooterProps = ComponentPropsWithRef<"footer">;

export function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return <footer {...props} className={clsx("mfd-alert-dialog__footer", className)} />;
}

export type AlertDialogCancelProps = AlertDialogButtonProps;

export function AlertDialogCancel({ disabled, ...props }: AlertDialogCancelProps) {
  const pending = useContext(AlertDialogPendingContext);
  return <BaseAlertDialog.Close {...props} disabled={disabled || pending} />;
}

export type AlertDialogActionProps = useRender.ComponentProps<"button">;

export function AlertDialogAction({
  "aria-disabled": ariaDisabled,
  disabled,
  onClick,
  render,
  type = "button",
  ...props
}: AlertDialogActionProps) {
  const pending = useContext(AlertDialogPendingContext);
  return useRender({
    defaultTagName: "button",
    props: {
      ...props,
      "aria-disabled": pending || ariaDisabled || undefined,
      disabled,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        if (pending) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      },
      type,
    },
    render,
  });
}
