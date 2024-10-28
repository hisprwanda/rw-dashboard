import { z } from "zod";

// Schema definition using zod
export const DashboardSchema = z.object({
  id: z.string(),
  dashboardName: z.string().nonempty({ message: "Dashboard name is required" }),
  dashboardDescription: z.string().optional(),
  createdBy: z.object({
    name: z.string(),
    id: z.string(),
  }),
  createdAt: z.number(), // Consider using z.date() if using Date objects
  updatedAt: z.number(), // Consider using z.date() if using Date objects
  updatedBy: z.object({
    name: z.string(),
    id: z.string(),
  }),
  selectedVisualsForDashboard: z.array(z.unknown()),
  sharing: z.array(z.unknown()).optional(), // Allows any type in the array
});

// Infer form fields from the schema
export type DashboardFormFields = z.infer<typeof DashboardSchema>;
