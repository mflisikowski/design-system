"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Icon, IconButton } from "@/components/ui/icon";
import { Select, SelectIcon, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";

import { AddProjectDialog } from "./add-project-dialog";
import { type Project, type ProjectStatus, projectStatusLabels } from "./model";
import { projectQueryKeys } from "./query-keys";
import {
  createHttpProjectRepository,
  type ProjectCreateScenario,
  type ProjectDeleteScenario,
  type ProjectListScenario,
  type ProjectStatusScenario,
} from "./repository";

const projectRepository = createHttpProjectRepository();
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

type ProjectListProps = Readonly<{
  clientId: string;
  clientName?: string;
  createScenario: ProjectCreateScenario;
  deleteScenario: ProjectDeleteScenario;
  onAnnouncement?: (message: string) => void;
  scenario: ProjectListScenario;
  statusScenario: ProjectStatusScenario;
  waitingForApi?: boolean;
}>;

const projectStatuses: readonly ProjectStatus[] = ["planned", "active", "on-hold", "completed"];

const projectStatusTones: Record<ProjectStatus, BadgeTone> = {
  active: "accent",
  completed: "success",
  "on-hold": "warning",
  planned: "neutral",
};

function sortProjects(projects: readonly Project[]) {
  return [...projects].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function LoadingProjects() {
  return (
    <div className="project-table-surface">
      <output className="visually-hidden">Loading projects</output>
      <Table aria-busy="true">
        <TableCaption>Projects</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody aria-hidden="true">
          {Array.from({ length: 2 }, (_, index) => (
            <TableRow key={index}>
              <TableCell>
                <span className="skeleton-line" />
              </TableCell>
              <TableCell>
                <span className="skeleton-line skeleton-line--short" />
              </TableCell>
              <TableCell>
                <span className="skeleton-line" />
              </TableCell>
              <TableCell>
                <span className="skeleton-dot" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

type ProjectTableProps = Readonly<{
  onDelete: (projectId: string) => void;
  onStatusChange: (projectId: string, status: ProjectStatus) => void;
  registerDeleteButton: (projectId: string, element: HTMLButtonElement | null) => void;
  pendingDeleteProjectId?: string;
  pendingProjectId?: string;
  projects: readonly Project[];
}>;

function ProjectTable({
  onDelete,
  onStatusChange,
  pendingDeleteProjectId,
  pendingProjectId,
  projects,
  registerDeleteButton,
}: ProjectTableProps) {
  return (
    <div className="project-table-surface">
      <Table>
        <TableCaption>Projects</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <span className="project-table__name">{project.name}</span>
                {project.description ? (
                  <span className="project-table__description">{project.description}</span>
                ) : null}
              </TableCell>
              <TableCell>
                <Select.Root
                  items={projectStatuses.map((status) => ({
                    label: projectStatusLabels[status],
                    value: status,
                  }))}
                  onValueChange={(value) => {
                    if (value && value !== project.status) {
                      onStatusChange(project.id, value);
                    }
                  }}
                  value={project.status}
                  loading={pendingProjectId === project.id}
                >
                  <SelectTrigger
                    aria-label={`Status for ${project.name}`}
                    loading={pendingProjectId === project.id}
                    size="sm"
                  >
                    <Badge size="sm" tone={projectStatusTones[project.status]}>
                      <SelectValue />
                    </Badge>
                    <SelectIcon />
                  </SelectTrigger>
                  <Select.Content>
                    {projectStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {projectStatusLabels[status]}
                      </SelectItem>
                    ))}
                  </Select.Content>
                </Select.Root>
              </TableCell>
              <TableCell>
                <time dateTime={project.updatedAt}>
                  {dateFormatter.format(new Date(project.updatedAt))}
                </time>
              </TableCell>
              <TableCell>
                <IconButton
                  disabled={pendingDeleteProjectId === project.id}
                  label={`Delete ${project.name}`}
                  onClick={() => onDelete(project.id)}
                  ref={(element) => registerDeleteButton(project.id, element)}
                >
                  <Icon name="trash" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ProjectList({
  clientId,
  clientName,
  createScenario,
  deleteScenario,
  onAnnouncement,
  scenario,
  statusScenario,
  waitingForApi = false,
}: ProjectListProps) {
  const queryClient = useQueryClient();
  const addProjectTriggerRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const deleteFocusFallback = useRef<() => HTMLElement | null>(() => null);
  const deleteOrder = useRef<readonly string[]>([]);
  const wasDeleteDialogOpen = useRef(false);
  const [deleteRequest, setDeleteRequest] = useState<Project | null>(null);
  const [deleteFailure, setDeleteFailure] = useState<string | null>(null);
  const [deleteNotice, setDeleteNotice] = useState(false);
  const projects = useQuery({
    enabled: !waitingForApi,
    queryFn: () => projectRepository.listByClient(clientId, scenario),
    queryKey: projectQueryKeys.byClient(clientId, scenario),
  });
  const [statusFailure, setStatusFailure] = useState<{
    projectId: string;
    status: ProjectStatus;
  }>();
  const updateStatus = useMutation({
    mutationFn: ({ projectId, status }: { projectId: string; status: ProjectStatus }) =>
      projectRepository.updateStatus(clientId, projectId, status, statusScenario),
    onError: (_error, variables) => {
      setStatusFailure(variables);
    },
    onSuccess: (updatedProject) => {
      setStatusFailure(undefined);
      queryClient.setQueryData<readonly Project[]>(
        projectQueryKeys.byClient(clientId, scenario),
        (currentProjects) =>
          currentProjects
            ? sortProjects(
                currentProjects.map((project) =>
                  project.id === updatedProject.id ? updatedProject : project,
                ),
              )
            : currentProjects,
      );
      void queryClient.invalidateQueries({
        queryKey: projectQueryKeys.byClient(clientId, scenario),
        refetchType: "inactive",
      });
      toast.success("Project status updated");
    },
  });
  const deleteProject = useMutation({
    mutationFn: ({ projectId }: { projectId: string }) =>
      projectRepository.deleteProject(projectId, deleteScenario),
    onError: (error) => {
      setDeleteFailure(
        error instanceof Error ? error.message : "The project could not be deleted. Try again.",
      );
    },
    onSuccess: (outcome, variables) => {
      const currentProjects = projects.data ?? [];
      const currentProjectIds = currentProjects.map((project) => project.id);
      const deletedIndex = deleteOrder.current.indexOf(variables.projectId);
      const preferredFallbackIds =
        deletedIndex < 0
          ? []
          : [deleteOrder.current[deletedIndex + 1], deleteOrder.current[deletedIndex - 1]];
      const fallbackProjectIds = Array.from(
        new Set([...preferredFallbackIds, ...currentProjectIds]),
      ).filter(
        (projectId): projectId is string =>
          Boolean(projectId) && projectId !== variables.projectId && currentProjectIds.includes(projectId),
      );

      deleteFocusFallback.current = () => {
        for (const projectId of fallbackProjectIds) {
          const button = deleteButtonRefs.current.get(projectId);
          if (button?.isConnected) {
            return button;
          }
        }
        return addProjectTriggerRef.current?.isConnected ? addProjectTriggerRef.current : null;
      };

      const removeProject = (current: readonly Project[] | undefined) =>
        current?.filter((project) => project.id !== variables.projectId);
      queryClient.setQueryData<readonly Project[]>(
        projectQueryKeys.byClient(clientId, scenario),
        removeProject,
      );
      queryClient.setQueryData<readonly Project[]>(
        projectQueryKeys.byClient(clientId, "default"),
        removeProject,
      );
      void queryClient.invalidateQueries({
        queryKey: projectQueryKeys.all,
        refetchType: "active",
      });
      setDeleteFailure(null);
      setDeleteRequest(null);

      if (outcome.outcome === "not-found") {
        setDeleteNotice(true);
        onAnnouncement?.("Project is no longer available");
        return;
      }

      setDeleteNotice(false);
      toast.success("Project deleted");
    },
  });

  useEffect(() => {
    if (wasDeleteDialogOpen.current && !deleteRequest) {
      queueMicrotask(() => deleteFocusFallback.current()?.focus());
    }
    wasDeleteDialogOpen.current = Boolean(deleteRequest);
  }, [deleteRequest]);

  function registerDeleteButton(projectId: string, element: HTMLButtonElement | null) {
    if (element) {
      deleteButtonRefs.current.set(projectId, element);
    } else {
      deleteButtonRefs.current.delete(projectId);
    }
  }

  function openDeleteDialog(projectId: string) {
    const project = projects.data?.find((record) => record.id === projectId);
    if (!project) {
      return;
    }

    deleteFocusFallback.current = () =>
      deleteButtonRefs.current.get(projectId)?.isConnected
        ? deleteButtonRefs.current.get(projectId) ?? null
        : addProjectTriggerRef.current?.isConnected
          ? addProjectTriggerRef.current
          : null;
    deleteOrder.current = projects.data?.map((record) => record.id) ?? [];
    setDeleteFailure(null);
    setDeleteNotice(false);
    setDeleteRequest(project);
  }

  let content;
  if (waitingForApi || projects.isPending) {
    content = <LoadingProjects />;
  } else if (projects.isError) {
    content = (
      <Alert live tone="danger">
        <AlertTitle>Projects could not be loaded</AlertTitle>
        <AlertDescription>
          The local demo service did not respond. Your stored project data has not been changed.
        </AlertDescription>
        <AlertAction>
          <Button onClick={() => void projects.refetch()} variant="outline">
            Try again
          </Button>
        </AlertAction>
      </Alert>
    );
  } else if (projects.data.length === 0) {
    content = (
      <EmptyState>
        <EmptyStateTitle>No projects yet</EmptyStateTitle>
        <EmptyStateDescription>
          Add the first project for this client to start tracking delivered work.
        </EmptyStateDescription>
        <EmptyStateActions>
          <AddProjectDialog
            clientId={clientId}
            createScenario={createScenario}
            triggerRef={addProjectTriggerRef}
            scenario={scenario}
          />
        </EmptyStateActions>
      </EmptyState>
    );
  } else {
    content = (
      <>
        {statusFailure ? (
          <Alert live tone="danger">
            <AlertTitle>Project status could not be updated</AlertTitle>
            <AlertDescription>
              The previous status is still saved. Try again to set the selected status.
            </AlertDescription>
            <AlertAction>
              <Button
                onClick={() => updateStatus.mutate(statusFailure)}
                variant="outline"
                loading={updateStatus.isPending}
                loadingLabel="Retrying"
              >
                Try again
              </Button>
            </AlertAction>
          </Alert>
        ) : null}
        <ProjectTable
          onDelete={openDeleteDialog}
          onStatusChange={(projectId, status) => updateStatus.mutate({ projectId, status })}
          pendingDeleteProjectId={
            deleteProject.isPending ? deleteProject.variables?.projectId : undefined
          }
          pendingProjectId={updateStatus.isPending ? updateStatus.variables?.projectId : undefined}
          projects={projects.data}
          registerDeleteButton={registerDeleteButton}
        />
      </>
    );
  }

  return (
    <section aria-labelledby="projects-title" className="projects-section">
      <div className="projects-section__heading">
        <div>
          <h2 id="projects-title">Projects</h2>
          <p>Work delivered for this client.</p>
        </div>
        {projects.data?.length ? (
          <AddProjectDialog
            clientId={clientId}
            createScenario={createScenario}
            triggerRef={addProjectTriggerRef}
            scenario={scenario}
          />
        ) : null}
      </div>
      {deleteNotice ? (
        <Alert live tone="success">
          <AlertTitle>Project is no longer available</AlertTitle>
          <AlertDescription>
            The project had already been removed. The project list has been refreshed.
          </AlertDescription>
        </Alert>
      ) : null}
      {content}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open && !deleteProject.isPending) {
            setDeleteFailure(null);
            setDeleteRequest(null);
          }
        }}
        open={Boolean(deleteRequest)}
        pending={deleteProject.isPending}
      >
        {deleteRequest ? (
          <AlertDialogContent
            finalFocus={() => deleteFocusFallback.current() ?? false}
            initialFocus={cancelButtonRef}
          >
            <AlertDialogTitle>Delete {deleteRequest.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteRequest.name} from {clientName ?? "this client"}.
              This action cannot be undone.
            </AlertDialogDescription>
            {deleteFailure ? (
              <Alert live tone="danger">
                <AlertTitle>Project could not be deleted</AlertTitle>
                <AlertDescription>{deleteFailure}</AlertDescription>
                <AlertAction>
                  <Button
                    loading={deleteProject.isPending}
                    loadingLabel="Retrying"
                    onClick={() => deleteProject.mutate({ projectId: deleteRequest.id })}
                    variant="outline"
                  >
                    Try again
                  </Button>
                </AlertAction>
              </Alert>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel ref={cancelButtonRef} render={<Button variant="outline" />}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteProject.mutate({ projectId: deleteRequest.id })}
                render={
                  <Button
                    loading={deleteProject.isPending}
                    loadingLabel="Deleting project"
                    variant="danger"
                  />
                }
              >
                Delete project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </section>
  );
}
