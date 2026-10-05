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

export type HideEmptyRowItems =
    | 'NONE'
    | 'BEFORE_FIRST'
    | 'AFTER_LAST'
    | 'BEFORE_FIRST_AFTER_LAST'
    | 'ALL'

export type RegressionType = 'NONE' | 'LINEAR' | 'POLYNOMIAL' | 'LOESS'

/** A horizontal line on the value axis (base line or target line). */
export interface ReferenceLine {
    enabled: boolean
    value?: number
    title?: string
}

/** What the user edits in the Options dialog, in the terms of the official Data Visualizer. */
export interface VisualizerOptions {
    /** Key of a DHIS2 color set (`DEFAULT`, `BRIGHT`, `COLOR_BLIND`…). */
    colorSet: string
    showData: boolean
    hideEmptyRowItems: HideEmptyRowItems
    hideLegend: boolean
    cumulativeValues: boolean
    percentStackedValues: boolean
    noSpaceBetweenColumns: boolean
    regressionType: RegressionType
    /** -1 descending, 1 ascending, 0 as returned by analytics. */
    sortOrder: -1 | 0 | 1
    rangeAxisMin?: number
    rangeAxisMax?: number
    rangeAxisSteps?: number
    rangeAxisTitle?: string
    baseLine: ReferenceLine
    targetLine: ReferenceLine
    /** A legend set to color values by (the fixed legend of the official app). */
    legendSetId?: string
    legendStyle: 'FILL' | 'TEXT'
}

/** The options as the chart engine reads them from a visualization object. */
export interface VisualizationEngineOptions {
    colorSet: string
    showData: boolean
    hideEmptyRowItems: HideEmptyRowItems
    seriesKey: { hidden: boolean }
    cumulativeValues: boolean
    percentStackedValues: boolean
    noSpaceBetweenColumns: boolean
    regressionType: RegressionType
    sortOrder: number
    legend?: { strategy: 'FIXED'; style: 'FILL' | 'TEXT'; set: { id: string } }
    axes: Array<{
        type: 'RANGE'
        index: number
        minValue?: number
        maxValue?: number
        steps?: number
        title?: { text: string; textMode: 'CUSTOM' }
        baseLine: { enabled: boolean; value?: number; title?: { text: string } }
        targetLine: { enabled: boolean; value?: number; title?: { text: string } }
    }>
}

/**
 * The part of a DHIS2 visualization object that `@dhis2/analytics` reads: the chart type
 * and which dimensions sit on the series (columns), category (rows) and filter axes.
 */
export interface Visualization extends Partial<VisualizationEngineOptions> {
    type: VisType
    /** Custom title and subtitle; the charts generate their own when these are absent. */
    title?: string
    subtitle?: string
    columns: VisualizationDimension[]
    rows: VisualizationDimension[]
    filters: VisualizationDimension[]
}
