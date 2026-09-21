import type { Client } from "./model";

export const deterministicClients = [
  {
    id: "client_northstar",
    organizationName: "Northstar Studio",
    contactName: "Jamie Chen",
    contactEmail: "jamie.chen@northstar.example",
    contactPhone: "+1 415 555 0142",
    notes: "Fictional product design studio used in the Reference CRM.",
    relationshipStatus: "active",
    createdAt: "2026-06-12T09:30:00.000Z",
    updatedAt: "2026-09-18T14:15:00.000Z",
  },
  {
    id: "client_juniper",
    organizationName: "Juniper & Field",
    contactName: "Morgan Ellis",
    contactEmail: "morgan.ellis@juniper-field.example",
    relationshipStatus: "active",
    createdAt: "2026-04-03T11:00:00.000Z",
    updatedAt: "2026-09-02T08:45:00.000Z",
  },
  {
    id: "client_lumen",
    organizationName: "Lumen Works",
    contactName: "Taylor Brooks",
    contactEmail: "taylor.brooks@lumen.example",
    contactPhone: "+44 20 7946 0183",
    relationshipStatus: "inactive",
    createdAt: "2025-11-20T16:20:00.000Z",
    updatedAt: "2026-08-21T10:10:00.000Z",
  },
] as const satisfies readonly Client[];
