import { z } from "zod";

export const clientRelationshipStatusSchema = z.enum(["active", "inactive"]);

export const clientRelationshipStatusLabels = {
  active: "Active",
  inactive: "Inactive",
} as const satisfies Record<ClientRelationshipStatus, string>;

export const clientSchema = z.object({
  id: z.string().min(1),
  organizationName: z.string().min(2).max(100),
  contactName: z.string().min(2).max(100),
  contactEmail: z.email(),
  contactPhone: z.string().min(1).optional(),
  notes: z.string().max(1000).optional(),
  relationshipStatus: clientRelationshipStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const clientsSchema = z.array(clientSchema);

export const createClientInputSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(2, "Organization name must have at least 2 characters.")
    .max(100, "Organization name must have at most 100 characters."),
  contactName: z
    .string()
    .trim()
    .min(2, "Contact name must have at least 2 characters.")
    .max(100, "Contact name must have at most 100 characters."),
  contactEmail: z.string().trim().pipe(z.email("Enter a valid email address.")),
  contactPhone: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional(),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must have at most 1000 characters.")
    .transform((value) => value || undefined)
    .optional(),
});

export const updateClientInputSchema = createClientInputSchema;

export type Client = z.infer<typeof clientSchema>;
export type ClientRelationshipStatus = z.infer<typeof clientRelationshipStatusSchema>;
export type CreateClientInput = z.infer<typeof createClientInputSchema>;
export type UpdateClientInput = z.infer<typeof updateClientInputSchema>;
