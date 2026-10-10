import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import type { AnalyticsRequest } from '@/features/analytics'
import { createInstanceClient, instanceKey, type InstanceConnection } from '@/shared/api'
import type { AnalyticsHeader } from '@/shared/types/dhis2.types'
import type { OutlierParams } from '../utils/outliers'

/** Response of `GET /api/analytics/outlierDetection`. */
export interface OutlierResponse {
    headers: AnalyticsHeader[]
    rows: string[][]
}

export const outlierKeys = {
    request: (instance: InstanceConnection | undefined, params: OutlierParams | undefined) =>
        ['outliers', instanceKey(instance), params ?? null] as const,
}

interface Committed {
    instance: InstanceConnection
    params: OutlierParams
    /** The analytics request of the same selection: what gets saved with the visual. */
    request: AnalyticsRequest | null
}

/** Outlier detection of one request (cached per request). Pass `undefined` params to wait. */
export const useOutliers = (
    instance: InstanceConnection | undefined,
    params: OutlierParams | undefined
) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: outlierKeys.request(instance, params),
        queryFn:
            instance && params
                ? ({ signal }) =>
                      createInstanceClient(engine, instance).get<OutlierResponse>(
                          'analytics/outlierDetection',
                          params,
                          signal
                      )
                : skipToken,
    })
}

/** Outlier detection on demand: nothing is fetched until `run()`; running again re-fetches. */
export const useOutlierRun = () => {
    const queryClient = useQueryClient()
    const [committed, setCommitted] = useState<Committed | null>(null)
    const query = useOutliers(committed?.instance, committed?.params)

    const run = useCallback(
        async (next: Committed) => {
            await queryClient.invalidateQueries({
                queryKey: outlierKeys.request(next.instance, next.params),
                exact: true,
            })
            setCommitted(next)
        },
        [queryClient]
    )

    const reset = useCallback(() => setCommitted(null), [])

    return {
        data: query.data,
        isFetching: query.isFetching,
        error: query.error,
        run,
        reset,
        request: committed?.request ?? null,
    }
}
