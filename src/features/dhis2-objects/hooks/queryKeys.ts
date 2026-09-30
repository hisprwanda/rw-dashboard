import { instanceKey, type InstanceConnection } from '@/shared/api'
import type { Dhis2ObjectType } from '../types/dhis2Object.types'

export const dhis2ObjectKeys = {
    all: ['dhis2Objects'] as const,
    search: (
        instance: InstanceConnection | undefined,
        objectType: Dhis2ObjectType,
        query: string,
        page: number
    ) =>
        [...dhis2ObjectKeys.all, instanceKey(instance), 'search', objectType, query, page] as const,
    detail: (instance: InstanceConnection | undefined, objectType: Dhis2ObjectType, id: string) =>
        [...dhis2ObjectKeys.all, instanceKey(instance), objectType, id] as const,
    image: (instance: InstanceConnection | undefined, objectType: Dhis2ObjectType, id: string) =>
        [...dhis2ObjectKeys.all, instanceKey(instance), objectType, id, 'image'] as const,
    apps: () => [...dhis2ObjectKeys.all, 'current', 'apps'] as const,
}
