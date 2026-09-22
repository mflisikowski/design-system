"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/components/ui/link";
import { SearchField } from "@/components/ui/search-field";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddClientDialog } from "./add-client-dialog";
import { ClientRowActions } from "./client-row-actions";
import { clientDeletionAnnouncementStorageKey } from "./deletion-feedback";
import {
  clientRelationshipStatusLabels,
  type Client,
} from "./model";
import { clientQueryKeys } from "./query-keys";
import {
  type ClientCreateScenario,
  type ClientListScenario,
  createHttpClientRepository,
} from "./repository";
import {
  type ClientFilterStatus,
  normalizeClientRelationshipStatus,
  normalizeClientSearchQuery,
} from "./search";

const clientRepository = createHttpClientRepository();
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});
const clientFilterStatuses = ["all", "active", "inactive"] as const satisfies readonly ClientFilterStatus[];
const clientFilterStatusLabels: Record<ClientFilterStatus, string> = {
  all: "All clients",
  active: clientRelationshipStatusLabels.active,
  inactive: clientRelationshipStatusLabels.inactive,
};

type ClientListProps = Readonly<{
  createScenario: ClientCreateScenario;
  initialQuery: string;
  scenario: ClientListScenario;
  waitingForApi?: boolean;
}>;

function LoadingTable() {
  return (
    <div className="client-table-surface">
      <output className="visually-hidden">Loading clients</output>
      <Table aria-busy="true">
        <TableCaption>Clients</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Primary contact</TableHead>
            <TableHead>Added</TableHead>
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

type ClientTableProps = Readonly<{
  clients: readonly Client[];
  onAnnouncement: (message: string) => void;
}>;

function ClientTable({ clients, onAnnouncement }: ClientTableProps) {
  return (
    <div className="client-table-surface">
      <Table>
        <TableCaption>Clients</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Primary contact</TableHead>
            <TableHead>Added</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <Link href={`/clients/${client.id}`} variant="standalone">
                  {client.organizationName}
                </Link>
              </TableCell>
              <TableCell>
                <span className="contact-details">
                  <span>{client.contactName}</span>
                  <a className="contact-email" href={`mailto:${client.contactEmail}`}>
                    {client.contactEmail}
                  </a>
                  {client.contactPhone ? <span>{client.contactPhone}</span> : null}
                </span>
              </TableCell>
              <TableCell>
                <time dateTime={client.createdAt}>
                  {dateFormatter.format(new Date(client.createdAt))}
                </time>
              </TableCell>
              <TableCell>
                <ClientRowActions client={client} onAnnouncement={onAnnouncement} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ClientList({
  createScenario,
  initialQuery,
  scenario,
  waitingForApi = false,
}: ClientListProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const announcementSequence = useRef(0);
  const clientsHeadingRef = useRef<HTMLHeadingElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [announcement, setAnnouncement] = useState<{ id: number; message: string } | null>(null);
  const [lastSuccessfulClients, setLastSuccessfulClients] = useState<
    readonly Client[] | undefined
  >();
  const currentSearch = searchParams.toString();
  const rawQuery = searchParams.get("q") ?? "";
  const query = normalizeClientSearchQuery(rawQuery);
  const rawStatus = searchParams.get("status");
  const status = normalizeClientRelationshipStatus(rawStatus) ?? "all";
  const [inputQuery, setInputQuery] = useState(initialQuery);

  const replaceFilters = useCallback(
    (nextQuery: string, nextStatus: ClientFilterStatus) => {
      const normalizedQuery = normalizeClientSearchQuery(nextQuery);
      const nextParams = new URLSearchParams(currentSearch);
      if (normalizedQuery) {
        nextParams.set("q", normalizedQuery);
      } else {
        nextParams.delete("q");
      }
      if (nextStatus === "all") {
        nextParams.delete("status");
      } else {
        nextParams.set("status", nextStatus);
      }
      const nextSearch = nextParams.toString();
      if (nextSearch === currentSearch) {
        return;
      }
      router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, { scroll: false });
    },
    [currentSearch, pathname, router],
  );

  useEffect(() => {
    if (inputQuery !== query) {
      // oxlint-disable-next-line react/set-state-in-effect -- URL navigation is external state that must resynchronize the controlled search input.
      setInputQuery(query);
    }
    if (rawQuery !== query || (rawStatus !== null && !normalizeClientRelationshipStatus(rawStatus))) {
      replaceFilters(query, status);
    }
  }, [query, rawQuery, rawStatus, replaceFilters, status]);

  useEffect(
    () => () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    },
    [],
  );

  useEffect(() => {
    const deletionAnnouncement = window.sessionStorage.getItem(
      clientDeletionAnnouncementStorageKey,
    );
    if (!deletionAnnouncement) {
      return;
    }

    window.sessionStorage.removeItem(clientDeletionAnnouncementStorageKey);
    announcementSequence.current += 1;
    setAnnouncement({ id: announcementSequence.current, message: deletionAnnouncement });
    queueMicrotask(() => clientsHeadingRef.current?.focus());
  }, []);

  function scheduleQuery(nextValue: string) {
    setInputQuery(nextValue);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const normalizedQuery = normalizeClientSearchQuery(nextValue);
    if (!normalizedQuery) {
      replaceFilters("", status);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      replaceFilters(normalizedQuery, status);
      debounceTimer.current = null;
    }, 300);
  }

  function submitQuery(nextValue: string) {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setInputQuery(nextValue);
    replaceFilters(nextValue, status);
  }

  function changeStatus(nextValue: string | null) {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    const nextStatus: ClientFilterStatus =
      nextValue === "active" || nextValue === "inactive" ? nextValue : "all";
    replaceFilters(inputQuery, nextStatus);
  }

  function clearFilters() {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setInputQuery("");
    replaceFilters("", "all");
    queueMicrotask(() => clientsHeadingRef.current?.focus());
  }

  function announce(message: string) {
    announcementSequence.current += 1;
    setAnnouncement({ id: announcementSequence.current, message });
  }

  const clients = useQuery({
    enabled: !waitingForApi,
    placeholderData: keepPreviousData,
    queryFn: () => clientRepository.list({ query, scenario, status: status === "all" ? undefined : status }),
    queryKey: clientQueryKeys.list(query, status, scenario),
  });
  useEffect(() => {
    if (!clients.isPending && !clients.isError && clients.data) {
      // oxlint-disable-next-line react/set-state-in-effect -- Retain the last successful response while a later search request fails.
      setLastSuccessfulClients(clients.data);
    }
  }, [clients.data, clients.isError, clients.isPending]);
  const reset = useMutation({
    mutationFn: () => clientRepository.reset(),
    onSuccess: (records) => {
      queryClient.setQueryData(clientQueryKeys.list("", "all", "default"), records);
      void queryClient.invalidateQueries({ queryKey: clientQueryKeys.all });
      announce("Demo data reset");
    },
  });

  function resetDemoData() {
    if (window.confirm("Reset all locally stored demo client data?")) {
      setAnnouncement(null);
      reset.mutate();
    }
  }

  const isRefreshing = clients.isFetching;
  const displayedClients = clients.data ?? lastSuccessfulClients;
  const hasResults = Array.isArray(displayedClients);
  const resultCount = displayedClients?.length ?? 0;
  const resultCriteria = [
    query ? `matching “${query}”` : null,
    status !== "all" ? `with ${clientFilterStatusLabels[status].toLowerCase()} relationship status` : null,
  ].filter((criterion): criterion is string => Boolean(criterion));
  const resultSummary = `${resultCount} ${resultCount === 1 ? "client" : "clients"} found${
    resultCriteria.length > 0 ? ` ${resultCriteria.join(" and ")}` : ""
  }`;

  function retrySearch() {
    void clients.refetch();
  }

  function renderFailure() {
    return (
      <Alert live tone="danger">
        <AlertTitle>Clients could not be loaded</AlertTitle>
        <AlertDescription>
          The local demo service did not respond. Your search, relationship status filter, and last
          successful results have been preserved.
        </AlertDescription>
        <AlertAction>
          <Button onClick={retrySearch} variant="outline">
            Try again
          </Button>
        </AlertAction>
      </Alert>
    );
  }

  function renderNoResults() {
    if (!query && status === "all") {
      return (
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
    }

    return (
      <EmptyState>
        <EmptyStateIcon>
          <Icon name="search" size="lg" />
        </EmptyStateIcon>
        <EmptyStateTitle>No clients found</EmptyStateTitle>
        <EmptyStateDescription>
          {query
            ? status === "all"
              ? `No clients match “${query}”. Try another organization, contact, or email.`
              : `No clients match “${query}” with an ${clientFilterStatusLabels[status].toLowerCase()} relationship status.`
            : `No ${clientFilterStatusLabels[status].toLowerCase()} clients found. Try another relationship status.`}
        </EmptyStateDescription>
        <EmptyStateActions>
          <Button
            onClick={status === "all" ? () => submitQuery("") : clearFilters}
            variant="outline"
          >
            {status === "all" ? "Clear search" : "Clear filters"}
          </Button>
        </EmptyStateActions>
      </EmptyState>
    );
  }

  let content: ReactNode;
  if (waitingForApi || (clients.isPending && !displayedClients)) {
    content = <LoadingTable />;
  } else if (clients.isError && !hasResults) {
    content = renderFailure();
  } else if (clients.isError) {
    content = (
      <div className="client-results" aria-busy={isRefreshing || undefined}>
        {renderFailure()}
        {resultCount > 0 ? (
          <>
            <p aria-live="polite" className="client-results__summary">
              {resultSummary}
            </p>
            <ClientTable clients={displayedClients ?? []} onAnnouncement={announce} />
          </>
        ) : null}
      </div>
    );
  } else if (!hasResults || resultCount === 0) {
    content = renderNoResults();
  } else {
    content = (
      <div className="client-results" aria-busy={isRefreshing || undefined}>
        {clients.isError ? renderFailure() : null}
        <p aria-live="polite" className="client-results__summary">
          {resultSummary}
        </p>
        <ClientTable clients={displayedClients ?? []} onAnnouncement={announce} />
      </div>
    );
  }

  return (
    <section aria-labelledby="clients-title" className="clients-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Client relationships</p>
          <h1 id="clients-title" ref={clientsHeadingRef} tabIndex={-1}>
            Clients
          </h1>
          <p className="supporting-copy">
            Browse fictional organizations and their primary contacts.
          </p>
        </div>
        <div className="page-heading__actions">
          <AddClientDialog createScenario={createScenario} scenario={scenario} />
          <Button
            loading={reset.isPending}
            loadingLabel="Resetting demo data"
            onClick={resetDemoData}
            variant="outline"
          >
            Reset demo data
          </Button>
        </div>
      </div>
      <p className="demo-disclosure">Demo data is fictional and stored only in this browser.</p>
      <div aria-label="Client filters" className="client-filter-bar" role="group">
        <Field>
          <FieldLabel>Search clients</FieldLabel>
          <FieldDescription>Search by organization, contact, or email.</FieldDescription>
          <SearchField
            loading={isRefreshing}
            onSubmit={submitQuery}
            onValueChange={scheduleQuery}
            value={inputQuery}
          />
        </Field>
        <Field>
          <FieldLabel>Filter by relationship status</FieldLabel>
          <FieldDescription>Show active or inactive client relationships.</FieldDescription>
          <Select.Root
            items={clientFilterStatuses.map((filterStatus) => ({
              label: clientFilterStatusLabels[filterStatus],
              value: filterStatus,
            }))}
            onValueChange={changeStatus}
            value={status}
          >
            <Select.Trigger aria-label="Filter by relationship status">
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Content>
              {clientFilterStatuses.map((filterStatus) => (
                <Select.Item key={filterStatus} value={filterStatus}>
                  {clientFilterStatusLabels[filterStatus]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Field>
        {status !== "all" ? (
          <Button onClick={clearFilters} variant="outline">
            Clear filters
          </Button>
        ) : null}
      </div>
      <output
        aria-atomic="true"
        aria-live="polite"
        className="visually-hidden"
        data-announcement-id={announcement?.id}
      >
        {announcement ? <span key={announcement.id}>{announcement.message}</span> : null}
      </output>
      <section aria-label="Client results" aria-busy={isRefreshing || undefined}>
        {!waitingForApi && !clients.isPending && hasResults && resultCount === 0 ? (
          <p aria-live="polite" className="client-results__summary">
            {resultSummary}
          </p>
        ) : null}
        {content}
      </section>
    </section>
  );
}
