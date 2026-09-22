import { ClientDetailExperience } from "@/features/clients/client-detail";
import type { ClientDetailScenario } from "@/features/clients/repository";
import type {
  ProjectCreateScenario,
  ProjectListScenario,
} from "@/features/projects/repository";

type ClientDetailsPageProps = Readonly<{
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{
    demoDetailState?: string;
    demoProjectCreateState?: string;
    demoProjectState?: string;
  }>;
}>;

export default async function ClientDetailsPage({ params, searchParams }: ClientDetailsPageProps) {
  const [{ clientId }, { demoDetailState, demoProjectCreateState, demoProjectState }] =
    await Promise.all([params, searchParams]);
  const scenario: ClientDetailScenario = demoDetailState === "error" ? "error" : "default";
  const projectScenario: ProjectListScenario =
    demoProjectState === "empty" || demoProjectState === "error" ? demoProjectState : "default";
  const projectCreateScenario: ProjectCreateScenario =
    demoProjectCreateState === "error" ||
    demoProjectCreateState === "error-once" ||
    demoProjectCreateState === "slow"
      ? demoProjectCreateState
      : "default";

  return (
    <ClientDetailExperience
      clientId={clientId}
      projectCreateScenario={projectCreateScenario}
      projectScenario={projectScenario}
      scenario={scenario}
    />
  );
}
