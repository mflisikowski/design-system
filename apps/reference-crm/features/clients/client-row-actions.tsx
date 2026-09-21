"use client";

import { Menu } from "@base-ui/react/menu";

import { Icon, IconButton } from "@/components/ui/icon";

import type { Client } from "./model";

type ClientRowActionsProps = Readonly<{
  client: Client;
  onAnnouncement: (message: string) => void;
}>;

export function ClientRowActions({ client, onAnnouncement }: ClientRowActionsProps) {
  async function copyEmailAddress() {
    try {
      await navigator.clipboard.writeText(client.contactEmail);
      onAnnouncement(`Email address copied for ${client.organizationName}`);
    } catch {
      onAnnouncement(`Email address could not be copied for ${client.organizationName}`);
    }
  }

  return (
    <Menu.Root>
      <Menu.Trigger render={<IconButton label={`More actions for ${client.organizationName}`} />}>
        <Icon name="ellipsis" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" className="client-row-actions__positioner" sideOffset={4}>
          <Menu.Popup
            aria-label={`Actions for ${client.organizationName}`}
            className="client-row-actions__menu"
          >
            <Menu.Item className="client-row-actions__item" onClick={() => void copyEmailAddress()}>
              Copy email address
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
