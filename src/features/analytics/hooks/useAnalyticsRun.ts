import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import type { InstanceConnection } from '@/shared/api'
import type { AnalyticsRequest } from '../utils/buildAnalyticsRequest'
import { analyticsKeys } from './queryKeys'
import { useAnalytics } from './useAnalytics'

interface CommittedRun {
    request: AnalyticsRequest
    instance: InstanceConnection
}

/**
 * Analytics that run on demand ("Update"): the builder edits its selection freely and
 * only a `run(request, instance)` fetches. Results, loading and errors come from
 * TanStack Query; running the same request again forces a fresh fetch.
 */
export const useAnalyticsRun = () => {
    const queryClient = useQueryClient()
    const [committed, setCommitted] = useState<CommittedRun | null>(null)

    const data = useAnalytics(committed?.request.dataParams, committed?.instance)
    const metadata = useAnalytics(committed?.request.metadataParams, committed?.instance)

    const run = useCallback(
        async (request: AnalyticsRequest, instance: InstanceConnection) => {
            // Explicit runs always re-fetch, even when the result is still cached: an
            // active query (same request again) refetches now, another one on mount.
            await Promise.all(
                [request.dataParams, request.metadataParams].map((params) =>
                    queryClient.invalidateQueries({
                        queryKey: analyticsKeys.request(instance, params),
                        // Keys hold params objects: without `exact`, the data params (a
                        // subset of the metadata params) would also match the metadata query.
                        exact: true,
                    })
                )
            )
            setCommitted({ request, instance })
        },
        [queryClient]
    )

    const reset = useCallback(() => setCommitted(null), [])

    return {
        run,
        reset,
        /** The request of the last run (what gets saved with a visual). */
        request: committed?.request ?? null,
        data: data.data,
        metaData: metadata.data?.metaData,
        isFetching: data.isFetching || metadata.isFetching,
        error: data.error ?? metadata.error,
    }
}
