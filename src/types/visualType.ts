import { XAxis } from "recharts";
import { nullable, z } from "zod";

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
    "Radial",
    "Single Value",
    "Tree Map"
]),
  visualName: z.string().nonempty({ message: "Visual name is required" }),
  visualTitleAndSubTitle: z.object({
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
  visualSettings:  z.object({
    visualColorPalette: z.object({
      name: z.string(), 
      itemsBackgroundColors: z.array(z.string())
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
  backedSelectedItems:z.array(z.object({
    label: z.string(),
    id: z.string(),
 
  })),
});

// Infer form fields from the schema
export type VisualDataFormFields = z.infer<typeof VisualDataSchema>;

export type BackedSelectedItem = {
  id: string;
  label: string;
};
export type visualTypes =  "Table"|
"Column"|
"Stacked Col"|
"Bar"|
"Stacked Bar"|
"Line"|
"Area"|
"Pie"|
"Radar"|
"Scatter"|
"Radial"|
"Single Value"|
"Tree Map"