"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

import { ClientForm } from "./client-form";
import type { Client, CreateClientInput } from "./model";
import { clientQueryKeys } from "./query-keys";
import { type ClientListScenario, createHttpClientRepository } from "./repository";

const clientRepository = createHttpClientRepository();
export function AddClientDialog({ scenario }: Readonly<{ scenario: ClientListScenario }>) {
  const queryClient = useQueryClient();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const createClient = useMutation({
    mutationFn: (input: CreateClientInput) => clientRepository.create(input),
    onSuccess: (client) => {
      queryClient.setQueryData<readonly Client[]>(clientQueryKeys.list(scenario), (clients) => [
        client,
        ...(clients ?? []),
      ]);
      queryClient.setQueryData<readonly Client[]>(clientQueryKeys.list("default"), (clients) => [
        client,
        ...(clients?.filter((record) => record.id !== client.id) ?? []),
      ]);
      void queryClient.invalidateQueries({
        queryKey: clientQueryKeys.all,
        refetchType: scenario === "default" ? "active" : "inactive",
      });
      setOpen(false);
      toast.success("Client added");
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && createClient.isPending) {
      return;
    }
    setOpen(nextOpen);
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
          onSubmit={async (input) => {
            await createClient.mutateAsync(input);
          }}
          pending={createClient.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
