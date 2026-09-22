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
import type { CreateProjectInput, Project } from "./model";
import { ProjectForm } from "./project-form";
import { projectQueryKeys } from "./query-keys";
import {
  createHttpProjectRepository,
  type ProjectCreateScenario,
  type ProjectListScenario,
} from "./repository";

const projectRepository = createHttpProjectRepository();

type AddProjectDialogProps = Readonly<{
  clientId: string;
  createScenario: ProjectCreateScenario;
  scenario: ProjectListScenario;
}>;

export function AddProjectDialog({ clientId, createScenario, scenario }: AddProjectDialogProps) {
  const queryClient = useQueryClient();
  const closeRequestFocusRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const createProject = useMutation({
    mutationFn: (input: CreateProjectInput) =>
      projectRepository.create(clientId, input, createScenario),
    onSuccess: (project) => {
      queryClient.setQueryData<readonly Project[]>(
        projectQueryKeys.byClient(clientId, scenario),
        (projects) => [project, ...(projects ?? [])],
      );
      queryClient.setQueryData<readonly Project[]>(
        projectQueryKeys.byClient(clientId, "default"),
        (projects) => [project, ...(projects?.filter((record) => record.id !== project.id) ?? [])],
      );
      void queryClient.invalidateQueries({
        queryKey: projectQueryKeys.all,
        refetchType: scenario === "default" ? "active" : "inactive",
      });
      setOpen(false);
      toast.success("Project added");
    },
  });

  function handleOpenChange(nextOpen: boolean, details: DialogOpenChangeDetails) {
    if (!nextOpen && createProject.isPending) {
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
      <DialogTrigger render={<Button ref={triggerRef} />}>Add project</DialogTrigger>
      <DialogContent closeDisabled={createProject.isPending} finalFocus={triggerRef} size="md">
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
          <DialogDescription>Add a project delivered for this client.</DialogDescription>
        </DialogHeader>
        <ProjectForm
          onDirtyChange={handleDirtyChange}
          onSubmit={async (input) => {
            await createProject.mutateAsync(input);
          }}
          pending={createProject.isPending}
        />
      </DialogContent>
      <AlertDialog onOpenChange={setDiscardOpen} open={discardOpen}>
        <AlertDialogContent finalFocus={closeRequestFocusRef}>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Your entered project information will be lost.
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
