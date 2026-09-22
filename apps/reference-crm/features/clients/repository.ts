import type { ZodType } from "zod";
import {
  type Client,
  type ClientRelationshipStatus,
  type CreateClientInput,
  clientSchema,
  clientsSchema,
  type UpdateClientInput,
} from "./model";
import { normalizeClientSearchQuery } from "./search";

export type ClientListScenario = "default" | "empty" | "error" | "slow-search" | "error-search";
export type ClientDetailScenario = "default" | "error";
export type ClientCreateScenario = "default" | "error" | "error-once" | "slow";
export type ClientUpdateScenario = "default" | "error" | "error-once" | "slow";
export type ClientStatusScenario = "default" | "error" | "error-once" | "slow";
export type ClientDeleteScenario =
  | "default"
  | "error"
  | "error-once"
  | "has-projects"
  | "not-found"
  | "slow";
export type ClientFieldErrors = Partial<Record<keyof CreateClientInput, string>>;
export type ClientDeleteOutcome =
  | Readonly<{ outcome: "deleted"; clientId: string }>
  | Readonly<{
      clientId: string;
      code: "CLIENT_HAS_PROJECTS";
      outcome: "blocked";
      projectCount: number;
    }>
  | Readonly<{ clientId: string; code: "NOT_FOUND"; outcome: "not-found" }>;
export type ClientListOptions = Readonly<{
  query?: string;
  status?: ClientRelationshipStatus;
  scenario?: ClientListScenario;
}>;

export type ClientRepository = Readonly<{
  list: (options?: ClientListOptions) => Promise<readonly Client[]>;
  get: (id: string, scenario?: ClientDetailScenario) => Promise<Client>;
  create: (input: CreateClientInput, scenario?: ClientCreateScenario) => Promise<Client>;
  update: (
    id: string,
    input: UpdateClientInput,
    scenario?: ClientUpdateScenario,
  ) => Promise<Client>;
  updateRelationshipStatus: (
    id: string,
    status: ClientRelationshipStatus,
    scenario?: ClientStatusScenario,
  ) => Promise<Client>;
  deleteClient: (id: string, scenario?: ClientDeleteScenario) => Promise<ClientDeleteOutcome>;
  reset: () => Promise<readonly Client[]>;
}>;

export class ClientRepositoryError extends Error {
  readonly fieldErrors?: ClientFieldErrors;
  readonly status: number;

  constructor(message: string, status: number, fieldErrors?: ClientFieldErrors) {
    super(message);
    this.name = "ClientRepositoryError";
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

async function parseResponse<Output>(response: Response, schema: ZodType<Output>) {
  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as
      | { fieldErrors?: ClientFieldErrors; message?: string }
      | undefined;
    throw new ClientRepositoryError(
      body?.message ?? "The client request failed.",
      response.status,
      body?.fieldErrors,
    );
  }

  return schema.parse(await response.json());
}

export function createHttpClientRepository(origin = ""): ClientRepository {
  return {
    async list({ query: rawQuery = "", status, scenario = "default" } = {}) {
      const parameters = new URLSearchParams();
      const query = normalizeClientSearchQuery(rawQuery);
      if (query) {
        parameters.set("q", query);
      }
      if (status) {
        parameters.set("status", status);
      }
      if (scenario !== "default") {
        parameters.set("scenario", scenario);
      }
      const search = parameters.size > 0 ? `?${parameters.toString()}` : "";
      return parseResponse(await fetch(`${origin}/api/clients${search}`), clientsSchema);
    },
    async get(id, scenario = "default") {
      const query = scenario === "default" ? "" : `?scenario=${scenario}`;
      return parseResponse(
        await fetch(`${origin}/api/clients/${encodeURIComponent(id)}${query}`),
        clientSchema,
      );
    },
    async create(input, scenario = "default") {
      const query = scenario === "default" ? "" : `?scenario=${scenario}`;
      return parseResponse(
        await fetch(`${origin}/api/clients${query}`, {
          body: JSON.stringify(input),
          headers: { "content-type": "application/json" },
          method: "POST",
        }),
        clientSchema,
      );
    },
    async update(id, input, scenario = "default") {
      const query = scenario === "default" ? "" : `?scenario=${scenario}`;
      return parseResponse(
        await fetch(`${origin}/api/clients/${encodeURIComponent(id)}${query}`, {
          body: JSON.stringify(input),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        }),
        clientSchema,
      );
    },
    async updateRelationshipStatus(id, status, scenario = "default") {
      const query = scenario === "default" ? "" : `?scenario=${scenario}`;
      return parseResponse(
        await fetch(`${origin}/api/clients/${encodeURIComponent(id)}${query}`, {
          body: JSON.stringify({ relationshipStatus: status }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        }),
        clientSchema,
      );
    },
    async deleteClient(id, scenario = "default") {
      const query = scenario === "default" ? "" : `?scenario=${scenario}`;
      const response = await fetch(`${origin}/api/clients/${encodeURIComponent(id)}${query}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => undefined)) as
        | {
            clientId?: string;
            code?: string;
            message?: string;
            outcome?: string;
            projectCount?: number;
          }
        | undefined;

      if (response.status === 409 && body?.code === "CLIENT_HAS_PROJECTS") {
        if (
          body.projectCount === undefined ||
          !Number.isInteger(body.projectCount) ||
          body.projectCount < 1
        ) {
          throw new ClientRepositoryError("The client response was invalid.", 502);
        }
        return {
          clientId: id,
          code: "CLIENT_HAS_PROJECTS",
          outcome: "blocked",
          projectCount: body.projectCount,
        };
      }

      if (response.status === 404) {
        return {
          clientId: id,
          code: "NOT_FOUND",
          outcome: "not-found",
        };
      }

      if (!response.ok) {
        throw new ClientRepositoryError(
          body?.message ?? "The client request failed.",
          response.status,
        );
      }

      if (body?.outcome !== "deleted" || body.clientId !== id) {
        throw new ClientRepositoryError("The client response was invalid.", 502);
      }

      return { outcome: "deleted", clientId: id };
    },
    async reset() {
      return parseResponse(
        await fetch(`${origin}/api/clients/reset`, {
          method: "POST",
        }),
        clientsSchema,
      );
    },
  };
}
