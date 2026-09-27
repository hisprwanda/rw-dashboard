import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { visualService } from '../services/visualService'
import { visualKeys } from './queryKeys'

export const useDeleteVisual = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: (key: string) => visualService.remove(engine, key),
        onSuccess: () => {
            notify.success(i18n.t('Visualization deleted'))
            return queryClient.invalidateQueries({ queryKey: visualKeys.all })
        },
        onError: () =>
            notify.error(i18n.t('Could not delete the visualization. Please try again.')),
    })
}
