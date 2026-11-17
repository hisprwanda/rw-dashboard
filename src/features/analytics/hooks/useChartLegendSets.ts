import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { createInstanceClient, type InstanceConnection } from '@/shared/api'
import { fetchChartLegendSets } from '../services/legendSetsService'
import { legendSetKeys } from './queryKeys'

/** The legend sets (with their classes) of the data source, for coloring charts by value. */
export const useChartLegendSets = (instance: InstanceConnection | undefined) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: legendSetKeys.list(instance),
        queryFn: ({ signal }) =>
            fetchChartLegendSets(createInstanceClient(engine, instance), signal),
        staleTime: Infinity,
    })
}
