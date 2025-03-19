import { z } from "zod";

// Schema definition using zod
export const MapDataSchema = z.object({
  id: z.string(),
  mapType: z.enum(["Thematic"]),
  mapName: z.string().nonempty({ message: "Map name is required" }),
  description: z.string().optional(),
  queries: z.object({
    mapAnalyticsQueryOne: z
      .record(z.string(), z.any())
      .refine((data) => Object.keys(data).length > 0, {
        message: "mapAnalyticsQueryOne object cannot be empty",
      }),
    mapAnalyticsQueryTwo: z
      .record(z.string(), z.any())
      .refine((data) => Object.keys(data).length > 0, {
        message: "mapAnalyticsQueryTwo object cannot be empty",
      }),
    geoFeaturesQuery: z
      .record(z.string(), z.any())
      .refine((data) => Object.keys(data).length > 0, {
        message: "geoFeaturesQuery object cannot be empty",
      }),
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
  organizationTree: z.array(z.string()  ).optional(),
  selectedOrgUnitLevel: z.array(z.number()).optional(),
});

// Infer form fields from the schema
export type MapDataFormFields = z.infer<typeof MapDataSchema>;

export type mapTypes = "Thematic";
