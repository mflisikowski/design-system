import { ClientExperience } from "@/features/clients/client-experience";
import type { ClientCreateScenario, ClientListScenario } from "@/features/clients/repository";
import { normalizeClientSearchQuery } from "@/features/clients/search";

type ClientsPageProps = Readonly<{
  searchParams: Promise<{ demoCreateState?: string; demoState?: string; q?: string; status?: string }>;
}>;

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { demoCreateState, demoState, q } = await searchParams;
  const scenario: ClientListScenario =
    demoState === "empty" ||
    demoState === "error" ||
    demoState === "slow-search" ||
    demoState === "error-search"
      ? demoState
      : "default";
  const createScenario: ClientCreateScenario =
    demoCreateState === "error" || demoCreateState === "error-once" || demoCreateState === "slow"
      ? demoCreateState
      : "default";

  return (
    <ClientExperience
      createScenario={createScenario}
      initialQuery={normalizeClientSearchQuery(q)}
      scenario={scenario}
    />
  );
}
