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
 * Year-over-year analytics: one query per year (cached per request). `data` holds one
 * response per year, newest first, once all have answered. Pass `undefined` to wait.
 */
export const useYearOverYearAnalytics = (
    instance: InstanceConnection | undefined,
    run: Pick<YearOverYearRun, 'params' | 'years'> | undefined
) => {
    const engine = useDataEngine()
    const years = run?.years
    const combine = useCallback(
        (results: UseQueryResult<AnalyticsResponse>[]) => {
            const responses = results.flatMap(({ data }) => (data ? [data] : []))
            const complete = results.length > 0 && responses.length === results.length
            return {
                data: complete ? responses : undefined,
                extraOptions:
                    complete && years ? yearOverYearExtraOptions(responses, years) : undefined,
                isLoading: results.some((result) => result.isLoading),
                isFetching: results.some((result) => result.isFetching),
                error: results.find((result) => result.error)?.error ?? null,
            }
        },
        [years]
    )
    return useQueries({
        queries: (instance && run ? run.params : []).map((params) =>
            analyticsQueryOptions(engine, instance, params)
        ),
        combine,
    })
}

/**
 * Year-over-year analytics on demand: one request per year, run by `run()`; running the
 * same requests again re-fetches. `data` holds one response per year, newest first.
 */
export const useYearOverYearRun = () => {
    const queryClient = useQueryClient()
    const [committed, setCommitted] = useState<Committed | null>(null)
    const result = useYearOverYearAnalytics(committed?.instance, committed ?? undefined)

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
