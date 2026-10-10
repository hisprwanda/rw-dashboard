import { useDataEngine } from '@dhis2/app-runtime'
import { useQueries, type UseQueryResult } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { InstanceConnection } from '@/shared/api'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import type { AnalyticsParams } from '../types/analytics.types'
import { mergeAnalyticsMetaData, mergeAnalyticsResponses } from '../utils/mergeAnalytics'
import { analyticsQueryOptions } from './analyticsQueryOptions'

/** A data source whose analytics failed while the others succeeded. */
export interface SourceError {
    instanceName: string
    error: Error
}

export interface CombinedAnalytics {
    data: AnalyticsResponse | undefined
    metaData: AnalyticsResponse['metaData'] | undefined
    isLoading: boolean
    isFetching: boolean
    /** Set when no data source answered. */
    error: Error | null
    /** Data sources that failed while others answered (their items are left out). */
    sourceErrors: SourceError[]
}

/** The analytics of one data source. */
export interface SourceQuery {
    instance: InstanceConnection
    /** Shown when this source fails. */
    instanceName: string
    dataParams: AnalyticsParams
    /** Needed when `withMetadata` is on. */
    metadataParams?: AnalyticsParams
}

/**
 * Analytics of several data sources as one result: one query per source (cached per
 * instance), merged once all have settled. With a single part it behaves like
 * `useAnalytics`. Pass `undefined` parts to wait.
 */
export const useCombinedAnalytics = (
    parts: readonly SourceQuery[] | undefined,
    dataOrder?: readonly string[],
    { withMetadata = true }: { withMetadata?: boolean } = {}
): CombinedAnalytics => {
    const engine = useDataEngine()
    const sources = parts ?? []
    const names = sources.map(({ instanceName }) => instanceName).join('\u0000')

    const combine = useCallback(
        (results: UseQueryResult<AnalyticsResponse>[]): CombinedAnalytics => {
            const instanceNames = names.split('\u0000')
            // Results come as [data, metadata?] per source.
            const step = withMetadata ? 2 : 1
            const bySource = instanceNames.map((instanceName, index) => ({
                instanceName,
                data: results[index * step],
                metadata: withMetadata ? results[index * step + 1] : undefined,
            }))
            const settled = results.every((result) => !result.isPending)
            const failed = bySource.flatMap(({ instanceName, data, metadata }) => {
                const error = data?.error ?? metadata?.error
                return error ? [{ instanceName, error }] : []
            })
            const answered = bySource.filter(({ data }) => data?.data)
            const merge = settled && answered.length > 0
            return {
                data: merge
                    ? mergeAnalyticsResponses(
                          answered.flatMap(({ data }) => (data?.data ? [data.data] : [])),
                          dataOrder
                      )
                    : undefined,
                metaData: merge
                    ? mergeAnalyticsMetaData(
                          answered.flatMap(({ metadata }) =>
                              metadata?.data ? [metadata.data.metaData] : []
                          ),
                          dataOrder
                      )
                    : undefined,
                isLoading: results.some((result) => result.isLoading),
                isFetching: results.some((result) => result.isFetching),
                error:
                    settled && results.length > 0 && answered.length === 0
                        ? (failed[0]?.error ?? null)
                        : null,
                sourceErrors: answered.length > 0 ? failed : [],
            }
        },
        [names, dataOrder, withMetadata]
    )

    return useQueries({
        queries: sources.flatMap(({ instance, dataParams, metadataParams }) =>
            (withMetadata ? [dataParams, metadataParams ?? {}] : [dataParams]).map((params) =>
                analyticsQueryOptions(engine, instance, params)
            )
        ),
        combine,
    })
}
