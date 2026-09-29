import type { DataItemRef, StoredAnalyticsQuery } from '@/features/analytics'
import type { ChartType, VisualSettings, VisualTitles } from '@/features/charts'
import type { Shareable, UserRef } from '@/shared/types/common.types'
import type { DataStoreEntry } from '@/shared/types/dhis2.types'

export type BasemapType = 'osm-light' | 'osm-detailed'
export type MapType = 'Thematic'
export type LegendType = 'auto' | 'dhis2'

/** Labels and legend of a thematic map (typed in detail with the map builder). */
export interface MapSettings {
    appliedLabels: unknown
    selectedLabels: unknown
    legend: unknown
    legendType: LegendType
}

/** The `geoFeatures` request saved with a map. */
export interface StoredGeoFeaturesQuery {
    result: { resource: 'geoFeatures'; params: { ou: string; displayProperty?: string } }
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
