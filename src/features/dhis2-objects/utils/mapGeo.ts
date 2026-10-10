/** An org unit as `GET /api/geoFeatures` returns it (short property names). */
export interface GeoFeatureItem {
    id: string
    /** Name. */
    na: string
    /** Level. */
    le: number
    /** Coordinates, as a JSON string. */
    co: string
    /** Geometry type: 1 point, 2 polygon. */
    ty: number
    /** Parent graph (`/root/parent`). */
    pg?: string
    /** Parent id and name. */
    pi?: string
    pn?: string
    /** Org unit group per group set, when `includeGroupSets` is asked. */
    dimensions?: Record<string, string>
}

export interface MapFeatureProperties {
    id: string
    name: string
    level: number
    parentName?: string
    dimensions?: Record<string, string>
    [property: string]: unknown
}

/** A GeoJSON feature as the DHIS2 map engine draws it. */
export interface MapFeature {
    type: 'Feature'
    id: string
    geometry: { type: 'Point' | 'Polygon' | 'MultiPolygon'; coordinates: unknown }
    properties: MapFeatureProperties
}

const parseCoordinates = (raw: string): unknown => {
    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}

/**
 * Org units of `geoFeatures` as GeoJSON features, ordered by level (parents below
 * children), without those lacking coordinates. Ported from the DHIS2 Maps app
 * (`src/util/map.js`, BSD-2-Clause).
 */
export const toGeoJson = (items: readonly GeoFeatureItem[]): MapFeature[] =>
    [...items]
        .sort((a, b) => a.le - b.le)
        .flatMap((item): MapFeature[] => {
            const coordinates = parseCoordinates(item.co)
            if (!Array.isArray(coordinates) || coordinates.length === 0) return []
            const type =
                item.ty === 2 ? (item.co.startsWith('[[[[') ? 'MultiPolygon' : 'Polygon') : 'Point'
            return [
                {
                    type: 'Feature',
                    id: item.id,
                    geometry: { type, coordinates },
                    properties: {
                        type,
                        id: item.id,
                        name: item.na,
                        level: item.le,
                        parentName: item.pn,
                        dimensions: item.dimensions,
                    },
                },
            ]
        })

/** Only the point org units (facilities). */
export const pointItems = (items: readonly GeoFeatureItem[]) => items.filter(({ ty }) => ty === 1)
