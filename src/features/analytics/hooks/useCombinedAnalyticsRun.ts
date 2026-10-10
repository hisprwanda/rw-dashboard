import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import type { SelectionRuns } from '../utils/selectionRequest'
import { analyticsKeys } from './queryKeys'
import { useCombinedAnalytics } from './useCombinedAnalytics'

/**
 * `useAnalyticsRun` for selections whose data items may come from several data sources:
 * nothing is fetched until `run(runs)`; running the same requests again re-fetches.
 */
export const useCombinedAnalyticsRun = () => {
    const queryClient = useQueryClient()
    const [committed, setCommitted] = useState<SelectionRuns | null>(null)
    const queries = useMemo(
        () =>
            committed?.parts.map(({ instance, request }) => ({
                instance,
                instanceName: instance.instanceName,
                dataParams: request.dataParams,
                metadataParams: request.metadataParams,
            })),
        [committed]
    )
    const combined = useCombinedAnalytics(queries, committed?.dataOrder)

    const run = useCallback(
        async (runs: SelectionRuns) => {
            await Promise.all(
                runs.parts.flatMap(({ instance, request }) =>
                    [request.dataParams, request.metadataParams].map((params) =>
                        queryClient.invalidateQueries({
                            queryKey: analyticsKeys.request(instance, params),
                            exact: true,
                        })
                    )
                )
            )
            setCommitted(runs)
        },
        [queryClient]
    )

    const reset = useCallback(() => setCommitted(null), [])

    return {
        ...combined,
        run,
        reset,
        /** The combined request of the last run (what gets saved with a visual). */
        request: committed?.request ?? null,
    }
}
