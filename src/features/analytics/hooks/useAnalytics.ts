import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery } from '@tanstack/react-query'
import type { InstanceConnection } from '@/shared/api'
import type { AnalyticsParams } from '../types/analytics.types'
import { analyticsQueryOptions } from './analyticsQueryOptions'

/**
 * Declarative analytics: runs whenever `params` (or the instance) change, caches per
 * request and shares results between components. Pass `undefined` params to wait.
 */
export const useAnalytics = (
    params: AnalyticsParams | undefined,
    instance: InstanceConnection | undefined
) => {
    const engine = useDataEngine()
    const options = analyticsQueryOptions(engine, instance, params ?? {})
    return useQuery({
        ...options,
        queryFn: params && instance ? options.queryFn : skipToken,
    })
}
