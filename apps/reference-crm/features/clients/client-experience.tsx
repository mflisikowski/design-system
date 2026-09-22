"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ToastViewport } from "@/components/ui/toast";
import { startMockApi } from "@/mocks/browser";
import { ClientList } from "./client-list";
import type { ClientCreateScenario, ClientListScenario } from "./repository";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
    },
  },
});

type ClientQueryProviderProps = Readonly<{
  children: ReactNode;
}>;

export function ClientQueryProvider({ children }: ClientQueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

type ClientExperienceProps = Readonly<{
  createScenario: ClientCreateScenario;
  initialQuery: string;
  scenario: ClientListScenario;
}>;

export function ClientExperience({
  createScenario,
  initialQuery,
  scenario,
}: ClientExperienceProps) {
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

  return (
    <ClientQueryProvider>
      <ClientList
        createScenario={createScenario}
        initialQuery={initialQuery}
        scenario={scenario}
        waitingForApi={!ready}
      />
      <ToastViewport />
    </ClientQueryProvider>
  );
}
