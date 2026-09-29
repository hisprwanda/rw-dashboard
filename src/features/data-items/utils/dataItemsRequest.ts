import { PAGE_SIZE } from '../constants/dataItemTypes'
import type { DataItemTypeValue, DataItemsFilters } from '../types/dataItem.types'

export interface ResourceRequest {
    resource: string
    /** Key of the list in the response (`{ pager, <listKey>: [...] }`). */
    listKey: string
    params: Record<string, string | number | boolean | string[]>
}

const FIELDS = 'id,displayName~rename(name),dimensionItemType,expression'

const byDimensionItemType: Partial<Record<DataItemTypeValue, string>> = {
    'Event Data Item': 'dimensionItemType:in:[PROGRAM_DATA_ELEMENT,PROGRAM_ATTRIBUTE]',
    'Program Indicator': 'dimensionItemType:eq:PROGRAM_INDICATOR',
    Calculation: 'dimensionItemType:eq:EXPRESSION_DIMENSION_ITEM',
}

/**
 * One page of selectable data items, the same request for the current and external
 * instances (search and group filters apply to every type that supports them).
 */
export const dataItemsRequest = (filters: DataItemsFilters, page: number): ResourceRequest => {
    const { type, search, groupId, disaggregation } = filters
    const filter: string[] = search ? [`displayName:ilike:${search}`] : []
    const paging = {
        fields: FIELDS,
        order: 'displayName:asc',
        pageSize: PAGE_SIZE,
        page,
        paging: true,
    }
    const request = (resource: string, extra: string[] = []): ResourceRequest => ({
        resource,
        listKey: resource,
        params: { ...paging, filter: [...filter, ...extra] },
    })

    switch (type) {
        case 'indicators':
            return request('indicators', groupId ? [`indicatorGroups.id:eq:${groupId}`] : [])
        case 'dataElements':
            // Operands (details) do not support these filters in the API.
            return disaggregation === 'details'
                ? {
                      resource: 'dataElementOperands',
                      listKey: 'dataElementOperands',
                      params: paging,
                  }
                : request('dataElements', [
                      'domainType:eq:AGGREGATE',
                      ...(groupId ? [`dataElementGroups.id:eq:${groupId}`] : []),
                  ])
        case 'dataSets':
            return request('dataSets')
        case 'Event Data Item':
        case 'Program Indicator':
            return request('dataItems', [
                byDimensionItemType[type] ?? '',
                ...(groupId ? [`programId:eq:${groupId}`] : []),
            ])
        case 'Calculation':
            return request('dataItems', [byDimensionItemType.Calculation ?? ''])
        default:
            return request('dataItems')
    }
}

/** Groups (or programs) that narrow a type's items; `null` when the type has none. */
export const dataItemGroupsRequest = (type: DataItemTypeValue): ResourceRequest | null => {
    const resource =
        type === 'indicators'
            ? 'indicatorGroups'
            : type === 'dataElements'
              ? 'dataElementGroups'
              : type === 'Event Data Item' || type === 'Program Indicator'
                ? 'programs'
                : null
    return resource
        ? {
              resource,
              listKey: resource,
              params: {
                  fields: 'id,displayName~rename(name)',
                  order: 'displayName:asc',
                  paging: false,
              },
          }
        : null
}
