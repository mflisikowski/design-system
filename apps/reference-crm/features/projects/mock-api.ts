import { delay, HttpResponse, http } from "msw";

import type { ClientStorage } from "../clients/mock-api";
import { deterministicClients } from "../clients/seed";
import { createProjectInputSchema, type Project, projectsSchema } from "./model";
import { deterministicProjects } from "./seed";

const projectsStorageKey = "mfd-demo-projects";
const defaultLatency = 350;

export type ProjectStorage = Readonly<{
  read: () => readonly Project[] | undefined;
  write: (projects: readonly Project[]) => void;
}>;

export function createMemoryProjectStorage(initialProjects?: readonly Project[]): ProjectStorage {
  let value = initialProjects ? structuredClone(initialProjects) : undefined;

  return {
    read: () => (value ? structuredClone(value) : undefined),
    write: (projects) => {
      value = structuredClone(projects);
    },
  };
}

export function createBrowserProjectStorage(storage: Storage): ProjectStorage {
  return {
    read: () => {
      const value = storage.getItem(projectsStorageKey);
      return value ? projectsSchema.parse(JSON.parse(value)) : undefined;
    },
    write: (projects) => {
      storage.setItem(projectsStorageKey, JSON.stringify(projects));
    },
  };
}

function readOrSeed(storage: ProjectStorage) {
  const persisted = storage.read();
  if (persisted) {
    return persisted;
  }

  storage.write(deterministicProjects);
  return structuredClone(deterministicProjects);
}

function readClients(storage: ClientStorage) {
  const persisted = storage.read();
  if (persisted) {
    return persisted;
  }

  storage.write(deterministicClients);
  return structuredClone(deterministicClients);
}

function validationResponse(error: { issues: readonly { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors = Object.fromEntries(
    error.issues.map((issue) => [issue.path[0], issue.message]),
  );
  return HttpResponse.json(
    { fieldErrors, message: "The submitted project has a validation error." },
    { status: 422 },
  );
}

export function createProjectHandlers(
  projectStorage: ProjectStorage,
  clientStorage: ClientStorage,
  latency = defaultLatency,
) {
  let failNextCreate = true;

  return [
    http.get("*/api/clients/:clientId/projects", async ({ params, request }) => {
      const scenario = new URL(request.url).searchParams.get("scenario");
      await delay(latency);

      if (!readClients(clientStorage).some((client) => client.id === params.clientId)) {
        return HttpResponse.json({ message: "Client was not found." }, { status: 404 });
      }

      if (scenario === "error") {
        return HttpResponse.json(
          { message: "Project data is temporarily unavailable." },
          { status: 503 },
        );
      }

      if (scenario === "empty") {
        return HttpResponse.json([]);
      }

      const projects = readOrSeed(projectStorage)
        .filter((project) => project.clientId === params.clientId)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
      return HttpResponse.json(projects);
    }),
    http.post("*/api/clients/:clientId/projects", async ({ params, request }) => {
      const scenario = new URL(request.url).searchParams.get("scenario");
      await delay(scenario === "slow" ? 1500 : latency);

      if (!readClients(clientStorage).some((client) => client.id === params.clientId)) {
        return HttpResponse.json({ message: "Client was not found." }, { status: 404 });
      }

      if (scenario === "error" || (scenario === "error-once" && failNextCreate)) {
        failNextCreate = false;
        return HttpResponse.json(
          { message: "The project could not be saved. Try again." },
          { status: 503 },
        );
      }

      const parsed = createProjectInputSchema.safeParse(await request.json());
      if (!parsed.success) {
        return validationResponse(parsed.error);
      }

      const timestamp = new Date().toISOString();
      const project: Project = {
        ...parsed.data,
        clientId: String(params.clientId),
        createdAt: timestamp,
        id: crypto.randomUUID(),
        updatedAt: timestamp,
      };
      const existingProjects = readOrSeed(projectStorage);
      projectStorage.write([project, ...existingProjects]);
      return HttpResponse.json(project, { status: 201 });
    }),
  ];
}

export { projectsStorageKey };
