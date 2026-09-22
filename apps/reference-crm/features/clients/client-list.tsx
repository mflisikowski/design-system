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
import type { Client } from "./model";
import { clientQueryKeys } from "./query-keys";
import {
  type ClientCreateScenario,
  type ClientListScenario,
  createHttpClientRepository,
} from "./repository";
import { normalizeClientSearchQuery } from "./search";

const clientRepository = createHttpClientRepository();
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

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
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [announcement, setAnnouncement] = useState<{ id: number; message: string } | null>(null);
  const [lastSuccessfulClients, setLastSuccessfulClients] = useState<
    readonly Client[] | undefined
  >();
  const currentSearch = searchParams.toString();
  const rawQuery = searchParams.get("q") ?? "";
  const query = normalizeClientSearchQuery(rawQuery);
  const [inputQuery, setInputQuery] = useState(initialQuery);

  const replaceQuery = useCallback(
    (nextQuery: string) => {
      const normalizedQuery = normalizeClientSearchQuery(nextQuery);
      if ((new URLSearchParams(currentSearch).get("q") ?? "") === normalizedQuery) {
        return;
      }

      const nextParams = new URLSearchParams(currentSearch);
      if (normalizedQuery) {
        nextParams.set("q", normalizedQuery);
      } else {
        nextParams.delete("q");
      }
      const nextSearch = nextParams.toString();
      router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, { scroll: false });
    },
    [currentSearch, pathname, router],
  );

  useEffect(() => {
    if (inputQuery !== query) {
      // oxlint-disable-next-line react/set-state-in-effect -- URL navigation is external state that must resynchronize the controlled search input.
      setInputQuery(query);
    }
    if (rawQuery !== query) {
      replaceQuery(query);
    }
  }, [query, rawQuery, replaceQuery]);

  useEffect(
    () => () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    },
    [],
  );

  function scheduleQuery(nextValue: string) {
    setInputQuery(nextValue);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const normalizedQuery = normalizeClientSearchQuery(nextValue);
    if (!normalizedQuery) {
      replaceQuery("");
      return;
    }

    debounceTimer.current = setTimeout(() => {
      replaceQuery(normalizedQuery);
      debounceTimer.current = null;
    }, 300);
  }

  function submitQuery(nextValue: string) {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setInputQuery(nextValue);
    replaceQuery(nextValue);
  }

  function announce(message: string) {
    announcementSequence.current += 1;
    setAnnouncement({ id: announcementSequence.current, message });
  }

  const clients = useQuery({
    enabled: !waitingForApi,
    placeholderData: keepPreviousData,
    queryFn: () => clientRepository.list({ query, scenario }),
    queryKey: clientQueryKeys.list(query, scenario),
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
      queryClient.setQueryData(clientQueryKeys.list("", "default"), records);
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
  const resultSummary = `${resultCount} ${resultCount === 1 ? "client" : "clients"} found${
    query ? ` matching “${query}”` : ""
  }`;

  function retrySearch() {
    void clients.refetch();
  }

  function renderFailure() {
    return (
      <Alert live tone="danger">
        <AlertTitle>Clients could not be loaded</AlertTitle>
        <AlertDescription>
          The local demo service did not respond. Your search and last successful results have been
          preserved.
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
    if (!query) {
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
          No clients match “{query}”. Try another organization, contact, or email.
        </EmptyStateDescription>
        <EmptyStateActions>
          <Button onClick={() => submitQuery("")} variant="outline">
            Clear search
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
          <h1 id="clients-title">Clients</h1>
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
      <div className="client-search">
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
