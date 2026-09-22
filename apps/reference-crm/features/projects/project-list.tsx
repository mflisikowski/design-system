"use client";

import { useQuery } from "@tanstack/react-query";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AddProjectDialog } from "./add-project-dialog";
import { type Project, projectStatusLabels } from "./model";
import { projectQueryKeys } from "./query-keys";
import {
  type ProjectCreateScenario,
  type ProjectListScenario,
  createHttpProjectRepository,
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
  waitingForApi?: boolean;
}>;

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

function ProjectTable({ projects }: Readonly<{ projects: readonly Project[] }>) {
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
                <span className="project-status" data-status={project.status}>
                  {projectStatusLabels[project.status]}
                </span>
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
  waitingForApi = false,
}: ProjectListProps) {
  const projects = useQuery({
    enabled: !waitingForApi,
    queryFn: () => projectRepository.listByClient(clientId, scenario),
    queryKey: projectQueryKeys.byClient(clientId, scenario),
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
    content = <ProjectTable projects={projects.data} />;
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
