import type { ClientDetailScenario, ClientListScenario } from "./repository";

export const clientQueryKeys = {
  all: ["clients"] as const,
  list: (query: string, scenario: ClientListScenario) =>
    ["clients", "list", query, scenario] as const,
  detail: (id: string, scenario: ClientDetailScenario) =>
    ["clients", "detail", id, scenario] as const,
};
