"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
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
  createScenario: ProjectCreateScenario;
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

type ProjectTableProps = Readonly<{
  onStatusChange: (projectId: string, status: ProjectStatus) => void;
  pendingProjectId?: string;
  projects: readonly Project[];
}>;

function ProjectTable({ onStatusChange, pendingProjectId, projects }: ProjectTableProps) {
  return (
    <div className="project-table-surface">
      <Table>
        <TableCaption>Projects</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ProjectList({
  clientId,
  createScenario,
  scenario,
  statusScenario,
  waitingForApi = false,
}: ProjectListProps) {
  const queryClient = useQueryClient();
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
          onStatusChange={(projectId, status) => updateStatus.mutate({ projectId, status })}
          pendingProjectId={updateStatus.isPending ? updateStatus.variables?.projectId : undefined}
          projects={projects.data}
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
            scenario={scenario}
          />
        ) : null}
      </div>
      {content}
    </section>
  );
}
