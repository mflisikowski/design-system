import type { ClientDetailScenario, ClientListScenario } from "./repository";
import type { ClientFilterStatus } from "./search";

export const clientQueryKeys = {
  all: ["clients"] as const,
  list: (query: string, status: ClientFilterStatus, scenario: ClientListScenario) =>
    ["clients", "list", query, status, scenario] as const,
  lists: ["clients", "list"] as const,
  detail: (id: string, scenario: ClientDetailScenario) =>
    ["clients", "detail", id, scenario] as const,
};
