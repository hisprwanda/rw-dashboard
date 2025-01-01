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
          dataSourceId: z.string().nonempty({ message: "Data source ID is required" }),
          visualTitleAndSubTitle: z.object({
            visualTitle: z.string()?.optional(),
            customSubTitle: z.string()?.optional(),
            DefaultSubTitle: z.array(z.string())?.optional(),
          }),
          visualSettings: z.object({
            visualColorPalette: z.object({
              name: z.string(), 
              itemsBackgroundColors: z.array(z.string()),
            }),
            backgroundColor:z.string()?.optional(),
            fillColor:z.string()?.optional(),
            XAxisSettings:z.object({
              color: z.string(),
              fontSize:z.number(),
            }).optional(),
            YAxisSettings:z.object({
              color: z.string(),
              fontSize:z.number(),
            }).optional(),
          }),
      })
  ),
  sharing: z.array(z.unknown()).optional(),
  previewImg: z.string().optional(),
  isOfficialDashboard: z.boolean(),
  favorites: z.array(z.string()).optional()
});

// Infer form fields from the schema
export type DashboardFormFields = z.infer<typeof DashboardSchema>;
