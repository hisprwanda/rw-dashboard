import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { dashboardService } from '../services/dashboardService'
import { dashboardKeys } from './queryKeys'

export const useDeleteDashboard = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: (key: string) => dashboardService.remove(engine, key),
        onSuccess: () => {
            notify.success(i18n.t('Dashboard deleted'))
            return queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
        },
        onError: () => notify.error(i18n.t('Could not delete the dashboard. Please try again.')),
    })
}
