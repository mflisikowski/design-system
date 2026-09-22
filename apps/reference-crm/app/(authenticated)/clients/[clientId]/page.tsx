import { ClientDetailExperience } from "@/features/clients/client-detail";
import type { ClientDetailScenario, ClientUpdateScenario } from "@/features/clients/repository";
import type {
  ProjectCreateScenario,
  ProjectListScenario,
  ProjectStatusScenario,
} from "@/features/projects/repository";

type ClientDetailsPageProps = Readonly<{
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{
    demoDetailState?: string;
    demoEditState?: string;
    demoProjectCreateState?: string;
    demoProjectState?: string;
    demoProjectStatusState?: string;
  }>;
}>;

export default async function ClientDetailsPage({ params, searchParams }: ClientDetailsPageProps) {
  const [
    { clientId },
    {
      demoDetailState,
      demoEditState,
      demoProjectCreateState,
      demoProjectState,
      demoProjectStatusState,
    },
  ] = await Promise.all([params, searchParams]);
  const scenario: ClientDetailScenario = demoDetailState === "error" ? "error" : "default";
  const updateScenario: ClientUpdateScenario =
    demoEditState === "error" || demoEditState === "error-once" || demoEditState === "slow"
      ? demoEditState
      : "default";
  const projectScenario: ProjectListScenario =
    demoProjectState === "empty" || demoProjectState === "error" ? demoProjectState : "default";
  const projectCreateScenario: ProjectCreateScenario =
    demoProjectCreateState === "error" ||
    demoProjectCreateState === "error-once" ||
    demoProjectCreateState === "slow"
      ? demoProjectCreateState
      : "default";
  const projectStatusScenario: ProjectStatusScenario =
    demoProjectStatusState === "error" || demoProjectStatusState === "error-once"
      ? demoProjectStatusState
      : "default";

  return (
    <ClientDetailExperience
      clientId={clientId}
      projectCreateScenario={projectCreateScenario}
      projectScenario={projectScenario}
      projectStatusScenario={projectStatusScenario}
      scenario={scenario}
      updateScenario={updateScenario}
    />
  );
}
