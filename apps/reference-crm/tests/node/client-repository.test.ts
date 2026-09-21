import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createClientHandlers, createMemoryClientStorage } from "../../features/clients/mock-api";
import { createHttpClientRepository } from "../../features/clients/repository";
import { deterministicClients } from "../../features/clients/seed";
import { mockServer } from "../msw/server";

beforeAll(() => mockServer.listen({ onUnhandledRequest: "error" }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

describe("ClientRepository", () => {
  it("lists the deterministic seed through the HTTP boundary", async () => {
    mockServer.use(...createClientHandlers(createMemoryClientStorage()));

    const repository = createHttpClientRepository("http://localhost");

    await expect(repository.list()).resolves.toEqual(deterministicClients);
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
});
