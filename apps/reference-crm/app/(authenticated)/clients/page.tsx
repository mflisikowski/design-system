import { ClientExperience } from "@/features/clients/client-experience";
import type { ClientListScenario } from "@/features/clients/repository";

type ClientsPageProps = Readonly<{
  searchParams: Promise<{ demoState?: string }>;
}>;

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { demoState } = await searchParams;
  const scenario: ClientListScenario =
    demoState === "empty" || demoState === "error" ? demoState : "default";

  return <ClientExperience scenario={scenario} />;
}
