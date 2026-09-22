"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  type DialogOpenChangeDetails,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

import { ClientForm } from "./client-form";
import type { Client, UpdateClientInput } from "./model";
import { clientQueryKeys } from "./query-keys";
import { type ClientUpdateScenario, createHttpClientRepository } from "./repository";

const clientRepository = createHttpClientRepository();

type EditClientDialogProps = Readonly<{
  client: Client;
  onAnnouncement: (message: string) => void;
  updateScenario: ClientUpdateScenario;
}>;

function clientFormValues(client: Client): UpdateClientInput {
  return {
    contactEmail: client.contactEmail,
    contactName: client.contactName,
    contactPhone: client.contactPhone ?? "",
    notes: client.notes ?? "",
    organizationName: client.organizationName,
  };
}

export function EditClientDialog({
  client,
  onAnnouncement,
  updateScenario,
}: EditClientDialogProps) {
  const queryClient = useQueryClient();
  const closeRequestFocusRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const updateClient = useMutation({
    mutationFn: (input: UpdateClientInput) =>
      clientRepository.update(client.id, input, updateScenario),
    onSuccess: (updatedClient) => {
      queryClient.setQueriesData<Client>({ queryKey: ["clients", "detail"] }, (currentClient) =>
        currentClient?.id === updatedClient.id ? updatedClient : currentClient,
      );
      queryClient.setQueriesData<readonly Client[]>({ queryKey: ["clients", "list"] }, (clients) =>
        clients?.map((currentClient) =>
          currentClient.id === updatedClient.id ? updatedClient : currentClient,
        ),
      );
      void queryClient.invalidateQueries({
        queryKey: clientQueryKeys.all,
        refetchType: "active",
      });
      setOpen(false);
      onAnnouncement("Client updated");
      toast.success("Client updated");
    },
  });

  function handleOpenChange(nextOpen: boolean, details: DialogOpenChangeDetails) {
    if (!nextOpen && updateClient.isPending) {
      details.cancel();
      return;
    }

    if (!nextOpen && dirty) {
      details.cancel();
      const activeElement = document.activeElement;
      closeRequestFocusRef.current = activeElement instanceof HTMLElement ? activeElement : null;
      setDiscardOpen(true);
      return;
    }

    if (nextOpen) {
      setDirty(false);
    }
    setOpen(nextOpen);
  }

  const handleDirtyChange = useCallback((nextDirty: boolean) => {
    setDirty(nextDirty);
  }, []);

  function discardChanges() {
    setDirty(false);
    setDiscardOpen(false);
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger render={<Button ref={triggerRef} variant="outline" />}>
        Edit client
      </DialogTrigger>
      <DialogContent closeDisabled={updateClient.isPending} finalFocus={triggerRef} size="md">
        <DialogHeader>
          <DialogTitle>Edit client</DialogTitle>
          <DialogDescription>Update the organization and its primary contact.</DialogDescription>
        </DialogHeader>
        <ClientForm
          initialValues={clientFormValues(client)}
          initialValuesVersion={client.updatedAt}
          key={`${client.id}-${open ? "open" : "closed"}`}
          mode="edit"
          onDirtyChange={handleDirtyChange}
          onSubmit={async (input) => {
            await updateClient.mutateAsync(input);
          }}
          pending={updateClient.isPending}
        />
      </DialogContent>
      <AlertDialog onOpenChange={setDiscardOpen} open={discardOpen}>
        <AlertDialogContent finalFocus={closeRequestFocusRef}>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Your changes to this client will be lost.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button variant="outline" />}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={discardChanges} render={<Button variant="danger" />}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
