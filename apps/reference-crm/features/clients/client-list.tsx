"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Icon, IconButton } from "@/components/ui/icon";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Client } from "./model";
import { type ClientListScenario, createHttpClientRepository } from "./repository";

const clientRepository = createHttpClientRepository();
const clientListKey = ["clients"] as const;
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

type ClientListProps = Readonly<{
  scenario: ClientListScenario;
  waitingForApi?: boolean;
}>;

function LoadingTable() {
  return (
    <div className="client-table-surface">
      <p className="visually-hidden" role="status">
        Loading clients
      </p>
      <Table aria-busy="true">
        <TableCaption>Clients</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Primary contact</TableHead>
            <TableHead className="added-column">Added</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <TableRow key={index}>
              <TableCell>
                <span className="skeleton-line" />
              </TableCell>
              <TableCell>
                <span className="skeleton-line skeleton-line--long" />
              </TableCell>
              <TableCell className="added-column">
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

function ClientTable({ clients }: Readonly<{ clients: readonly Client[] }>) {
  return (
    <div className="client-table-surface">
      <Table>
        <TableCaption>Clients</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Primary contact</TableHead>
            <TableHead className="added-column">Added</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="client-name">{client.organizationName}</TableCell>
              <TableCell>
                <span className="contact-details">
                  <span>{client.contactName}</span>
                  <a className="contact-email" href={`mailto:${client.contactEmail}`}>
                    {client.contactEmail}
                  </a>
                  {client.contactPhone ? <span>{client.contactPhone}</span> : null}
                </span>
              </TableCell>
              <TableCell className="added-column">
                <time dateTime={client.createdAt}>
                  {dateFormatter.format(new Date(client.createdAt))}
                </time>
              </TableCell>
              <TableCell>
                <IconButton disabled label={`More actions for ${client.organizationName}`}>
                  <Icon name="ellipsis" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ClientList({ scenario, waitingForApi = false }: ClientListProps) {
  const queryClient = useQueryClient();
  const [announcement, setAnnouncement] = useState("");
  const clients = useQuery({
    enabled: !waitingForApi,
    queryFn: () => clientRepository.list(scenario),
    queryKey: [...clientListKey, scenario],
  });
  const reset = useMutation({
    mutationFn: () => clientRepository.reset(),
    onSuccess: (records) => {
      queryClient.setQueryData([...clientListKey, "default"], records);
      setAnnouncement("Demo data reset");
    },
  });

  function resetDemoData() {
    if (window.confirm("Reset all locally stored demo client data?")) {
      setAnnouncement("");
      reset.mutate();
    }
  }

  let content;
  if (waitingForApi || clients.isPending) {
    content = <LoadingTable />;
  } else if (clients.isError) {
    content = (
      <Alert live tone="danger">
        <AlertTitle>Clients could not be loaded</AlertTitle>
        <AlertDescription>
          The local demo service did not respond. Your stored data has not been changed.
        </AlertDescription>
        <AlertAction>
          <Button onClick={() => clients.refetch()} variant="outline">
            Try again
          </Button>
        </AlertAction>
      </Alert>
    );
  } else if (clients.data.length === 0) {
    content = (
      <EmptyState>
        <EmptyStateIcon>
          <Icon name="users" size="lg" />
        </EmptyStateIcon>
        <EmptyStateTitle>No clients yet</EmptyStateTitle>
        <EmptyStateDescription>
          This browser has no demo clients. Reset demo data to restore the fictional seed records.
        </EmptyStateDescription>
      </EmptyState>
    );
  } else {
    content = <ClientTable clients={clients.data} />;
  }

  return (
    <section aria-labelledby="clients-title" className="clients-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Client relationships</p>
          <h1 id="clients-title">Clients</h1>
          <p className="supporting-copy">
            Browse fictional organizations and their primary contacts.
          </p>
        </div>
        <Button
          loading={reset.isPending}
          loadingLabel="Resetting demo data"
          onClick={resetDemoData}
          variant="outline"
        >
          Reset demo data
        </Button>
      </div>
      <p className="demo-disclosure">Demo data is fictional and stored only in this browser.</p>
      <p aria-live="polite" className="visually-hidden" role="status">
        {announcement}
      </p>
      {content}
    </section>
  );
}
