import { getAdaptedUiLayoutByType } from '@dhis2/analytics'
import { dimensionIdOf, type AnalyticsLayout, type LayoutDimensionName } from '@/features/analytics'
import type { VisType } from '../types/visualization.types'

const NAME_BY_ID: Record<string, LayoutDimensionName> = {
    dx: 'Data',
    pe: 'Period',
    ou: 'Organisation unit',
}

/**
 * The layout a chart type allows, by the official Data Visualizer's rules (for example one
 * dimension per axis for column charts, the rest going to the filter; a single series
 * dimension for pie charts).
 */
export const adaptLayoutToVisType = (layout: AnalyticsLayout, type: VisType): AnalyticsLayout => {
    const adapted = getAdaptedUiLayoutByType(
        {
            columns: layout.Columns.map(dimensionIdOf),
            rows: layout.Rows.map(dimensionIdOf),
            filters: layout.Filter.map(dimensionIdOf),
        },
        type
    )
    const names = (ids: string[]) => ids.map((id) => NAME_BY_ID[id] ?? id)
    return {
        Columns: names(adapted.columns),
        Rows: names(adapted.rows),
        Filter: names(adapted.filters),
    }
}
