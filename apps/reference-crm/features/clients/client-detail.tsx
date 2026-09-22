"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { ToastViewport } from "@/components/ui/toast";
import { startMockApi } from "@/mocks/browser";

import { ProjectList } from "../projects/project-list";
import type {
  ProjectCreateScenario,
  ProjectListScenario,
  ProjectStatusScenario,
} from "../projects/repository";
import { ClientQueryProvider } from "./client-experience";
import { clientQueryKeys } from "./query-keys";
import type { ClientDetailScenario } from "./repository";
import { ClientRepositoryError, createHttpClientRepository } from "./repository";

import "./client-detail.css";

const clientRepository = createHttpClientRepository();
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

type ClientDetailExperienceProps = Readonly<{
  clientId: string;
  projectCreateScenario: ProjectCreateScenario;
  projectScenario: ProjectListScenario;
  projectStatusScenario: ProjectStatusScenario;
  scenario: ClientDetailScenario;
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
  projectScenario,
  projectStatusScenario,
  scenario,
}: ClientDetailExperienceProps) {
  return (
    <ClientQueryProvider>
      <ClientDetailContent
        clientId={clientId}
        projectCreateScenario={projectCreateScenario}
        projectScenario={projectScenario}
        projectStatusScenario={projectStatusScenario}
        scenario={scenario}
      />
      <ToastViewport />
    </ClientQueryProvider>
  );
}

function ClientDetailContent({
  clientId,
  projectCreateScenario,
  projectScenario,
  projectStatusScenario,
  scenario,
}: ClientDetailExperienceProps) {
  const [ready, setReady] = useState(false);

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
  return (
    <section className="client-details-page">
      <PageHeader
        breadcrumb={<DetailBreadcrumb current={record.organizationName} />}
        description="Review the organization and its primary contact."
        title={record.organizationName}
      />
      <section aria-labelledby="client-contact-title" className="client-details-card">
        <div className="client-details-card__heading">
          <h2 id="client-contact-title">Primary contact</h2>
          <span className="client-details-status">{record.relationshipStatus}</span>
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
        createScenario={projectCreateScenario}
        scenario={projectScenario}
        statusScenario={projectStatusScenario}
        waitingForApi={!ready}
      />
    </section>
  );
}
