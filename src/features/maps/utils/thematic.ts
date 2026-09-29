import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { AUTO_LEGEND_COLORS, NO_DATA_COLOR } from '../constants/legend'
import type { GeoFeature, LegendClass } from '../types/map.types'

export interface ThematicProperties {
    id: string
    name: string
    value: number | null
}

export type ThematicFeature = Feature<Polygon | MultiPolygon, ThematicProperties>
export type ThematicCollection = FeatureCollection<Polygon | MultiPolygon, ThematicProperties>

/** Half the side of the square drawn for point features (~500 m at the equator). */
const POINT_HALF_SIDE = 0.005

const depth = (value: unknown): number =>
    Array.isArray(value) ? 1 + (value.length ? depth(value[0]) : 0) : 0

const square = ([lon, lat]: Position): Polygon['coordinates'] => {
    const d = POINT_HALF_SIDE
    return [
        [
            [lon - d, lat - d],
            [lon + d, lat - d],
            [lon + d, lat + d],
            [lon - d, lat + d],
            [lon - d, lat - d],
        ],
    ]
}

/**
 * The geometry of a geoFeature (`co` is a JSON string). Points become small squares so
 * every feature can be filled. `null` for unreadable coordinates.
 */
export const toGeometry = (feature: Pick<GeoFeature, 'co'>): Polygon | MultiPolygon | null => {
    let coordinates: unknown
    try {
        coordinates = JSON.parse(feature.co)
    } catch {
        return null
    }
    switch (depth(coordinates)) {
        case 1:
            return { type: 'Polygon', coordinates: square(coordinates as Position) }
        case 2:
            return { type: 'Polygon', coordinates: [coordinates as Position[]] }
        case 3:
            return { type: 'Polygon', coordinates: coordinates as Polygon['coordinates'] }
        case 4:
            return { type: 'MultiPolygon', coordinates: coordinates as MultiPolygon['coordinates'] }
        default:
            return null
    }
}

/**
 * Value per org unit id from an analytics response with `ou` as a dimension. With several
 * data items, the first one is mapped.
 */
export const valuesByOrgUnit = (response: AnalyticsResponse | undefined): Map<string, number> => {
    const values = new Map<string, number>()
    if (!response?.rows?.length) return values
    const column = (name: string) => response.headers.findIndex((h) => h.name === name)
    const [dx, ou, value] = [column('dx'), column('ou'), column('value')]
    if (ou < 0 || value < 0) return values
    const firstItem = dx >= 0 ? response.rows[0]?.[dx] : undefined
    for (const row of response.rows) {
        if (dx >= 0 && row[dx] !== firstItem) continue
        const id = row[ou]
        const number = Number(row[value])
        if (id && Number.isFinite(number)) values.set(id, number)
    }
    return values
}

/** GeoJSON of the org units, each carrying its value (or null). */
export const toFeatureCollection = (
    features: readonly GeoFeature[],
    values: ReadonlyMap<string, number>
): ThematicCollection => ({
    type: 'FeatureCollection',
    features: features.flatMap((feature): ThematicFeature[] => {
        const geometry = toGeometry(feature)
        if (!geometry) return []
        return [
            {
                type: 'Feature',
                geometry,
                properties: {
                    id: feature.id,
                    name: feature.na,
                    value: values.get(feature.id) ?? null,
                },
            },
        ]
    }),
})

/** Five equal-interval classes between the lowest and highest value. */
export const buildAutoLegend = (
    values: readonly number[],
    names: readonly string[]
): LegendClass[] => {
    if (!values.length) return []
    const min = Math.min(...values)
    const max = Math.max(...values)
    const step = (max - min) / AUTO_LEGEND_COLORS.length
    return AUTO_LEGEND_COLORS.map((color, index) => ({
        name: names[index] ?? String(index + 1),
        startValue: min + index * step,
        endValue: index === AUTO_LEGEND_COLORS.length - 1 ? max : min + (index + 1) * step,
        color,
    }))
}

export const colorForValue = (value: number | null, classes: readonly LegendClass[]): string => {
    if (value === null) return NO_DATA_COLOR
    return classes.find((c) => value >= c.startValue && value <= c.endValue)?.color ?? NO_DATA_COLOR
}

const ESCAPES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}

/** Leaflet popups and labels take HTML: names from the server are escaped. */
export const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c)
