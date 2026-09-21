import type { ZodType } from "zod";
import { type Client, type CreateClientInput, clientSchema, clientsSchema } from "./model";

export type ClientListScenario = "default" | "empty" | "error";

export type ClientRepository = Readonly<{
  list: (scenario?: ClientListScenario) => Promise<readonly Client[]>;
  create: (input: CreateClientInput) => Promise<Client>;
  reset: () => Promise<readonly Client[]>;
}>;

export class ClientRepositoryError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ClientRepositoryError";
    this.status = status;
  }
}

async function parseResponse<Output>(response: Response, schema: ZodType<Output>) {
  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as { message?: string } | undefined;
    throw new ClientRepositoryError(body?.message ?? "The client request failed.", response.status);
  }

  return schema.parse(await response.json());
}

export function createHttpClientRepository(origin = ""): ClientRepository {
  return {
    async list(scenario = "default") {
      const query = scenario === "default" ? "" : `?scenario=${scenario}`;
      return parseResponse(await fetch(`${origin}/api/clients${query}`), clientsSchema);
    },
    async create(input) {
      return parseResponse(
        await fetch(`${origin}/api/clients`, {
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
