import { instanceKey, type InstanceConnection } from '@/shared/api'
import type { AnalyticsParams } from '../types/analytics.types'

export const dimensionKeys = {
    all: ['dimensions'] as const,
    list: (instance: InstanceConnection | undefined) =>
        [...dimensionKeys.all, instanceKey(instance)] as const,
    items: (instance: InstanceConnection | undefined, dimensionId: string) =>
        [...dimensionKeys.all, instanceKey(instance), dimensionId, 'items'] as const,
}

export const legendSetKeys = {
    list: (instance: InstanceConnection | undefined) =>
        ['legend-sets', instanceKey(instance)] as const,
}

export const analyticsKeys = {
    all: ['analytics'] as const,
    request: (instance: InstanceConnection | undefined, params: AnalyticsParams | undefined) =>
        [...analyticsKeys.all, instanceKey(instance), params ?? null] as const,
}
