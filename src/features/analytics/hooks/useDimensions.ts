import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { createInstanceClient, type InstanceConnection } from '@/shared/api'
import { fetchDimensionItems, fetchDimensions } from '../services/dimensionsService'
import { dimensionKeys } from './queryKeys'

/** The dynamic dimensions (categories, group sets…) of the data source. */
export const useDimensions = (instance: InstanceConnection | undefined) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: dimensionKeys.list(instance),
        queryFn: ({ signal }) => fetchDimensions(createInstanceClient(engine, instance), signal),
        staleTime: Infinity,
    })
}

/** The items of one dynamic dimension; waits while no dimension is open. */
export const useDimensionItems = (
    instance: InstanceConnection | undefined,
    dimensionId: string | undefined
) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: dimensionKeys.items(instance, dimensionId ?? ''),
        queryFn: ({ signal }) =>
            fetchDimensionItems(createInstanceClient(engine, instance), dimensionId ?? '', signal),
        enabled: !!dimensionId,
        staleTime: Infinity,
    })
}
