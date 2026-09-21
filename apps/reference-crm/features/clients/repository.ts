import { type Client, clientsSchema } from "./model";

export type ClientListScenario = "default" | "empty" | "error";

export type ClientRepository = Readonly<{
  list: (scenario?: ClientListScenario) => Promise<readonly Client[]>;
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

async function parseResponse(response: Response) {
  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as { message?: string } | undefined;
    throw new ClientRepositoryError(body?.message ?? "The client request failed.", response.status);
  }

  return clientsSchema.parse(await response.json());
}

export function createHttpClientRepository(origin = ""): ClientRepository {
  return {
    async list(scenario = "default") {
      const query = scenario === "default" ? "" : `?scenario=${scenario}`;
      return parseResponse(await fetch(`${origin}/api/clients${query}`));
    },
    async reset() {
      return parseResponse(
        await fetch(`${origin}/api/clients/reset`, {
          method: "POST",
        }),
      );
    },
  };
}
