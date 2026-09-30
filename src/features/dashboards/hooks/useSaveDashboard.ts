import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMe } from '@/features/auth'
import { useNotify } from '@/shared/hooks'
import { generateUid } from '@/shared/utils/uid'
import { dashboardService } from '../services/dashboardService'
import type { SavedDashboard } from '../types/dashboard.types'
import { capturePreview } from '../utils/capture'
import { buildDashboard, type DashboardDraft } from '../utils/dashboardItems'
import { dashboardKeys } from './queryKeys'

interface SaveDashboardInput {
    /** Existing key when updating. */
    key?: string
    draft: DashboardDraft
    saved?: SavedDashboard
    /** The grid, captured as the preview image. */
    previewElement?: HTMLElement | null
}

export const useSaveDashboard = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    const { data: me } = useMe()
    return useMutation({
        mutationFn: async ({ key, draft, saved, previewElement }: SaveDashboardInput) => {
            if (!me) throw new Error('The current user is not loaded yet.')
            // A failed screenshot must not block saving.
            const preview = previewElement
                ? await capturePreview(previewElement).catch(() => undefined)
                : undefined
            const author = { id: me.id, name: me.displayName ?? me.name ?? '' }
            const dashboard = buildDashboard(draft, saved, author, Date.now(), preview)
            const id = key ?? generateUid()
            if (key) await dashboardService.update(engine, key, dashboard)
            else await dashboardService.create(engine, id, dashboard)
            return { key: id, dashboard }
        },
        onSuccess: ({ key, dashboard }) => {
            notify.success(i18n.t('Dashboard saved'))
            queryClient.setQueryData(dashboardKeys.detail(key), dashboard)
            return queryClient.invalidateQueries({ queryKey: dashboardKeys.list() })
        },
        onError: () => notify.error(i18n.t('Could not save the dashboard. Please try again.')),
    })
}
