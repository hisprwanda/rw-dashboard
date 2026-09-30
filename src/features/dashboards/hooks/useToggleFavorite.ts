import { useMe } from '@/features/auth'
import { toggleFavorite } from '../utils/dashboardLists'
import { useUpdateDashboard } from './useUpdateDashboard'

/** Stars or un-stars a dashboard for the current user. */
export const useToggleFavorite = () => {
    const { data: me } = useMe()
    const update = useUpdateDashboard()
    return {
        toggle: (key: string) => {
            if (!me) return
            update.mutate({
                key,
                update: (current) => ({
                    ...current,
                    favorites: toggleFavorite(current.favorites, me.id),
                }),
            })
        },
        pendingKey: update.isPending ? update.variables?.key : undefined,
    }
}
