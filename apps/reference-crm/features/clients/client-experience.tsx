"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ToastViewport } from "@/components/ui/toast";
import { startMockApi } from "@/mocks/browser";
import { ClientList } from "./client-list";
import type { ClientCreateScenario, ClientListScenario } from "./repository";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
    },
  },
});

type ClientExperienceProps = Readonly<{
  createScenario: ClientCreateScenario;
  scenario: ClientListScenario;
}>;

export function ClientExperience({ createScenario, scenario }: ClientExperienceProps) {
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
    <QueryClientProvider client={queryClient}>
      <ClientList createScenario={createScenario} scenario={scenario} waitingForApi={!ready} />
      <ToastViewport />
    </QueryClientProvider>
  );
}
