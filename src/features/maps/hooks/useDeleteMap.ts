import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { mapService } from '../services/mapService'
import { mapKeys } from './queryKeys'

export const useDeleteMap = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: (key: string) => mapService.remove(engine, key),
        onSuccess: () => {
            notify.success(i18n.t('Map deleted'))
            return queryClient.invalidateQueries({ queryKey: mapKeys.all })
        },
        onError: () => notify.error(i18n.t('Could not delete the map. Please try again.')),
    })
}
