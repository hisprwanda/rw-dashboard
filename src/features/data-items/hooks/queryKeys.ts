import { instanceKey, type InstanceConnection } from '@/shared/api'
import type { DataItemsFilters, DataItemTypeValue } from '../types/dataItem.types'

export const dataItemKeys = {
    all: ['dataItems'] as const,
    list: (instance: InstanceConnection | undefined, filters: DataItemsFilters) =>
        [...dataItemKeys.all, 'list', instanceKey(instance), filters] as const,
    groups: (instance: InstanceConnection | undefined, type: DataItemTypeValue) =>
        [...dataItemKeys.all, 'groups', instanceKey(instance), type] as const,
}
