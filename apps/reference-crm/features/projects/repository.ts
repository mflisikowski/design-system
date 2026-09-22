import type { ZodType } from "zod";

import {
  type CreateProjectInput,
  type Project,
  projectSchema,
  projectsSchema,
} from "./model";

export type ProjectListScenario = "default" | "empty" | "error";
export type ProjectCreateScenario = "default" | "error" | "error-once" | "slow";
export type ProjectFieldErrors = Partial<Record<keyof CreateProjectInput, string>>;

export type ProjectRepository = Readonly<{
  listByClient: (clientId: string, scenario?: ProjectListScenario) => Promise<readonly Project[]>;
  create: (
    clientId: string,
    input: CreateProjectInput,
    scenario?: ProjectCreateScenario,
  ) => Promise<Project>;
}>;

export class ProjectRepositoryError extends Error {
  readonly fieldErrors?: ProjectFieldErrors;
  readonly status: number;

  constructor(message: string, status: number, fieldErrors?: ProjectFieldErrors) {
    super(message);
    this.name = "ProjectRepositoryError";
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

async function parseResponse<Output>(response: Response, schema: ZodType<Output>) {
  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as
      | { fieldErrors?: ProjectFieldErrors; message?: string }
      | undefined;
    throw new ProjectRepositoryError(
      body?.message ?? "The project request failed.",
      response.status,
      body?.fieldErrors,
    );
  }

  return schema.parse(await response.json());
}

export function createHttpProjectRepository(origin = ""): ProjectRepository {
  return {
    async listByClient(clientId, scenario = "default") {
      const query = scenario === "default" ? "" : `?scenario=${scenario}`;
      return parseResponse(
        await fetch(`${origin}/api/clients/${encodeURIComponent(clientId)}/projects${query}`),
        projectsSchema,
      );
    },
    async create(clientId, input, scenario = "default") {
      const query = scenario === "default" ? "" : `?scenario=${scenario}`;
      return parseResponse(
        await fetch(`${origin}/api/clients/${encodeURIComponent(clientId)}/projects${query}`, {
          body: JSON.stringify(input),
          headers: { "content-type": "application/json" },
          method: "POST",
        }),
        projectSchema,
      );
    },
  };
}
