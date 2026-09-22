import type { Project } from "./model";

export const deterministicProjects = [
  {
    id: "project_northstar_website",
    clientId: "client_northstar",
    name: "Website refresh",
    description: "Refresh the public site before the next product launch.",
    status: "active",
    startDate: "2026-08-04",
    dueDate: "2026-10-16",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-09-17T13:30:00.000Z",
  },
  {
    id: "project_northstar_brand",
    clientId: "client_northstar",
    name: "Brand system",
    description: "Document the visual language for the internal product suite.",
    status: "completed",
    startDate: "2026-05-11",
    dueDate: "2026-08-28",
    createdAt: "2026-05-01T09:15:00.000Z",
    updatedAt: "2026-08-28T15:45:00.000Z",
  },
  {
    id: "project_juniper_onboarding",
    clientId: "client_juniper",
    name: "Team onboarding",
    description: "Prepare the onboarding workspace for the new delivery team.",
    status: "planned",
    startDate: "2026-10-05",
    createdAt: "2026-08-12T12:00:00.000Z",
    updatedAt: "2026-09-02T09:30:00.000Z",
  },
] as const satisfies readonly Project[];
