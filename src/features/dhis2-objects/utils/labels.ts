import i18n from '@dhis2/d2-i18n'
import { chartTypeLabel } from '@/features/charts'
import type { Dhis2ObjectSummary } from '../types/dhis2Object.types'
import { dhis2ChartType } from './favoriteRequest'

/** Display name of a Data Visualizer type. */
export const visualizationTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        PIVOT_TABLE: i18n.t('Pivot table'),
        YEAR_OVER_YEAR_LINE: i18n.t('Year over year (line)'),
        YEAR_OVER_YEAR_COLUMN: i18n.t('Year over year (column)'),
        STACKED_AREA: i18n.t('Stacked area'),
        BUBBLE: i18n.t('Bubble'),
        OUTLIER_TABLE: i18n.t('Outlier table'),
    }
    const chartType = dhis2ChartType(type)
    return labels[type] ?? (chartType ? chartTypeLabel(chartType) : type)
}

/** Display name of a map layer kind. */
export const layerKindLabel = (kind: string): string => {
    const labels: Record<string, string> = {
        thematic: i18n.t('Thematic'),
        event: i18n.t('Events'),
        trackedEntity: i18n.t('Tracked entities'),
        facility: i18n.t('Facilities'),
        boundary: i18n.t('Boundaries'),
        orgUnit: i18n.t('Org units'),
        earthEngine: i18n.t('Earth Engine'),
        external: i18n.t('External layer'),
        geoJsonUrl: i18n.t('GeoJSON layer'),
    }
    return labels[kind] ?? kind
}

/** What kind of favorite a search result is: "Pivot table", "Thematic, Events"… */
export const summaryTypeLabel = (summary: Pick<Dhis2ObjectSummary, 'objectType' | 'subtype'>) =>
    summary.objectType === 'map'
        ? summary.subtype.split(',').filter(Boolean).map(layerKindLabel).join(', ') || i18n.t('Map')
        : visualizationTypeLabel(summary.subtype)
