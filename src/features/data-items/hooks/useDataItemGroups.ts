import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery } from '@tanstack/react-query'
import { createInstanceClient, type InstanceConnection } from '@/shared/api'
import { fetchDataItemGroups } from '../services/dataItemService'
import type { DataItemTypeValue } from '../types/dataItem.types'
import { dataItemGroupsRequest } from '../utils/dataItemsRequest'
import { dataItemKeys } from './queryKeys'

/** Groups/programs of a type (empty for types without groups). */
export const useDataItemGroups = (
    instance: InstanceConnection | undefined,
    type: DataItemTypeValue
) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: dataItemKeys.groups(instance, type),
        queryFn:
            instance && dataItemGroupsRequest(type)
                ? ({ signal }) =>
                      fetchDataItemGroups(createInstanceClient(engine, instance), type, signal)
                : skipToken,
        staleTime: 10 * 60 * 1000,
    })
}
