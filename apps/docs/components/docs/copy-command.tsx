"use client";

import { useEffect, useRef, useState } from "react";

type CopyCommandProps = Readonly<{
  command: string;
}>;

export function CopyCommand({ command }: CopyCommandProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (status !== "idle") {
      buttonRef.current?.focus();
    }
  }, [status]);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  const label = status === "copied" ? "Copied" : status === "failed" ? "Try again" : "Copy";

  return (
    <>
      <button data-docs="copy-command" onClick={copyCommand} ref={buttonRef} type="button">
        {label}
      </button>
      <span aria-live="polite" data-docs="visually-hidden">
        {status === "copied" ? "Command copied to clipboard." : null}
        {status === "failed" ? "Copy failed. Select and copy the command manually." : null}
      </span>
    </>
  );
}
