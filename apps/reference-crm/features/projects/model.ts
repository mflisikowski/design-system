import { z } from "zod";

export const projectStatusSchema = z.enum(["planned", "active", "on-hold", "completed"]);

const projectDatesSchema = {
  startDate: z.iso.date().optional(),
  dueDate: z.iso.date().optional(),
};

function validateProjectDates<T extends { dueDate?: string; startDate?: string }>(value: T) {
  return !value.startDate || !value.dueDate || value.dueDate >= value.startDate;
}

const projectTimelineMessage = "Due date cannot be earlier than the start date.";

export const projectSchema = z
  .object({
    id: z.string().min(1),
    clientId: z.string().min(1),
    name: z.string().min(2).max(120),
    description: z.string().max(1000).optional(),
    status: projectStatusSchema,
    ...projectDatesSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .refine(validateProjectDates, { message: projectTimelineMessage, path: ["dueDate"] });

export const projectsSchema = z.array(projectSchema);

export const createProjectInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must have at least 2 characters.")
      .max(120, "Project name must have at most 120 characters."),
    description: z
      .string()
      .trim()
      .max(1000, "Description must have at most 1000 characters.")
      .transform((value) => value || undefined)
      .optional(),
    status: projectStatusSchema.default("planned"),
    ...projectDatesSchema,
  })
  .refine(validateProjectDates, { message: projectTimelineMessage, path: ["dueDate"] });

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const projectStatusLabels: Record<ProjectStatus, string> = {
  active: "Active",
  completed: "Completed",
  "on-hold": "On hold",
  planned: "Planned",
};
