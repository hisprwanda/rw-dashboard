import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { createInstanceClient, type InstanceConnection } from '@/shared/api'
import { fetchDataItemsPage } from '../services/dataItemService'
import type { DataItemsFilters } from '../types/dataItem.types'
import { dataItemKeys } from './queryKeys'

/** Pages of selectable data items; `fetchNextPage` appends the next page (infinite scroll). */
export const useDataItems = (
    instance: InstanceConnection | undefined,
    filters: DataItemsFilters
) => {
    const engine = useDataEngine()
    const query = useInfiniteQuery({
        queryKey: dataItemKeys.list(instance, filters),
        queryFn: instance
            ? ({ pageParam, signal }) =>
                  fetchDataItemsPage(
                      createInstanceClient(engine, instance),
                      filters,
                      pageParam,
                      signal
                  )
            : skipToken,
        initialPageParam: 1,
        getNextPageParam: (last) => (last.page < last.pageCount ? last.page + 1 : undefined),
    })
    const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data])
    return { ...query, items }
}
