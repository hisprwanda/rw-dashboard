import { instanceKey, type InstanceConnection } from '@/shared/api'
import type { AnalyticsParams } from '../types/analytics.types'

export const analyticsKeys = {
    all: ['analytics'] as const,
    request: (instance: InstanceConnection | undefined, params: AnalyticsParams | undefined) =>
        [...analyticsKeys.all, instanceKey(instance), params ?? null] as const,
}
