import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { visualService } from '../services/visualService'
import type { SavedVisual } from '../types/visual.types'
import { visualKeys } from './queryKeys'

interface SaveVisualInput {
    /** Existing key when updating. */
    key?: string
    visual: SavedVisual
}

export const useSaveVisual = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: async ({ key, visual }: SaveVisualInput) => {
            if (key) await visualService.update(engine, key, visual)
            else await visualService.create(engine, visual.id, visual)
            return key ?? visual.id
        },
        onSuccess: (key) => {
            notify.success(i18n.t('Visualization saved'))
            // The open builder already shows the saved state: mark the detail stale for
            // the next visit instead of refetching it now.
            void queryClient.invalidateQueries({
                queryKey: visualKeys.detail(key),
                refetchType: 'none',
            })
            return queryClient.invalidateQueries({ queryKey: visualKeys.list() })
        },
        onError: () => notify.error(i18n.t('Could not save the visualization. Please try again.')),
    })
}
