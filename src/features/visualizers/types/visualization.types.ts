/** Chart types of the DHIS2 visualization object (`@dhis2/analytics` `VIS_TYPE_*`). */
export type VisType =
    | 'COLUMN'
    | 'STACKED_COLUMN'
    | 'BAR'
    | 'STACKED_BAR'
    | 'LINE'
    | 'AREA'
    | 'STACKED_AREA'
    | 'PIE'
    | 'RADAR'
    | 'GAUGE'
    | 'BUBBLE'
    | 'YEAR_OVER_YEAR_LINE'
    | 'YEAR_OVER_YEAR_COLUMN'
    | 'SINGLE_VALUE'
    | 'PIVOT_TABLE'
    | 'SCATTER'

/** One dimension on an axis, e.g. `{ dimension: 'dx', items: [{ id: 'abc' }] }`. */
export interface VisualizationDimension {
    dimension: string
    items: Array<{ id: string }>
}

/**
 * The part of a DHIS2 visualization object that `@dhis2/analytics` reads: the chart type
 * and which dimensions sit on the series (columns), category (rows) and filter axes.
 */
export interface Visualization {
    type: VisType
    columns: VisualizationDimension[]
    rows: VisualizationDimension[]
    filters: VisualizationDimension[]
}
