"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Link } from "@/components/ui/link";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectIcon, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToastViewport } from "@/components/ui/toast";
import { startMockApi } from "@/mocks/browser";

import { ProjectList } from "../projects/project-list";
import type {
  ProjectCreateScenario,
  ProjectDeleteScenario,
  ProjectListScenario,
  ProjectStatusScenario,
} from "../projects/repository";
import { projectQueryKeys } from "../projects/query-keys";
import { createHttpProjectRepository } from "../projects/repository";
import { ClientQueryProvider } from "./client-experience";
import { clientDeletionAnnouncementStorageKey } from "./deletion-feedback";
import { EditClientDialog } from "./edit-client-dialog";
import {
  clientRelationshipStatusLabels,
  type Client,
  type ClientRelationshipStatus,
} from "./model";
import { clientQueryKeys } from "./query-keys";
import type {
  ClientDeleteScenario,
  ClientDetailScenario,
  ClientStatusScenario,
  ClientUpdateScenario,
} from "./repository";
import { ClientRepositoryError, createHttpClientRepository } from "./repository";

import "./client-detail.css";

const clientRepository = createHttpClientRepository();
const projectRepository = createHttpProjectRepository();
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const relationshipStatuses: readonly ClientRelationshipStatus[] = ["active", "inactive"];
const relationshipStatusTones: Record<ClientRelationshipStatus, BadgeTone> = {
  active: "success",
  inactive: "neutral",
};

type ClientDetailExperienceProps = Readonly<{
  clientId: string;
  projectCreateScenario: ProjectCreateScenario;
  projectDeleteScenario: ProjectDeleteScenario;
  projectScenario: ProjectListScenario;
  projectStatusScenario: ProjectStatusScenario;
  deleteScenario: ClientDeleteScenario;
  statusScenario: ClientStatusScenario;
  scenario: ClientDetailScenario;
  updateScenario: ClientUpdateScenario;
}>;

function DetailBreadcrumb({ current }: Readonly<{ current: string }>) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbCurrent title={current}>{current}</BreadcrumbCurrent>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

type ClientRelationshipStatusControlProps = Readonly<{
  client: Client;
  detailScenario: ClientDetailScenario;
  onAnnouncement: (message: string) => void;
  statusScenario: ClientStatusScenario;
}>;

function ClientRelationshipStatusControl({
  client,
  detailScenario,
  onAnnouncement,
  statusScenario,
}: ClientRelationshipStatusControlProps) {
  const queryClient = useQueryClient();
  const [statusFailure, setStatusFailure] = useState<{
    status: ClientRelationshipStatus;
  }>();
  const updateStatus = useMutation({
    mutationFn: ({ status }: { status: ClientRelationshipStatus }) =>
      clientRepository.updateRelationshipStatus(client.id, status, statusScenario),
    onError: (_error, variables) => {
      setStatusFailure(variables);
    },
    onSuccess: (updatedClient) => {
      setStatusFailure(undefined);
      queryClient.setQueryData(clientQueryKeys.detail(client.id, detailScenario), updatedClient);
      queryClient.setQueriesData<readonly Client[]>(
        { queryKey: clientQueryKeys.lists },
        (clients) =>
          clients?.map((currentClient) =>
            currentClient.id === updatedClient.id ? updatedClient : currentClient,
          ),
      );
      void queryClient.invalidateQueries({
        queryKey: clientQueryKeys.lists,
        refetchType: "all",
      });
      onAnnouncement("Client status updated");
    },
  });
  const pending = updateStatus.isPending;
  const retryStatus = statusFailure?.status;

  function changeStatus(status: ClientRelationshipStatus | null) {
    if (status && status !== client.relationshipStatus) {
      setStatusFailure(undefined);
      updateStatus.mutate({ status });
    }
  }

  return (
    <div className="client-details-status-control">
      <Select.Root
        items={relationshipStatuses.map((status) => ({
          label: clientRelationshipStatusLabels[status],
          value: status,
        }))}
        onValueChange={changeStatus}
        value={client.relationshipStatus}
        loading={pending}
      >
        <SelectTrigger
          aria-label={`Relationship status for ${client.organizationName}`}
          loading={pending}
          size="sm"
        >
          <Badge size="sm" tone={relationshipStatusTones[client.relationshipStatus]}>
            <SelectValue />
          </Badge>
          <SelectIcon />
        </SelectTrigger>
        <Select.Content>
          {relationshipStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {clientRelationshipStatusLabels[status]}
            </SelectItem>
          ))}
        </Select.Content>
      </Select.Root>
      {statusFailure ? (
        <Alert live tone="danger">
          <AlertTitle>Client status could not be updated</AlertTitle>
          <AlertDescription>
            The previous status is still saved. Try again to set the selected status.
          </AlertDescription>
          <AlertAction>
            <Button
              loading={pending}
              loadingLabel="Retrying"
              onClick={() => {
                if (retryStatus) {
                  updateStatus.mutate({ status: retryStatus });
                }
              }}
              variant="outline"
            >
              Try again
            </Button>
          </AlertAction>
        </Alert>
      ) : null}
    </div>
  );
}

