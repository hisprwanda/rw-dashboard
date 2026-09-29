import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { dashboardService } from '../services/dashboardService'
import type { SavedDashboard, SavedDashboardEntry } from '../types/dashboard.types'
import { dashboardKeys } from './queryKeys'

interface UpdateDashboardInput {
    key: string
    /** Builds the new value from the latest stored one (avoids overwriting other edits). */
    update: (current: SavedDashboard) => SavedDashboard
    /** Alert shown on success; none when omitted. */
    successMessage?: string
}

/**
 * Read-modify-write of one dashboard (sharing, favorites…). The list and the detail are
 * updated in the cache right away, then refreshed from the server.
 */
export const useUpdateDashboard = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: async ({ key, update }: UpdateDashboardInput) => {
            const next = update(await dashboardService.get(engine, key))
            await dashboardService.update(engine, key, next)
            return { key, value: next }
        },
        onSuccess: ({ key, value }, { successMessage }) => {
            queryClient.setQueryData(dashboardKeys.detail(key), value)
            queryClient.setQueryData<SavedDashboardEntry[]>(dashboardKeys.list(), (list) =>
                list?.map((entry) => (entry.key === key ? { key, value } : entry))
            )
            if (successMessage) notify.success(successMessage)
            return queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
        },
        onError: () => notify.error(i18n.t('Could not update the dashboard. Please try again.')),
    })
}
