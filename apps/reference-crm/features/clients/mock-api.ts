import { delay, HttpResponse, http } from "msw";

import {
  type Client,
  clientRelationshipStatusSchema,
  clientsSchema,
  createClientInputSchema,
  updateClientInputSchema,
} from "./model";
import { clientMatchesSearch, normalizeClientSearchQuery } from "./search";
import { deterministicClients } from "./seed";

import type { ProjectStorage } from "../projects/mock-api";

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

export function createClientHandlers(
  storage: ClientStorage,
  latency = defaultLatency,
  onReset?: () => void,
  projectStorage?: ProjectStorage,
) {
  let failNextCreate = true;
  let failNextUpdate = true;
  let failNextStatusUpdate = true;
  let failNextDelete = true;

  return [
    http.get("*/api/clients", async ({ request }) => {
      const parameters = new URL(request.url).searchParams;
      const scenario = parameters.get("scenario");
      const query = normalizeClientSearchQuery(parameters.get("q"));
      const status = clientRelationshipStatusSchema.safeParse(parameters.get("status")).data;
      await delay(
        scenario === "slow-search" &&
          query === "northstar" &&
          (!status || status === "active")
          ? latency * 4
          : latency,
      );

      if (scenario === "error" || (scenario === "error-search" && query === "failure")) {
        return HttpResponse.json(
          { message: "Client data is temporarily unavailable." },
          { status: 503 },
        );
      }

      if (scenario === "empty") {
        return HttpResponse.json([]);
      }

      const clients = readOrSeed(storage);
      return HttpResponse.json(
        clients.filter(
          (client) =>
            (!query || clientMatchesSearch(client, query)) &&
            (!status || client.relationshipStatus === status),
        ),
      );
    }),
    http.get("*/api/clients/:clientId", async ({ params, request }) => {
      const scenario = new URL(request.url).searchParams.get("scenario");
      await delay(latency);

      if (scenario === "error") {
        return HttpResponse.json(
          { message: "Client data is temporarily unavailable." },
          { status: 503 },
        );
      }

      const client = readOrSeed(storage).find((record) => record.id === params.clientId);
      if (!client) {
        return HttpResponse.json({ message: "Client was not found." }, { status: 404 });
      }

      return HttpResponse.json(client);
    }),
    http.post("*/api/clients", async ({ request }) => {
      const scenario = new URL(request.url).searchParams.get("scenario");
      await delay(scenario === "slow" ? 1500 : latency);

      if (scenario === "error" || (scenario === "error-once" && failNextCreate)) {
        failNextCreate = false;
        return HttpResponse.json(
          { message: "The client could not be saved. Try again." },
          { status: 503 },
        );
      }

      const input = createClientInputSchema.parse(await request.json());
      const existingClients = readOrSeed(storage);
      const duplicateEmail = existingClients.some(
        (client) => client.contactEmail.toLowerCase() === input.contactEmail.toLowerCase(),
      );

      if (duplicateEmail) {
        return HttpResponse.json(
          {
            fieldErrors: {
              contactEmail: "A client with this contact email already exists.",
            },
            message: "The submitted client has a validation error.",
          },
          { status: 422 },
        );
      }

      const timestamp = new Date().toISOString();
      const client: Client = {
        ...input,
        id: crypto.randomUUID(),
        relationshipStatus: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      storage.write([client, ...existingClients]);
      return HttpResponse.json(client, { status: 201 });
    }),
    http.patch("*/api/clients/:clientId", async ({ params, request }) => {
      const scenario = new URL(request.url).searchParams.get("scenario");
      await delay(scenario === "slow" ? 1500 : latency);

      const body = await request.json();
      if (typeof body === "object" && body !== null && "relationshipStatus" in body) {
        if (scenario === "error" || (scenario === "error-once" && failNextStatusUpdate)) {
          failNextStatusUpdate = false;
          return HttpResponse.json(
            { message: "The client relationship status could not be updated. Try again." },
            { status: 503 },
          );
        }

        const status = clientRelationshipStatusSchema.safeParse(
          (body as { relationshipStatus?: unknown }).relationshipStatus,
        );
        if (!status.success) {
          return HttpResponse.json(
            { message: "The submitted relationship status is invalid." },
            { status: 422 },
          );
        }

        const existingClients = readOrSeed(storage);
        const clientIndex = existingClients.findIndex((client) => client.id === params.clientId);
        if (clientIndex < 0) {
          return HttpResponse.json({ message: "Client was not found." }, { status: 404 });
        }

        const updatedClient: Client = {
          ...existingClients[clientIndex],
          relationshipStatus: status.data,
          updatedAt: new Date().toISOString(),
        };
        const nextClients = [...existingClients];
        nextClients[clientIndex] = updatedClient;
        storage.write(nextClients);
        return HttpResponse.json(updatedClient);
      }

      if (scenario === "error" || (scenario === "error-once" && failNextUpdate)) {
        failNextUpdate = false;
        return HttpResponse.json(
          { message: "The client could not be updated. Try again." },
          { status: 503 },
        );
      }

      const input = updateClientInputSchema.parse(body);
      const existingClients = readOrSeed(storage);
      const clientIndex = existingClients.findIndex((client) => client.id === params.clientId);
      if (clientIndex < 0) {
        return HttpResponse.json({ message: "Client was not found." }, { status: 404 });
      }

      const duplicateEmail = existingClients.some(
        (client) =>
          client.id !== params.clientId &&
          client.contactEmail.toLowerCase() === input.contactEmail.toLowerCase(),
      );
      if (duplicateEmail) {
        return HttpResponse.json(
          {
            fieldErrors: {
              contactEmail: "A client with this contact email already exists.",
            },
            message: "The submitted client has a validation error.",
          },
          { status: 422 },
        );
      }

      const currentClient = existingClients[clientIndex];
      const updatedClient: Client = {
        ...currentClient,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      const nextClients = [...existingClients];
      nextClients[clientIndex] = updatedClient;
      storage.write(nextClients);
      return HttpResponse.json(updatedClient);
    }),
    http.delete("*/api/clients/:clientId", async ({ params, request }) => {
      const scenario = new URL(request.url).searchParams.get("scenario");
      await delay(scenario === "slow" ? 1500 : latency);

      const clientId = String(params.clientId);
      const existingClients = readOrSeed(storage);
      const clientExists = existingClients.some((client) => client.id === clientId);

      if (!clientExists) {
        return HttpResponse.json(
          { code: "NOT_FOUND", message: "Client was not found." },
          { status: 404 },
        );
      }

      if (scenario === "error" || (scenario === "error-once" && failNextDelete)) {
        failNextDelete = false;
        return HttpResponse.json(
          { message: "The client could not be deleted. Try again." },
          { status: 503 },
        );
      }

      if (scenario === "not-found") {
        storage.write(existingClients.filter((client) => client.id !== clientId));
        return HttpResponse.json(
          { code: "NOT_FOUND", message: "Client was not found." },
          { status: 404 },
        );
      }

      const projectCount =
        projectStorage?.read()?.filter((project) => project.clientId === clientId).length ?? 0;
      if (scenario === "has-projects" || projectCount > 0) {
        return HttpResponse.json(
          {
            code: "CLIENT_HAS_PROJECTS",
            message: "Delete the client projects before deleting this client.",
            projectCount: Math.max(projectCount, scenario === "has-projects" ? 1 : 0),
          },
          { status: 409 },
        );
      }

      storage.write(existingClients.filter((client) => client.id !== clientId));
      return HttpResponse.json({ clientId, outcome: "deleted" });
    }),
    http.post("*/api/clients/reset", async () => {
      await delay(latency);
      storage.write(deterministicClients);
      onReset?.();
      return HttpResponse.json(deterministicClients);
    }),
  ];
}
