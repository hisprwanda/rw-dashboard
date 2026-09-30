import type { SavedMapEntry } from '@/features/maps'
import type { SavedVisualEntry } from '@/features/visualizers'
import type { UserRef } from '@/shared/types/common.types'
import type { Dhis2ObjectSummary } from '@/features/dhis2-objects'
import type {
    DashboardDhis2Item,
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

/** Grid key of a DHIS2 favorite: the same favorite from two data sources are two items. */
export const dhis2ItemKey = (
    dataSourceId: string,
    summary: Pick<Dhis2ObjectSummary, 'objectType' | 'id'>
) => `${dataSourceId}_${summary.objectType}_${summary.id}`

/** A live link to a DHIS2 visualization or map. */
export const toDhis2Item = (
    summary: Dhis2ObjectSummary,
    dataSourceId: string,
    count: number
): DashboardDhis2Item => ({
    i: dhis2ItemKey(dataSourceId, summary),
    ...nextPosition(count),
    kind: 'dhis2',
    objectType: summary.objectType,
    objectId: summary.id,
    name: summary.name,
    subtype: summary.subtype,
    dataSourceId,
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
    dhis2Items: DashboardDhis2Item[]
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
    selectedDhis2Items: draft.dhis2Items,
    previewImg: previewImg ?? saved?.previewImg,
    favorites: saved?.favorites ?? [],
    sharing: saved?.sharing ?? [],
    generalDashboardAccess: saved?.generalDashboardAccess ?? 'No access',
    createdBy: saved?.createdBy ?? author,
    createdAt: saved?.createdAt ?? now,
    updatedBy: author,
    updatedAt: now,
})
