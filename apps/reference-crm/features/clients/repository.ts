import type { ZodType } from "zod";
import { type Client, type CreateClientInput, clientSchema, clientsSchema } from "./model";

export type ClientListScenario = "default" | "empty" | "error";
export type ClientDetailScenario = "default" | "error";
export type ClientCreateScenario = "default" | "error" | "error-once" | "slow";
export type ClientFieldErrors = Partial<Record<keyof CreateClientInput, string>>;

export type ClientRepository = Readonly<{
  list: (scenario?: ClientListScenario) => Promise<readonly Client[]>;
  get: (id: string, scenario?: ClientDetailScenario) => Promise<Client>;
  create: (input: CreateClientInput, scenario?: ClientCreateScenario) => Promise<Client>;
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
    async list(scenario = "default") {
      const query = scenario === "default" ? "" : `?scenario=${scenario}`;
      return parseResponse(await fetch(`${origin}/api/clients${query}`), clientsSchema);
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
