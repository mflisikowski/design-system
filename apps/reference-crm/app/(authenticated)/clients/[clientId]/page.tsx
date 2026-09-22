import { ClientDetailExperience } from "@/features/clients/client-detail";
import type {
  ClientDeleteScenario,
  ClientDetailScenario,
  ClientUpdateScenario,
} from "@/features/clients/repository";
import type {
  ProjectCreateScenario,
  ProjectDeleteScenario,
  ProjectListScenario,
  ProjectStatusScenario,
} from "@/features/projects/repository";

type ClientDetailsPageProps = Readonly<{
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{
    demoClientDeleteState?: string;
    demoDetailState?: string;
    demoEditState?: string;
    demoProjectCreateState?: string;
    demoProjectDeleteState?: string;
    demoProjectState?: string;
    demoProjectStatusState?: string;
  }>;
}>;

export default async function ClientDetailsPage({ params, searchParams }: ClientDetailsPageProps) {
  const [
    { clientId },
    {
      demoClientDeleteState,
      demoDetailState,
      demoEditState,
      demoProjectCreateState,
      demoProjectDeleteState,
      demoProjectState,
      demoProjectStatusState,
    },
  ] = await Promise.all([params, searchParams]);
  const scenario: ClientDetailScenario = demoDetailState === "error" ? "error" : "default";
  const deleteScenario: ClientDeleteScenario =
    demoClientDeleteState === "error" ||
    demoClientDeleteState === "error-once" ||
    demoClientDeleteState === "has-projects" ||
    demoClientDeleteState === "not-found" ||
    demoClientDeleteState === "slow"
      ? demoClientDeleteState
      : "default";
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
  const projectDeleteScenario: ProjectDeleteScenario =
    demoProjectDeleteState === "error" ||
    demoProjectDeleteState === "error-once" ||
    demoProjectDeleteState === "not-found" ||
    demoProjectDeleteState === "slow"
      ? demoProjectDeleteState
      : "default";
  const projectStatusScenario: ProjectStatusScenario =
    demoProjectStatusState === "error" || demoProjectStatusState === "error-once"
      ? demoProjectStatusState
      : "default";

  return (
    <ClientDetailExperience
      clientId={clientId}
      projectCreateScenario={projectCreateScenario}
      projectDeleteScenario={projectDeleteScenario}
      projectScenario={projectScenario}
      projectStatusScenario={projectStatusScenario}
      deleteScenario={deleteScenario}
      scenario={scenario}
      updateScenario={updateScenario}
    />
  );
}
