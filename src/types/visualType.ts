import { z } from "zod";

// Schema definition using zod
export const VisualDataSchema = z.object({
  id: z.string(),
  visualType: z.enum([
    "Table",
    "Column",
    "Stacked Col",
    "Bar",
    "Stacked Bar",
    "Line",
    "Area",
    "Pie",
    "Radar",
    "Scatter",
]),
  visualName: z.string().nonempty({ message: "Visual name is required" }),
  visualTitleAndSubTitle: z.object({
    visualTitle: z.string()?.optional(),
    customSubTitle: z.string()?.optional(),
    DefaultSubTitle: z.array(z.string())?.optional(),
  }),
  visualSettings: z.object({
    backgroundColor: z.string()?.optional(),
  }),
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
