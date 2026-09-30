import { isCreatedBy, isSharedWith } from '@/shared/utils/sharing'
import type { SavedDashboardEntry } from '../types/dashboard.types'

export const isFavoriteOf = (entry: SavedDashboardEntry, userId: string | undefined) =>
    !!userId && (entry.value.favorites ?? []).includes(userId)

/** Favorites first, then by name. Never mutates its input. */
export const sortByFavorite = (
    entries: readonly SavedDashboardEntry[],
    userId: string | undefined
): SavedDashboardEntry[] =>
    [...entries].sort(
        (a, b) =>
            Number(isFavoriteOf(b, userId)) - Number(isFavoriteOf(a, userId)) ||
            (a.value.dashboardName ?? '').localeCompare(b.value.dashboardName ?? '')
    )

/** Official dashboards the user can see (own or shared with them). */
export const isPinnedFor = (
    entry: SavedDashboardEntry,
    userId: string | undefined,
    groupIds: readonly string[]
) =>
    !!entry.value.isOfficialDashboard &&
    (isCreatedBy(entry.value, userId) || isSharedWith(entry.value, userId, groupIds))

/** Toggles a user in a favorites list. */
export const toggleFavorite = (favorites: readonly string[] | undefined, userId: string) =>
    (favorites ?? []).includes(userId)
        ? (favorites ?? []).filter((id) => id !== userId)
        : [...(favorites ?? []), userId]
