import { delay, HttpResponse, http } from "msw";

import { type Client, clientsSchema, createClientInputSchema } from "./model";
import { deterministicClients } from "./seed";

const clientsStorageKey = "mfd-demo-clients";
const defaultLatency = 350;

export type ClientStorage = Readonly<{
  read: () => readonly Client[] | undefined;
  write: (clients: readonly Client[]) => void;
}>;

export function createMemoryClientStorage(initialClients?: readonly Client[]): ClientStorage {
  let value = initialClients ? structuredClone(initialClients) : undefined;

  return {
    read: () => (value ? structuredClone(value) : undefined),
    write: (clients) => {
      value = structuredClone(clients);
    },
  };
}

export function createBrowserClientStorage(storage: Storage): ClientStorage {
  return {
    read: () => {
      const value = storage.getItem(clientsStorageKey);
      return value ? clientsSchema.parse(JSON.parse(value)) : undefined;
    },
    write: (clients) => {
      storage.setItem(clientsStorageKey, JSON.stringify(clients));
    },
  };
}

function readOrSeed(storage: ClientStorage) {
  const persisted = storage.read();
  if (persisted) {
    return persisted;
  }

  storage.write(deterministicClients);
  return structuredClone(deterministicClients);
}

export function createClientHandlers(storage: ClientStorage, latency = defaultLatency) {
  return [
    http.get("*/api/clients", async ({ request }) => {
      const scenario = new URL(request.url).searchParams.get("scenario");
      await delay(latency);

      if (scenario === "error") {
        return HttpResponse.json(
          { message: "Client data is temporarily unavailable." },
          { status: 503 },
        );
      }

      if (scenario === "empty") {
        return HttpResponse.json([]);
      }

      return HttpResponse.json(readOrSeed(storage));
    }),
    http.post("*/api/clients", async ({ request }) => {
      await delay(latency);
      const input = createClientInputSchema.parse(await request.json());
      const timestamp = new Date().toISOString();
      const client: Client = {
        ...input,
        id: crypto.randomUUID(),
        relationshipStatus: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      storage.write([client, ...readOrSeed(storage)]);
      return HttpResponse.json(client, { status: 201 });
    }),
    http.post("*/api/clients/reset", async () => {
      await delay(latency);
      storage.write(deterministicClients);
      return HttpResponse.json(deterministicClients);
    }),
  ];
}
