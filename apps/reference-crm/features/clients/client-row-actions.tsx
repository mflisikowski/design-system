"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Icon, IconButton } from "@/components/ui/icon";

import type { Client } from "./model";

type ClientRowActionsProps = Readonly<{
  client: Client;
}>;

export function ClientRowActions({ client }: ClientRowActionsProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (open) {
      menuItemRef.current?.focus();
    }
  }, [open]);

  function closeMenu({ restoreFocus = false } = {}) {
    setOpen(false);
    if (restoreFocus) {
      buttonRef.current?.focus();
    }
  }

  return (
    <div
      className="client-row-actions"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          closeMenu();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          closeMenu({ restoreFocus: true });
        }
      }}
    >
      <IconButton
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        label={`More actions for ${client.organizationName}`}
        onClick={() => setOpen((current) => !current)}
        ref={buttonRef}
      >
        <Icon name="ellipsis" />
      </IconButton>
      <div
        aria-label={`Actions for ${client.organizationName}`}
        className="client-row-actions__menu"
        hidden={!open}
        id={menuId}
        role="menu"
      >
        <a href={`mailto:${client.contactEmail}`} ref={menuItemRef} role="menuitem">
          Email {client.contactName}
        </a>
      </div>
    </div>
  );
}
