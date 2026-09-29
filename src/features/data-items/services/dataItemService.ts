import type { InstanceClient } from '@/shared/api'
import type { Pager } from '@/shared/types/dhis2.types'
import type { DataItem, DataItemsFilters, DataItemsPage } from '../types/dataItem.types'
import { dataItemGroupsRequest, dataItemsRequest } from '../utils/dataItemsRequest'

type ListResponse = { pager?: Pager } & Record<string, DataItem[] | Pager | undefined>

export const fetchDataItemsPage = async (
    client: InstanceClient,
    filters: DataItemsFilters,
    page: number,
    signal?: AbortSignal
): Promise<DataItemsPage> => {
    const request = dataItemsRequest(filters, page)
    const response = await client.get<ListResponse>(request.resource, request.params, signal)
    const items = response[request.listKey]
    return {
        items: Array.isArray(items) ? items : [],
        page: response.pager?.page ?? page,
        pageCount: response.pager?.pageCount ?? page,
    }
}

export const fetchDataItemGroups = async (
    client: InstanceClient,
    type: DataItemsFilters['type'],
    signal?: AbortSignal
): Promise<DataItem[]> => {
    const request = dataItemGroupsRequest(type)
    if (!request) return []
    const response = await client.get<ListResponse>(request.resource, request.params, signal)
    const groups = response[request.listKey]
    return Array.isArray(groups) ? groups : []
}
