import type { DataItemRef, StoredAnalyticsQuery } from '@/features/analytics'
import type { ChartType, VisualSettings, VisualTitles } from '@/features/charts'
import type { Shareable, UserRef } from '@/shared/types/common.types'
import type { DataStoreEntry } from '@/shared/types/dhis2.types'

export type BasemapType = 'osm-light' | 'osm-detailed'
export type MapType = 'Thematic'
export type LegendType = 'auto' | 'dhis2'

/** What a thematic map can print on each area. */
export type MapLabelKind = 'area' | 'data' | 'period' | 'value'

export interface LegendClass {
    name: string
    startValue: number
    endValue: number
    color: string
}

export interface MapLegendSet {
    name: string
    legends: LegendClass[]
}

/** Labels and legend of a thematic map. */
export interface MapSettings {
    /** Labels shown on the map (kept equal to `selectedLabels`, both are saved). */
    appliedLabels: MapLabelKind[]
    selectedLabels: MapLabelKind[]
    /** The DHIS2 legend set used when `legendType` is `dhis2` (`{}` when none). */
    legend: Partial<MapLegendSet>
    legendType: LegendType
}

/** One org unit boundary of `GET /api/geoFeatures`. */
export interface GeoFeature {
    id: string
    /** Name. */
    na: string
    /** Coordinates as a JSON string (point, polygon or multipolygon). */
    co: string
    /** Geometry type: 1 point, 2 polygon, 3 multipolygon. */
    ty: number
    code?: string
    /** Parent name. */
    pn?: string
    le?: number
}

export type GeoFeaturesParams = { ou: string; displayProperty?: 'NAME' | 'SHORTNAME' }

/** The `geoFeatures` request saved with a map. */
export interface StoredGeoFeaturesQuery {
    result: { resource: 'geoFeatures'; params: GeoFeaturesParams }
}

/** A map as stored in the maps dataStore namespace. */
export type SavedMap = Shareable & {
    id: string
    mapName: string
    mapType: MapType
    description?: string
    dataSourceId: string
    queries: {
        /** Analytics data (periods on the filter, org units as a dimension). */
        mapAnalyticsQueryOne: StoredAnalyticsQuery
        /** Analytics metadata (names). */
        mapAnalyticsQueryTwo: StoredAnalyticsQuery
        geoFeaturesQuery: StoredGeoFeaturesQuery
    }
    visualType?: ChartType
    visualTitleAndSubTitle?: VisualTitles
    visualSettings?: VisualSettings
    organizationTree?: string[]
    selectedOrgUnitLevel?: number[]
    backedSelectedItems?: DataItemRef[]
    BasemapType?: BasemapType
    mapSettings?: MapSettings
    createdBy: UserRef
    updatedBy: UserRef
    createdAt: number
    updatedAt: number
}

export type SavedMapEntry = DataStoreEntry<SavedMap>
