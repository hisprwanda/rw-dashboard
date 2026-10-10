import type { LegendItem } from './mapClassify'

/** One entry of a map legend, ready to show. */
export interface MapLegendEntry {
    name?: string
    /** `0 – 25`, for classes with a range. */
    range?: string
    color?: string
    /** A symbol image (facility layers styled by group set symbols). */
    image?: string
    /** Line weight (org unit levels) or point radius (facilities). */
    weight?: number
    radius?: number
    /** Number of features in the class. */
    count?: number
}

/** The legend of one map layer, as the DHIS2 Maps app shows it. */
export interface MapLegend {
    title: string
    period?: string
    /** Group set or other unit the entries refer to. */
    unit?: string
    entries: MapLegendEntry[]
    /** Other filters of the layer, e.g. "Age: Under 5". */
    filters?: string[]
    bubbles?: { radiusLow: number; radiusHigh: number; minValue: number; maxValue: number }
}

/** `0 – 25`, formatted with the given number format. */
export const formatRange = (item: LegendItem, format: (value: number) => string) =>
    item.startValue === undefined || item.endValue === undefined
        ? undefined
        : `${format(item.startValue)} – ${format(item.endValue)}`
