import { ClientDetailExperience } from "@/features/clients/client-detail";
import type { ClientDetailScenario } from "@/features/clients/repository";

type ClientDetailsPageProps = Readonly<{
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ demoDetailState?: string }>;
}>;

export default async function ClientDetailsPage({ params, searchParams }: ClientDetailsPageProps) {
  const [{ clientId }, { demoDetailState }] = await Promise.all([params, searchParams]);
  const scenario: ClientDetailScenario = demoDetailState === "error" ? "error" : "default";

  return <ClientDetailExperience clientId={clientId} scenario={scenario} />;
}
