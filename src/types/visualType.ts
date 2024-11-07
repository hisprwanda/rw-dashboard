import { z } from "zod";

// Schema definition using zod
export const VisualDataSchema = z.object({
  id: z.string(),
  visualType: z.enum(["bar", "pie", "line"]),
  visualName: z.string().nonempty({ message: "Visual name is required" }),
  description: z.string(),
  query: z
    .record(z.string(), z.any())
    .refine((data) => Object.keys(data).length > 0, {
      message: "Query object cannot be empty",
    }), 
  dataSourceId: z.string().nonempty({ message: "Data source ID is required" }),
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
  organizationTree: z.array(z.string())?.optional(),
  selectedOrgUnitLevel: z.array(z.number())?.optional(),
});

// Infer form fields from the schema
export type VisualDataFormFields = z.infer<typeof VisualDataSchema>;
