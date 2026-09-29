import type { SavedMapEntry } from '@/features/maps'
import type { SavedVisualEntry } from '@/features/visualizers'
import type { UserRef } from '@/shared/types/common.types'
import type {
    DashboardMapItem,
    DashboardVisualItem,
    GridPosition,
    SavedDashboard,
} from '../types/dashboard.types'

const COLUMNS = 12
const SIZE = 3

/** Where the n-th new item goes: four 3×3 tiles per row. */
export const nextPosition = (count: number): Omit<GridPosition, 'i'> => ({
    x: (count * SIZE) % COLUMNS,
    y: Math.floor((count * SIZE) / COLUMNS) * SIZE,
    w: SIZE,
    h: SIZE,
})

/** A saved visualization as a dashboard item (its query and appearance are copied). */
export const toVisualItem = (entry: SavedVisualEntry, count: number): DashboardVisualItem => ({
    i: entry.key,
    ...nextPosition(count),
    visualName: entry.value.visualName,
    visualType: entry.value.visualType,
    visualQuery: entry.value.query,
    analyticsPayloadDeterminer: entry.value.analyticsPayloadDeterminer,
    visualSettings: entry.value.visualSettings,
    visualTitleAndSubTitle: entry.value.visualTitleAndSubTitle,
    dataSourceId: entry.value.dataSourceId,
})

/** A saved map as a dashboard item. */
export const toMapItem = (entry: SavedMapEntry, count: number): DashboardMapItem => ({
    i: entry.key,
    ...nextPosition(count),
    isMapItem: true,
    mapName: entry.value.mapName,
    mapType: entry.value.mapType,
    geoFeaturesQuery: entry.value.queries.geoFeaturesQuery,
    mapAnalyticsQueryOneQuery: entry.value.queries.mapAnalyticsQueryOne,
    mapAnalyticsQueryTwo: entry.value.queries.mapAnalyticsQueryTwo,
    BasemapType: entry.value.BasemapType,
    mapSettings: entry.value.mapSettings,
    dataSourceId: entry.value.dataSourceId,
})

/** Copies the positions of a react-grid-layout layout onto the items. */
export const withGridLayout = <T extends GridPosition>(
    items: readonly T[],
    layout: readonly GridPosition[]
): T[] =>
    items.map((item) => {
        const position = layout.find((l) => l.i === item.i)
        return position
            ? { ...item, x: position.x, y: position.y, w: position.w, h: position.h }
            : item
    })

/** Items in reading order (row by row), as shown when presenting. */
export const inReadingOrder = <T extends GridPosition>(items: readonly T[]): T[] =>
    [...items].sort((a, b) => a.y - b.y || a.x - b.x)

export interface DashboardDraft {
    name: string
    description: string
    isOfficial: boolean
    backgroundColor: string
    visuals: DashboardVisualItem[]
    maps: DashboardMapItem[]
}

/** The stored dashboard: the draft over the saved version (keeps sharing, favorites…). */
export const buildDashboard = (
    draft: DashboardDraft,
    saved: SavedDashboard | undefined,
    author: UserRef,
    now: number,
    previewImg: string | undefined
): SavedDashboard => ({
    ...saved,
    dashboardName: draft.name.trim(),
    dashboardDescription: draft.description,
    isOfficialDashboard: draft.isOfficial,
    dashboardSettings: { backgroundColor: draft.backgroundColor },
    selectedVisuals: draft.visuals,
    selectedMaps: draft.maps,
    previewImg: previewImg ?? saved?.previewImg,
    favorites: saved?.favorites ?? [],
    sharing: saved?.sharing ?? [],
    generalDashboardAccess: saved?.generalDashboardAccess ?? 'No access',
    createdBy: saved?.createdBy ?? author,
    createdAt: saved?.createdAt ?? now,
    updatedBy: author,
    updatedAt: now,
})
