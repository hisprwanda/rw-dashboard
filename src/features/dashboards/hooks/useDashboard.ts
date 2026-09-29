import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import { dashboardKeys } from './queryKeys'

/** One saved dashboard; idle while `id` is undefined (new dashboard). */
export const useDashboard = (id: string | undefined) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: dashboardKeys.detail(id ?? ''),
        queryFn: id ? ({ signal }) => dashboardService.get(engine, id, signal) : skipToken,
    })
}
