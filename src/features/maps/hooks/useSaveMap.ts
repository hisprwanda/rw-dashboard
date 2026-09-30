import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { mapService } from '../services/mapService'
import type { SavedMap } from '../types/map.types'
import { mapKeys } from './queryKeys'

interface SaveMapInput {
    /** Existing key when updating. */
    key?: string
    map: SavedMap
}

export const useSaveMap = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: async ({ key, map }: SaveMapInput) => {
            if (key) await mapService.update(engine, key, map)
            else await mapService.create(engine, map.id, map)
            return key ?? map.id
        },
        onSuccess: (key) => {
            notify.success(i18n.t('Map saved'))
            // The open builder already shows the saved state.
            void queryClient.invalidateQueries({
                queryKey: mapKeys.detail(key),
                refetchType: 'none',
            })
            return queryClient.invalidateQueries({ queryKey: mapKeys.list() })
        },
        onError: () => notify.error(i18n.t('Could not save the map. Please try again.')),
    })
}
