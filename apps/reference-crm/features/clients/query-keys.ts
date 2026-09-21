import type { ClientListScenario } from "./repository";

export const clientQueryKeys = {
  all: ["clients"] as const,
  list: (scenario: ClientListScenario) => ["clients", scenario] as const,
};
