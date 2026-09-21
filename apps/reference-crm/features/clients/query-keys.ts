import type { ClientDetailScenario, ClientListScenario } from "./repository";

export const clientQueryKeys = {
  all: ["clients"] as const,
  list: (scenario: ClientListScenario) => ["clients", scenario] as const,
  detail: (id: string, scenario: ClientDetailScenario) =>
    ["clients", "detail", id, scenario] as const,
};
