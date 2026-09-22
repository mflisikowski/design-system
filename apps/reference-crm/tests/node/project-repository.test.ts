import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  createMemoryProjectStorage,
  createProjectHandlers,
} from "../../features/projects/mock-api";
import { createMemoryClientStorage, createClientHandlers } from "../../features/clients/mock-api";
import { createHttpProjectRepository } from "../../features/projects/repository";
import { deterministicClients } from "../../features/clients/seed";
import { deterministicProjects } from "../../features/projects/seed";
import { mockServer } from "../msw/server";

beforeAll(() => mockServer.listen({ onUnhandledRequest: "error" }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

describe("ProjectRepository", () => {
  it("lists only the projects owned by the requested client in updated order", async () => {
    const clientStorage = createMemoryClientStorage(deterministicClients);
    const projectStorage = createMemoryProjectStorage(deterministicProjects);
    mockServer.use(
      ...createClientHandlers(clientStorage),
      ...createProjectHandlers(projectStorage, clientStorage, 0),
    );

    const repository = createHttpProjectRepository("http://localhost");

    await expect(repository.listByClient("client_northstar")).resolves.toEqual([
      deterministicProjects[0],
      deterministicProjects[1],
    ]);
    await expect(repository.listByClient("client_lumen")).resolves.toEqual([]);
  });

  it("rejects project reads and writes for an unknown client", async () => {
    const clientStorage = createMemoryClientStorage(deterministicClients);
    const projectStorage = createMemoryProjectStorage(deterministicProjects);
    mockServer.use(
      ...createClientHandlers(clientStorage),
      ...createProjectHandlers(projectStorage, clientStorage, 0),
    );

    const repository = createHttpProjectRepository("http://localhost");

    await expect(repository.listByClient("client_missing")).rejects.toMatchObject({
      name: "ProjectRepositoryError",
      status: 404,
    });
    await expect(
      repository.create("client_missing", {
        name: "Unowned work",
        description: undefined,
        status: "planned",
      }),
    ).rejects.toMatchObject({
      name: "ProjectRepositoryError",
      status: 404,
    });
  });

  it("creates a project for exactly one client and persists it", async () => {
    const clientStorage = createMemoryClientStorage(deterministicClients);
    const projectStorage = createMemoryProjectStorage([]);
    mockServer.use(
      ...createClientHandlers(clientStorage),
      ...createProjectHandlers(projectStorage, clientStorage, 0),
    );

    const repository = createHttpProjectRepository("http://localhost");
    const created = await repository.create("client_northstar", {
      name: "Aurora rollout",
      description: "Coordinate the first release.",
      status: "planned",
    });

    expect(created).toMatchObject({
      clientId: "client_northstar",
      name: "Aurora rollout",
      description: "Coordinate the first release.",
      status: "planned",
    });
    expect(created.id).not.toBe("");
    expect(created.createdAt).toBe(created.updatedAt);
    await expect(repository.listByClient("client_northstar")).resolves.toEqual([created]);
    await expect(repository.listByClient("client_juniper")).resolves.toEqual([]);
  });

  it("maps project field validation and infrastructure failures without persisting", async () => {
    const clientStorage = createMemoryClientStorage(deterministicClients);
    const projectStorage = createMemoryProjectStorage([]);
    mockServer.use(
      ...createClientHandlers(clientStorage),
      ...createProjectHandlers(projectStorage, clientStorage, 0),
    );

    const repository = createHttpProjectRepository("http://localhost");

    await expect(
      repository.create("client_northstar", {
        name: "x",
        description: undefined,
        status: "planned",
      }),
    ).rejects.toMatchObject({
      fieldErrors: {
        name: "Project name must have at least 2 characters.",
      },
      name: "ProjectRepositoryError",
      status: 422,
    });

    await expect(
      repository.create(
        "client_northstar",
        { name: "Unavailable work", description: undefined, status: "planned" },
        "error",
      ),
    ).rejects.toMatchObject({
      message: "The project could not be saved. Try again.",
      name: "ProjectRepositoryError",
      status: 503,
    });
    await expect(repository.listByClient("client_northstar")).resolves.toEqual([]);
  });

  it("rejects a due date that precedes the start date", async () => {
    const clientStorage = createMemoryClientStorage(deterministicClients);
    const projectStorage = createMemoryProjectStorage([]);
    mockServer.use(
      ...createClientHandlers(clientStorage),
      ...createProjectHandlers(projectStorage, clientStorage, 0),
    );

    const repository = createHttpProjectRepository("http://localhost");

    await expect(
      repository.create("client_northstar", {
        dueDate: "2026-08-01",
        name: "Invalid timeline",
        startDate: "2026-08-15",
        status: "planned",
      }),
    ).rejects.toMatchObject({
      fieldErrors: {
        dueDate: "Due date cannot be earlier than the start date.",
      },
      status: 422,
    });
  });
});
