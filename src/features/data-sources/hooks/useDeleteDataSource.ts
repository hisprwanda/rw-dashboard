import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { dataSourceService } from '../services/dataSourceService'
import { dataSourceKeys } from './queryKeys'

export const useDeleteDataSource = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: (key: string) => dataSourceService.remove(engine, key),
        onSuccess: () => {
            notify.success(i18n.t('Data source deleted'))
            return queryClient.invalidateQueries({ queryKey: dataSourceKeys.all })
        },
        onError: () => notify.error(i18n.t('Could not delete the data source. Please try again.')),
    })
}
