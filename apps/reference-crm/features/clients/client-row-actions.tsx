"use client";

import { Menu } from "@base-ui/react/menu";

import { Icon, IconButton } from "@/components/ui/icon";

import type { Client } from "./model";

type ClientRowActionsProps = Readonly<{
  client: Client;
}>;

export function ClientRowActions({ client }: ClientRowActionsProps) {
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
            <Menu.Item className="client-row-actions__item" disabled>
              No actions available
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
