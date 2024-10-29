import { z } from "zod";

// Schema definition using zod
export const DashboardSchema = z.object({
  dashboardName: z.string().nonempty("Dashboard name is required"),
  dashboardDescription: z.string().optional(),
  createdBy: z.object({
      name: z.string(),
      id: z.string(),
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
  updatedBy: z.object({
      name: z.string(),
      id: z.string(),
  }),
  selectedVisuals: z.array(
      z.object({
          i: z.string(),
          x: z.number(),
          y: z.number(),
          w: z.number(),
          h: z.number(),
          visualName: z.string(),
          visualQuery: z.any(),
          visualType: z.string(),
      })
  ),
  sharing: z.array(z.unknown()).optional(),
  previewImg: z.string().optional(),
});

// Infer form fields from the schema
export type DashboardFormFields = z.infer<typeof DashboardSchema>;
