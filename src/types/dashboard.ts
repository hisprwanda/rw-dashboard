import { z } from "zod";
import { Layout } from "react-grid-layout";
import { analyticsPayloadDeterminerTypes } from "./analyticsTypes";
import { BasemapType } from "./maps";

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
      analyticsPayloadDeterminer:z.object({
        Columns: z.array(z.string()),
        Rows: z.array(z.string()),
        Filter: z.array(z.string()),
      }),
      dataSourceId: z
        .string()
        .nonempty({ message: "Data source ID is required" }),
      visualTitleAndSubTitle:z.object({
        visualTitle: z.string().optional(),
        customSubTitle: z.string()?.optional(),
        DefaultSubTitle: z
        .object({
          periods: z.array(z.any()),
          orgUnits: z.array(z.any()),
          dataElements: z.array(z.any()),
        })
        .optional(),
      }),
      visualSettings: z.object({
        visualColorPalette: z.object({
          name: z.string(),
          itemsBackgroundColors: z.array(z.string()),
        }),
        backgroundColor: z.string()?.optional(),
        fillColor: z.string()?.optional(),
        XAxisSettings: z
          .object({
            color: z.string(),
            fontSize: z.number(),
          })
          .optional(),
        YAxisSettings: z
          .object({
            color: z.string(),
            fontSize: z.number(),
          })
          .optional(),
      }),
    })
  ),
  selectedMaps: z.array(
    z.object({
      i: z.string(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
      isMapItem: z.literal(true),
      mapName: z.string(),
      geoFeaturesQuery: z.any(),
      mapAnalyticsQueryOneQuery: z.any(),
      mapAnalyticsQueryTwo: z.any(),
      mapType: z.string(),
      BasemapType: z.enum(["osm-light", "osm-detailed"]).default("osm-light"),
      mapSettings: z.object({
        labels: z.any(),
        legend: z.any(),
        legendType: z.enum(["auto", "dhis2"]).default("auto"),
    }).optional(),
      dataSourceId: z
        .string()
        .nonempty({ message: "Data source ID is required" }),
    })
  ),
  sharing: z
    .array(
      z.object({
        name: z.string(),
        id: z.string(),
        type: z.string(),
        accessLevel: z.string(),
      })
    )
    .optional(),
  generalDashboardAccess: z
    .enum(["No access", "View only", "View and edit"])
    .default("No access"),
  previewImg: z.string().optional(),
  isOfficialDashboard: z.boolean(),
  favorites: z.array(z.string()).optional(),
  dashboardSettings: z.object({
    backgroundColor: z.string(),
  }),
});

// Infer form fields from the schema
export type DashboardFormFields = z.infer<typeof DashboardSchema>;

/////// dashboard settings
export type dashboardSettings = {
  backgroundColor: string;
};

export interface ExtendedLayout extends Layout {
  visualName?: string;
  visualQuery?: any;
  visualType?: string;
  visualSecttings?: any;
  visualTitleAndSubTitle?: any;
  dataSourceId?: string;
  mapName?: string;
  geoFeaturesQuery?: any;
  mapAnalyticsQueryOneQuery?: any;
  mapAnalyticsQueryTwo?: any;
  isMapItem?: boolean;
  BasemapType?: BasemapType;
  mapSettings: {
      labels: any;
      legend: any;
      legendType: "auto" | "dhis2";
    };
  analyticsPayloadDeterminer:analyticsPayloadDeterminerTypes
}
