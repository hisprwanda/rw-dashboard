import {
    dimensionIdOf,
    type AnalyticsLayout,
    type AnalyticsParams,
    type LayoutDimensionName,
} from '@/features/analytics'
import type { ChartType } from '@/features/charts'
import type { SavedVisual } from '../types/visual.types'
import type { VisType, Visualization, VisualizationDimension } from '../types/visualization.types'

/** Our chart types that exist in the official Data Visualizer. Radial and Tree Map do not. */
const VIS_TYPE_BY_CHART_TYPE: Partial<Record<ChartType, VisType>> = {
    Column: 'COLUMN',
    'Stacked Col': 'STACKED_COLUMN',
    Bar: 'BAR',
    'Stacked Bar': 'STACKED_BAR',
    Line: 'LINE',
    Area: 'AREA',
    Scatter: 'SCATTER',
    Radar: 'RADAR',
    Pie: 'PIE',
    Gauge: 'GAUGE',
    'Single Value': 'SINGLE_VALUE',
    Table: 'PIVOT_TABLE',
}

/** The official chart type of a legacy one, or `undefined` when it has no counterpart. */
export const visTypeFromChartType = (chartType: ChartType): VisType | undefined =>
    VIS_TYPE_BY_CHART_TYPE[chartType]

/** `['dx:a;b', 'pe:2024']` plus a filter -> `{ dx: ['a', 'b'], pe: ['2024'] }`. */
const itemsByDimension = (params: AnalyticsParams | undefined): Map<string, string[]> => {
    const entries = [...(params?.dimension ?? []), ...[params?.filter ?? []].flat()]
    return new Map(
        entries.flatMap((entry): Array<[string, string[]]> => {
            const [id, items] = entry.split(':')
            return id && items ? [[id, items.split(';').filter(Boolean)]] : []
        })
    )
}

const toAxis = (
    names: readonly LayoutDimensionName[],
    items: Map<string, string[]>
): VisualizationDimension[] =>
    names.flatMap((name) => {
        const dimension = dimensionIdOf(name)
        const ids = items.get(dimension)
        return ids ? [{ dimension, items: ids.map((id) => ({ id })) }] : []
    })

const DEFAULT_LAYOUT: AnalyticsLayout = {
    Columns: ['Data'],
    Rows: ['Period'],
    Filter: ['Organisation unit'],
}

/** The visualization of a chart type and layout over the dimensions of analytics params. */
export const buildVisualization = (
    type: VisType,
    layout: AnalyticsLayout | undefined,
    params: AnalyticsParams | undefined
): Visualization => {
    const { Columns, Rows, Filter } = layout ?? DEFAULT_LAYOUT
    const items = itemsByDimension(params)
    return {
        type,
        columns: toAxis(Columns, items),
        rows: toAxis(Rows, items),
        filters: toAxis(Filter, items),
    }
}

/**
 * Converts a visual saved by the old builder into the visualization object the DHIS2
 * components consume. `undefined` for chart types the official app does not have.
 */
export const savedVisualToVisualization = (visual: SavedVisual): Visualization | undefined => {
    const type = visTypeFromChartType(visual.visualType)
    if (!type) return undefined
    return buildVisualization(type, visual.analyticsPayloadDeterminer, visual.query?.myData?.params)
}
