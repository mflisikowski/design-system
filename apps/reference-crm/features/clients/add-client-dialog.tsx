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
import type { Client, CreateClientInput } from "./model";
import { clientQueryKeys } from "./query-keys";
import {
  type ClientCreateScenario,
  type ClientListScenario,
  createHttpClientRepository,
} from "./repository";

const clientRepository = createHttpClientRepository();
type AddClientDialogProps = Readonly<{
  createScenario: ClientCreateScenario;
  scenario: ClientListScenario;
}>;

export function AddClientDialog({ createScenario, scenario }: AddClientDialogProps) {
  const queryClient = useQueryClient();
  const closeRequestFocusRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const createClient = useMutation({
    mutationFn: (input: CreateClientInput) => clientRepository.create(input, createScenario),
    onSuccess: (client) => {
      queryClient.setQueryData<readonly Client[]>(clientQueryKeys.list("", scenario), (clients) => [
        client,
        ...(clients ?? []),
      ]);
      queryClient.setQueryData<readonly Client[]>(
        clientQueryKeys.list("", "default"),
        (clients) => [client, ...(clients?.filter((record) => record.id !== client.id) ?? [])],
      );
      void queryClient.invalidateQueries({
        queryKey: clientQueryKeys.all,
        refetchType: scenario === "default" ? "active" : "inactive",
      });
      setOpen(false);
      toast.success("Client added");
    },
  });

  function handleOpenChange(nextOpen: boolean, details: DialogOpenChangeDetails) {
    if (!nextOpen && createClient.isPending) {
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
      <DialogTrigger render={<Button ref={triggerRef} />}>Add client</DialogTrigger>
      <DialogContent closeDisabled={createClient.isPending} finalFocus={triggerRef} size="md">
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
          <DialogDescription>
            Add an organization and its primary contact to Reference CRM.
          </DialogDescription>
        </DialogHeader>
        <ClientForm
          onDirtyChange={handleDirtyChange}
          onSubmit={async (input) => {
            await createClient.mutateAsync(input);
          }}
          pending={createClient.isPending}
        />
      </DialogContent>
      <AlertDialog onOpenChange={setDiscardOpen} open={discardOpen}>
        <AlertDialogContent finalFocus={closeRequestFocusRef}>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Your entered client information will be lost.
          </AlertDialogDescription>
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
