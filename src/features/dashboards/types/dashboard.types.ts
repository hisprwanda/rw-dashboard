import type { AnalyticsLayout, StoredAnalyticsQuery } from '@/features/analytics'
import type { VisualSettings, VisualTitles } from '@/features/charts'
import type { Dhis2ObjectType } from '@/features/dhis2-objects'
import type { BasemapType, MapSettings, StoredGeoFeaturesQuery } from '@/features/maps'
import type { Shareable, UserRef } from '@/shared/types/common.types'
import type { DataStoreEntry } from '@/shared/types/dhis2.types'

/** Position of an item in the react-grid-layout grid. */
export interface GridPosition {
    /** Item id (the saved visual/map key). */
    i: string
    x: number
    y: number
    w: number
    h: number
}

/** A visualization copied into a dashboard (the query is stored with the item). */
export interface DashboardVisualItem extends GridPosition {
    visualName: string
    visualType: string
    visualQuery: StoredAnalyticsQuery
    analyticsPayloadDeterminer: AnalyticsLayout
    dataSourceId: string
    visualTitleAndSubTitle: VisualTitles
    visualSettings: VisualSettings
}

/** A map copied into a dashboard. */
export interface DashboardMapItem extends GridPosition {
    isMapItem: true
    mapName: string
    mapType: string
    geoFeaturesQuery: StoredGeoFeaturesQuery
    mapAnalyticsQueryOneQuery: StoredAnalyticsQuery
    mapAnalyticsQueryTwo?: StoredAnalyticsQuery
    BasemapType?: BasemapType
    mapSettings?: Partial<MapSettings>
    dataSourceId: string
}

/**
 * A live link to a visualization or map made in DHIS2 (Data Visualizer, Maps). Only the
 * reference is stored: the favorite is read on every view, so edits made in DHIS2 show.
 */
export interface DashboardDhis2Item extends GridPosition {
    kind: 'dhis2'
    objectType: Dhis2ObjectType
    /** DHIS2 uid of the favorite. */
    objectId: string
    /** Name when added (shown as the title, also if the favorite disappears). */
    name: string
    /** `PIVOT_TABLE`, `COLUMN`… or the map's layer kinds. */
    subtype: string
    dataSourceId: string
}

/** A dashboard as stored in the dashboards dataStore namespace. */
export type SavedDashboard = Shareable & {
    dashboardName: string
    dashboardDescription?: string
    createdBy: UserRef
    updatedBy: UserRef
    createdAt: number
    updatedAt: number
    selectedVisuals: DashboardVisualItem[]
    selectedMaps?: DashboardMapItem[]
    /** Live DHIS2 visualizations and maps (absent on older dashboards). */
    selectedDhis2Items?: DashboardDhis2Item[]
    /** Base64 screenshot shown on cards. */
    previewImg?: string
    /** Official dashboards are pinned on the home page. */
    isOfficialDashboard?: boolean
    /** Ids of the users who starred the dashboard. */
    favorites?: string[]
    dashboardSettings?: { backgroundColor: string }
}

export type SavedDashboardEntry = DataStoreEntry<SavedDashboard>
