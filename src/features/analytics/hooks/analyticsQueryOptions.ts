import { queryOptions } from '@tanstack/react-query'
import { createInstanceClient, type DataEngine, type InstanceConnection } from '@/shared/api'
import { fetchAnalytics } from '../services/analyticsService'
import type { AnalyticsParams } from '../types/analytics.types'
import { analyticsKeys } from './queryKeys'

/** One analytics request against the current or an external instance. */
export const analyticsQueryOptions = (
    engine: DataEngine,
    instance: InstanceConnection | undefined,
    params: AnalyticsParams
) =>
    queryOptions({
        queryKey: analyticsKeys.request(instance, params),
        queryFn: ({ signal }) =>
            fetchAnalytics(createInstanceClient(engine, instance), params, signal),
    })
