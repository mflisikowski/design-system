import { z } from "zod";

export const clientRelationshipStatusSchema = z.enum(["active", "inactive"]);

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

export type Client = z.infer<typeof clientSchema>;
