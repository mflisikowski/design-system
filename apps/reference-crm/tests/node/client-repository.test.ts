import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createClientHandlers, createMemoryClientStorage } from "../../features/clients/mock-api";
import { createHttpClientRepository } from "../../features/clients/repository";
import { deterministicClients } from "../../features/clients/seed";
import { createMemoryProjectStorage } from "../../features/projects/mock-api";
import { deterministicProjects } from "../../features/projects/seed";
import { mockServer } from "../msw/server";

beforeAll(() => mockServer.listen({ onUnhandledRequest: "error" }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

describe("ClientRepository", () => {
  it("gets a client by id through the HTTP boundary", async () => {
    mockServer.use(...createClientHandlers(createMemoryClientStorage()));

    const repository = createHttpClientRepository("http://localhost");

    await expect(repository.get("client_northstar")).resolves.toEqual(deterministicClients[0]);
  });

  it("exposes an explicit not-found error for an unknown client id", async () => {
    mockServer.use(...createClientHandlers(createMemoryClientStorage()));

    const repository = createHttpClientRepository("http://localhost");

    await expect(repository.get("client_missing")).rejects.toMatchObject({
      name: "ClientRepositoryError",
      status: 404,
    });
  });

  it("lists the deterministic seed through the HTTP boundary", async () => {
    mockServer.use(...createClientHandlers(createMemoryClientStorage()));

    const repository = createHttpClientRepository("http://localhost");

    await expect(repository.list()).resolves.toEqual(deterministicClients);
  });

  it("matches organization, contact, and email with normalized search text", async () => {
    const clients = [
      {
        ...deterministicClients[0],
        organizationName: "  Café Élan  ",
        contactName: "Zoë Ångström",
        contactEmail: "zoe@cafe-elan.example",
      },
      deterministicClients[1],
    ];
    mockServer.use(...createClientHandlers(createMemoryClientStorage(clients), 0));
    const repository = createHttpClientRepository("http://localhost");

    await expect(repository.list({ query: "  CAFE elan " })).resolves.toEqual([clients[0]]);
    await expect(repository.list({ query: "angstrom" })).resolves.toEqual([clients[0]]);
    await expect(repository.list({ query: " ZOE@CAFE-ELAN.EXAMPLE " })).resolves.toEqual([
      clients[0],
    ]);
  });

  it("persists resets atomically through the repository contract", async () => {
    const storage = createMemoryClientStorage([]);
    mockServer.use(...createClientHandlers(storage));
    const repository = createHttpClientRepository("http://localhost");

    await expect(repository.list()).resolves.toEqual([]);
    await expect(repository.reset()).resolves.toEqual(deterministicClients);
    await expect(repository.list()).resolves.toEqual(deterministicClients);
  });

  it("creates an active client through the HTTP boundary and persists it first", async () => {
    const storage = createMemoryClientStorage([]);
    mockServer.use(...createClientHandlers(storage, 0));
    const repository = createHttpClientRepository("http://localhost");

    const created = await repository.create({
      organizationName: "Aurora Works",
      contactName: "Maya Ortiz",
      contactEmail: "maya@aurora.example",
      contactPhone: "+48 555 010 202",
      notes: "Introduced at the autumn planning session.",
    });

    expect(created).toMatchObject({
      organizationName: "Aurora Works",
      contactName: "Maya Ortiz",
      contactEmail: "maya@aurora.example",
      relationshipStatus: "active",
    });
    expect(created.id).not.toBe("");
    expect(created.createdAt).toBe(created.updatedAt);
    await expect(repository.list()).resolves.toEqual([created]);
  });

  it("maps a duplicate contact email response to the named field", async () => {
    const storage = createMemoryClientStorage(deterministicClients);
    mockServer.use(...createClientHandlers(storage, 0));
    const repository = createHttpClientRepository("http://localhost");

    await expect(
      repository.create({
        organizationName: "Another Northstar",
        contactName: "Jamie Chen",
        contactEmail: deterministicClients[0].contactEmail.toUpperCase(),
      }),
    ).rejects.toMatchObject({
      fieldErrors: {
        contactEmail: "A client with this contact email already exists.",
      },
      name: "ClientRepositoryError",
      status: 422,
    });

    await expect(repository.list()).resolves.toEqual(deterministicClients);
  });

  it("exposes a retryable create failure without persisting the submitted client", async () => {
    const storage = createMemoryClientStorage([]);
    mockServer.use(...createClientHandlers(storage, 0));
    const repository = createHttpClientRepository("http://localhost");

    await expect(
      repository.create(
        {
          organizationName: "Aurora Works",
          contactName: "Maya Ortiz",
          contactEmail: "maya@aurora.example",
        },
        "error",
      ),
    ).rejects.toMatchObject({
      message: "The client could not be saved. Try again.",
      name: "ClientRepositoryError",
      status: 503,
    });

    await expect(repository.list()).resolves.toEqual([]);
  });

  it("updates a client through the HTTP boundary and persists the returned record", async () => {
    const storage = createMemoryClientStorage(deterministicClients);
    mockServer.use(...createClientHandlers(storage, 0));
    const repository = createHttpClientRepository("http://localhost");

    const updated = await repository.update("client_northstar", {
      organizationName: "Northstar Studio Updated",
      contactName: "Jamie Chen",
      contactEmail: "jamie.chen@northstar.example",
      contactPhone: "+48 555 010 999",
      notes: "Updated account notes.",
    });

    expect(updated).toMatchObject({
      id: "client_northstar",
      organizationName: "Northstar Studio Updated",
      contactPhone: "+48 555 010 999",
      notes: "Updated account notes.",
      relationshipStatus: "active",
    });
    expect(updated.updatedAt).not.toBe(deterministicClients[0].updatedAt);
    await expect(repository.get("client_northstar")).resolves.toEqual(updated);
  });

  it("maps update validation failures to the edited field", async () => {
    const storage = createMemoryClientStorage(deterministicClients);
    mockServer.use(...createClientHandlers(storage, 0));
    const repository = createHttpClientRepository("http://localhost");

    await expect(
      repository.update("client_northstar", {
        organizationName: "Another Northstar",
        contactName: "Jamie Chen",
        contactEmail: deterministicClients[1].contactEmail,
      }),
    ).rejects.toMatchObject({
      fieldErrors: {
        contactEmail: "A client with this contact email already exists.",
      },
      name: "ClientRepositoryError",
      status: 422,
    });

    await expect(repository.get("client_northstar")).resolves.toEqual(deterministicClients[0]);
  });

  it("turns an HTTP failure into a typed repository error", async () => {
    mockServer.use(
      http.get("*/api/clients", () =>
        HttpResponse.json({ message: "Unavailable" }, { status: 503 }),
      ),
    );
    const repository = createHttpClientRepository("http://localhost");

    await expect(repository.list()).rejects.toMatchObject({
      name: "ClientRepositoryError",
      status: 503,
    });
  });

  it("deletes an empty client without touching project storage", async () => {
    const clientStorage = createMemoryClientStorage([deterministicClients[2]]);
    const projectStorage = createMemoryProjectStorage([deterministicProjects[2]]);
    mockServer.use(...createClientHandlers(clientStorage, 0, undefined, projectStorage));

    const repository = createHttpClientRepository("http://localhost");

    await expect(repository.deleteClient(deterministicClients[2].id)).resolves.toEqual({
      outcome: "deleted",
      clientId: deterministicClients[2].id,
    });
    await expect(repository.list()).resolves.toEqual([]);
    expect(projectStorage.read()).toEqual([deterministicProjects[2]]);
  });

  it("returns the current project dependency count without cascading client deletion", async () => {
    const clientStorage = createMemoryClientStorage([deterministicClients[0]]);
    const projectStorage = createMemoryProjectStorage(deterministicProjects);
    mockServer.use(...createClientHandlers(clientStorage, 0, undefined, projectStorage));

    const repository = createHttpClientRepository("http://localhost");

    await expect(repository.deleteClient(deterministicClients[0].id)).resolves.toEqual({
      code: "CLIENT_HAS_PROJECTS",
      outcome: "blocked",
      clientId: deterministicClients[0].id,
      projectCount: 2,
    });
    expect(clientStorage.read()).toEqual([deterministicClients[0]]);
    expect(projectStorage.read()).toEqual(deterministicProjects);
  });

  it("returns a typed stale outcome for a missing client", async () => {
    const clientStorage = createMemoryClientStorage([deterministicClients[1]]);
    const projectStorage = createMemoryProjectStorage([]);
    mockServer.use(...createClientHandlers(clientStorage, 0, undefined, projectStorage));

    const repository = createHttpClientRepository("http://localhost");

    await expect(repository.deleteClient("client_missing")).resolves.toEqual({
      code: "NOT_FOUND",
      outcome: "not-found",
      clientId: "client_missing",
    });
    expect(clientStorage.read()).toEqual([deterministicClients[1]]);
  });

  it("keeps the client and its projects when deletion fails with infrastructure error", async () => {
    const clientStorage = createMemoryClientStorage([deterministicClients[1]]);
    const projectStorage = createMemoryProjectStorage([]);
    mockServer.use(...createClientHandlers(clientStorage, 0, undefined, projectStorage));

    const repository = createHttpClientRepository("http://localhost");

    await expect(
      repository.deleteClient(deterministicClients[1].id, "error"),
    ).rejects.toMatchObject({
      message: "The client could not be deleted. Try again.",
      name: "ClientRepositoryError",
      status: 503,
    });
    expect(clientStorage.read()).toEqual([deterministicClients[1]]);
    expect(projectStorage.read()).toEqual([]);
  });
});
