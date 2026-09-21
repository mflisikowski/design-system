import { ClientExperience } from "@/features/clients/client-experience";
import type { ClientCreateScenario, ClientListScenario } from "@/features/clients/repository";

type ClientsPageProps = Readonly<{
  searchParams: Promise<{ demoCreateState?: string; demoState?: string }>;
}>;

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { demoCreateState, demoState } = await searchParams;
  const scenario: ClientListScenario =
    demoState === "empty" || demoState === "error" ? demoState : "default";
  const createScenario: ClientCreateScenario =
    demoCreateState === "error" || demoCreateState === "error-once" || demoCreateState === "slow"
      ? demoCreateState
      : "default";

  return <ClientExperience createScenario={createScenario} scenario={scenario} />;
}
