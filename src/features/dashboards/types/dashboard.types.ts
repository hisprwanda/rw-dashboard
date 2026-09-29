import type { AnalyticsLayout, StoredAnalyticsQuery } from '@/features/analytics'
import type { VisualSettings, VisualTitles } from '@/features/charts'
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

export type AccessLevel = 'View only' | 'View and edit'
export type GeneralAccess = 'No access' | AccessLevel

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
    /** Base64 screenshot shown on cards. */
    previewImg?: string
    /** Official dashboards are pinned on the home page. */
    isOfficialDashboard?: boolean
    /** Ids of the users who starred the dashboard. */
    favorites?: string[]
    dashboardSettings?: { backgroundColor: string }
}

export type SavedDashboardEntry = DataStoreEntry<SavedDashboard>

/** A user or user group found by `GET /api/sharing/search`. */
export interface SharingCandidate {
    id: string
    name: string
    type: 'User' | 'Group'
}