type DeleteClientControlProps = Readonly<{
  clientId: string;
  clientName: string;
  deleteScenario: ClientDeleteScenario;
  onAnnouncement: (message: string) => void;
  projectScenario: ProjectListScenario;
}>;

function DeleteClientControl({
  clientId,
  clientName,
  deleteScenario,
  onAnnouncement,
  projectScenario,
}: DeleteClientControlProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const previousProjectCount = useRef<number | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteFailure, setDeleteFailure] = useState<string | null>(null);
  const [blockedProjectCount, setBlockedProjectCount] = useState<number | null>(null);
  const projects = useQuery({
    queryFn: () => projectRepository.listByClient(clientId, projectScenario),
    queryKey: projectQueryKeys.byClient(clientId, projectScenario),
  });
  const projectCount = projects.data?.length;
  const deleteClient = useMutation({
    mutationFn: () => clientRepository.deleteClient(clientId, deleteScenario),
    onError: (error) => {
      setDeleteFailure(
        error instanceof Error ? error.message : "The client could not be deleted. Try again.",
      );
    },
    onSuccess: (outcome) => {
      if (outcome.outcome === "blocked") {
        setDeleteOpen(false);
        setDeleteFailure(null);
        setBlockedProjectCount(outcome.projectCount);
        onAnnouncement(
          `Client deletion blocked because ${outcome.projectCount} ${outcome.projectCount === 1 ? "Project remains" : "Projects remain"}`,
        );
        queueMicrotask(() => deleteButtonRef.current?.focus());
        return;
      }

      queryClient.removeQueries({ queryKey: ["clients", "detail", clientId] });
      queryClient.setQueriesData<readonly { id: string }[]>(
        { queryKey: ["clients", "list"] },
        (clients) => clients?.filter((client) => client.id !== clientId),
      );
      queryClient.removeQueries({ queryKey: ["projects", "client", clientId] });
      void queryClient.invalidateQueries({
        queryKey: clientQueryKeys.all,
        refetchType: "inactive",
      });

      window.sessionStorage.setItem(
        clientDeletionAnnouncementStorageKey,
        outcome.outcome === "not-found" ? "Client is no longer available" : "Client deleted",
      );
      router.push("/clients");
    },
  });

  useEffect(() => {
    if (
      blockedProjectCount !== null &&
      projectCount === 0 &&
      previousProjectCount.current !== undefined &&
      previousProjectCount.current > 0
    ) {
      // oxlint-disable-next-line react/set-state-in-effect -- project deletion is external query state that clears stale guidance.
      setBlockedProjectCount(null);
    }
    previousProjectCount.current = projectCount;
  }, [blockedProjectCount, projectCount]);

  function openDeleteDialog() {
    if (projectCount && projectCount > 0) {
      setBlockedProjectCount(projectCount);
      onAnnouncement(
        `Client deletion blocked because ${projectCount} ${projectCount === 1 ? "Project remains" : "Projects remain"}`,
      );
      return;
    }

    setDeleteFailure(null);
    setDeleteOpen(true);
  }

  return (
    <>
      <Button
        disabled={!projects.isSuccess}
        loading={projects.isPending}
        loadingLabel="Checking projects"
        onClick={openDeleteDialog}
        ref={deleteButtonRef}
        variant="danger"
      >
        Delete client
      </Button>
      {blockedProjectCount !== null ? (
        <Alert live tone="danger">
          <AlertTitle>Client cannot be deleted yet</AlertTitle>
          <AlertDescription>
            {blockedProjectCount}{" "}
            {blockedProjectCount === 1 ? "Project still belongs" : "Projects still belong"} to{" "}
            {clientName}. Delete the Project{blockedProjectCount === 1 ? "" : "s"} below first, then
            try again.
          </AlertDescription>
        </Alert>
      ) : null}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open && !deleteClient.isPending) {
            setDeleteFailure(null);
            setDeleteOpen(false);
          }
        }}
        open={deleteOpen}
        pending={deleteClient.isPending}
      >
        <AlertDialogContent finalFocus={deleteButtonRef} initialFocus={cancelButtonRef}>
          <AlertDialogTitle>Delete {clientName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove {clientName}. This action cannot be undone.
          </AlertDialogDescription>
          {deleteFailure ? (
            <Alert live tone="danger">
              <AlertTitle>Client could not be deleted</AlertTitle>
              <AlertDescription>{deleteFailure}</AlertDescription>
              <AlertAction>
                <Button
                  loading={deleteClient.isPending}
                  loadingLabel="Retrying"
                  onClick={() => deleteClient.mutate()}
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
              onClick={() => deleteClient.mutate()}
              render={
                <Button
                  loading={deleteClient.isPending}
                  loadingLabel="Deleting client"
                  variant="danger"
                />
              }
            >
              Delete client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function LoadingDetails() {
  return (
    <section aria-busy="true" className="client-detail-loading">
      <output>Loading client details</output>
      <div aria-hidden="true" className="client-detail-loading__line" />
      <div
        aria-hidden="true"
        className="client-detail-loading__line client-detail-loading__line--short"
      />
    </section>
  );
}

export function ClientDetailExperience({
  clientId,
  projectCreateScenario,
  projectDeleteScenario,
  projectScenario,
  projectStatusScenario,
  deleteScenario,
  statusScenario,
  scenario,
  updateScenario,
}: ClientDetailExperienceProps) {
  return (
    <ClientQueryProvider>
      <ClientDetailContent
        clientId={clientId}
        projectCreateScenario={projectCreateScenario}
        projectDeleteScenario={projectDeleteScenario}
        projectScenario={projectScenario}
        projectStatusScenario={projectStatusScenario}
        deleteScenario={deleteScenario}
        statusScenario={statusScenario}
        scenario={scenario}
        updateScenario={updateScenario}
      />
      <ToastViewport />
    </ClientQueryProvider>
  );
}

function ClientDetailContent({
  clientId,
  projectCreateScenario,
  projectDeleteScenario,
  projectScenario,
  projectStatusScenario,
  deleteScenario,
  statusScenario,
  scenario,
  updateScenario,
}: ClientDetailExperienceProps) {
  const [ready, setReady] = useState(false);
  const announcementSequence = useRef(0);
  const [announcement, setAnnouncement] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    let active = true;
    startMockApi().then(() => {
      if (active) {
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const client = useQuery({
    enabled: ready,
    queryFn: () => clientRepository.get(clientId, scenario),
    queryKey: clientQueryKeys.detail(clientId, scenario),
  });

  if (!ready || client.isPending) {
    return (
      <section className="client-details-page">
        <PageHeader
          breadcrumb={<DetailBreadcrumb current="Loading client" />}
          title="Client details"
        />
        <LoadingDetails />
        <ProjectList
          clientId={clientId}
          createScenario={projectCreateScenario}
          deleteScenario={projectDeleteScenario}
          scenario={projectScenario}
          statusScenario={projectStatusScenario}
          waitingForApi={!ready}
        />
      </section>
    );
  }

  if (client.isError) {
    const notFound = client.error instanceof ClientRepositoryError && client.error.status === 404;

    if (notFound) {
      return (
        <section className="client-details-page">
          <PageHeader
            breadcrumb={<DetailBreadcrumb current="Client not found" />}
            description="The requested client may have been removed or the address may be incorrect."
            title="Client not found"
          />
          <EmptyState>
            <EmptyStateTitle>We could not find that client</EmptyStateTitle>
            <EmptyStateDescription>
              Return to the client list to choose an available organization.
            </EmptyStateDescription>
            <EmptyStateActions>
              <Link href="/clients" variant="standalone">
                Back to clients
              </Link>
            </EmptyStateActions>
          </EmptyState>
        </section>
      );
    }

    return (
      <section className="client-details-page">
        <PageHeader
          breadcrumb={<DetailBreadcrumb current="Client details" />}
          description="Client information could not be loaded."
          title="Client details"
        />
        <Alert live tone="danger">
          <AlertTitle>Client details could not be loaded</AlertTitle>
          <AlertDescription>
            The local demo service did not respond. Your stored data has not been changed.
          </AlertDescription>
          <AlertAction>
            <Button onClick={() => void client.refetch()} variant="outline">
              Try again
            </Button>
          </AlertAction>
        </Alert>
      </section>
    );
  }

  const record = client.data;
  function announce(message: string) {
    announcementSequence.current += 1;
    setAnnouncement({ id: announcementSequence.current, message });
  }

  return (
    <section className="client-details-page">
      <PageHeader
        breadcrumb={<DetailBreadcrumb current={record.organizationName} />}
        description="Review the organization and its primary contact."
        title={record.organizationName}
      />
      <section aria-labelledby="client-contact-title" className="client-details-card">
        <div className="client-details-card__heading">
          <div>
            <h2 id="client-contact-title">Primary contact</h2>
            <ClientRelationshipStatusControl
              client={record}
              detailScenario={scenario}
              onAnnouncement={announce}
              statusScenario={statusScenario}
            />
          </div>
          <div className="client-details-card__actions">
            <EditClientDialog
              client={record}
              onAnnouncement={announce}
              updateScenario={updateScenario}
            />
            <DeleteClientControl
              clientId={clientId}
              clientName={record.organizationName}
              deleteScenario={deleteScenario}
              onAnnouncement={announce}
              projectScenario={projectScenario}
            />
          </div>
        </div>
        <dl className="client-details-data">
          <div>
            <dt>Name</dt>
            <dd>{record.contactName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${record.contactEmail}`}>{record.contactEmail}</a>
            </dd>
          </div>
          {record.contactPhone ? (
            <div>
              <dt>Phone</dt>
              <dd>{record.contactPhone}</dd>
            </div>
          ) : null}
          <div>
            <dt>Added</dt>
            <dd>
              <time dateTime={record.createdAt}>
                {dateFormatter.format(new Date(record.createdAt))}
              </time>
            </dd>
          </div>
        </dl>
        {record.notes ? (
          <div className="client-details-notes">
            <h2>Notes</h2>
            <p>{record.notes}</p>
          </div>
        ) : null}
      </section>
      <ProjectList
        clientId={clientId}
        clientName={record.organizationName}
        createScenario={projectCreateScenario}
        deleteScenario={projectDeleteScenario}
        onAnnouncement={announce}
        scenario={projectScenario}
        statusScenario={projectStatusScenario}
        waitingForApi={!ready}
      />
      <output
        aria-atomic="true"
        aria-live="polite"
        className="visually-hidden"
        data-announcement-id={announcement?.id}
      >
        {announcement ? <span key={announcement.id}>{announcement.message}</span> : null}
      </output>
    </section>
  );
}
