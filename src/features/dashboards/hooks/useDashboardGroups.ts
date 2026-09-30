import { useMemo } from 'react'
import { useMe } from '@/features/auth'
import { isCreatedBy, isSharedWith } from '@/shared/utils/sharing'
import { isPinnedFor, sortByFavorite } from '../utils/dashboardLists'
import { useDashboards } from './useDashboards'

/** The dashboards list split for the current user: own, shared with them and pinned. */
export const useDashboardGroups = () => {
    const { data: me } = useMe()
    const query = useDashboards()
    const groups = useMemo(() => {
        const entries = query.data ?? []
        const userId = me?.id
        const groupIds = me?.userGroups?.map((group) => group.id) ?? []
        return {
            mine: sortByFavorite(
                entries.filter((e) => isCreatedBy(e.value, userId)),
                userId
            ),
            shared: sortByFavorite(
                entries.filter((e) => isSharedWith(e.value, userId, groupIds)),
                userId
            ),
            pinned: entries.filter((e) => isPinnedFor(e, userId, groupIds)),
        }
    }, [query.data, me])
    return { ...groups, userId: me?.id, query }
}
