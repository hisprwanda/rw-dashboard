import type { AnalyticsLayout, MetadataItem } from '@/features/analytics'
import type { AnalyticsMetaData, AnalyticsResponse } from '@/shared/types/dhis2.types'

export const CHART_TYPES = [
    'Column',
    'Stacked Col',
    'Bar',
    'Stacked Bar',
    'Line',
    'Area',
    'Scatter',
    'Radar',
    'Pie',
    'Radial',
    'Gauge',
    'Single Value',
    'Tree Map',
    'Table',
] as const

export type ChartType = (typeof CHART_TYPES)[number]

export interface ColorPalette {
    name: string
    itemsBackgroundColors: string[]
}

export interface AxisSettings {
    color: string
    fontSize: number
}

/** Appearance options edited in the visualizer's Settings tab. */
export interface VisualSettings {
    visualColorPalette: ColorPalette
    backgroundColor: string
    fillColor: string
    XAxisSettings: AxisSettings
    YAxisSettings: AxisSettings
}

/** Title, optional custom subtitle and the automatic subtitle (filter items). */
export interface VisualTitles {
    visualTitle?: string
    customSubTitle?: string
    DefaultSubTitle: {
        periods: MetadataItem[]
        orgUnits: MetadataItem[]
        dataElements: MetadataItem[]
    }
}

/** Props every chart receives. */
export interface ChartProps {
    data: AnalyticsResponse | null | undefined
    visualSettings: VisualSettings
    visualTitleAndSubTitle: VisualTitles
    metaDataLabels?: Partial<AnalyticsMetaData>
    analyticsPayloadDeterminer?: AnalyticsLayout
}

/** One category (x value) with a value per series: `{ period: 'Jan 2024', ANC 1: 12 }`. */
export type SeriesRow = { period: string } & Record<string, string | number | null>

/** Series name -> label and color, as consumed by the chart container. */
export type SeriesConfig = Record<string, { label: string; color: string }>

export interface Slice {
    name: string
    total: number
    fill: string
}

export interface TreeNode {
    name: string
    children: Array<{ name: string; size: number }>
}
