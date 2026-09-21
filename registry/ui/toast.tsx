"use client";

import { toast as sonnerToast, Toaster } from "sonner";

import "./toast.css";

export const toast = {
  success(message: string) {
    return sonnerToast.success(message);
  },
} as const;

export function ToastViewport() {
  return (
    <Toaster
      closeButton
      duration={4000}
      gap={8}
      position="bottom-right"
      toastOptions={{ className: "mfd-toast" }}
      visibleToasts={3}
    />
  );
}
