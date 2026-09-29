import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import type { SavedDashboardEntry } from '../types/dashboard.types'
import { dashboardKeys } from './queryKeys'

const byLastUpdate = (a: SavedDashboardEntry, b: SavedDashboardEntry) =>
    (b.value.updatedAt ?? 0) - (a.value.updatedAt ?? 0)

/** All saved dashboards, most recently updated first. */
export const useDashboards = () => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: dashboardKeys.list(),
        queryFn: async ({ signal }) =>
            (await dashboardService.list(engine, signal)).sort(byLastUpdate),
    })
}
