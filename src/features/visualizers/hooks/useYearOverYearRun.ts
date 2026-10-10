import { useDataEngine } from '@dhis2/app-runtime'
import { useQueries, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { analyticsKeys, analyticsQueryOptions } from '@/features/analytics'
import type { InstanceConnection } from '@/shared/api'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { yearOverYearExtraOptions, type YearOverYearRun } from '../utils/yearOverYear'

interface Committed extends YearOverYearRun {
    instance: InstanceConnection
}

/**
 * Year-over-year analytics on demand: one request per year, run by `run()`; running the
 * same requests again re-fetches. `data` holds one response per year, newest first.
 */
export const useYearOverYearRun = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const [committed, setCommitted] = useState<Committed | null>(null)

    const combine = useCallback(
        (results: UseQueryResult<AnalyticsResponse>[]) => {
            const responses = results.flatMap(({ data }) => (data ? [data] : []))
            const complete = results.length > 0 && responses.length === results.length
            return {
                data: complete ? responses : undefined,
                extraOptions:
                    complete && committed
                        ? yearOverYearExtraOptions(responses, committed.years)
                        : undefined,
                isFetching: results.some((result) => result.isFetching),
                error: results.find((result) => result.error)?.error ?? null,
            }
        },
        [committed]
    )

    const result = useQueries({
        queries: (committed?.params ?? []).map((params) =>
            analyticsQueryOptions(engine, committed?.instance, params)
        ),
        combine,
    })

    const run = useCallback(
        async (next: YearOverYearRun, instance: InstanceConnection) => {
            await Promise.all(
                next.params.map((params) =>
                    queryClient.invalidateQueries({
                        queryKey: analyticsKeys.request(instance, params),
                        exact: true,
                    })
                )
            )
            setCommitted({ ...next, instance })
        },
        [queryClient]
    )

    const reset = useCallback(() => setCommitted(null), [])

    return {
        data: result.data,
        extraOptions: result.extraOptions,
        isFetching: result.isFetching,
        error: result.error,
        run,
        reset,
        request: committed?.request ?? null,
    }
}
