import type { ProjectListScenario } from "./repository";

export const projectQueryKeys = {
  all: ["projects"] as const,
  byClient: (clientId: string, scenario: ProjectListScenario) =>
    ["projects", "client", clientId, scenario] as const,
};
