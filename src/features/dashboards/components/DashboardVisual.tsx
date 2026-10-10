import i18n from '@dhis2/d2-i18n'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import { useMemo } from 'react'
import { useCombinedAnalytics } from '@/features/analytics'
import { ChartRenderer } from '@/features/charts'
import { CURRENT_INSTANCE_ID, useDataSources } from '@/features/data-sources'
import { useApplicationTitle } from '@/features/system'
import type { DashboardVisualItem } from '../types/dashboard.types'
import { visualItemQueries, type ResolveSource } from '../utils/visualQueries'

/**
 * A visualization inside a dashboard: runs its saved query against its data source (one
 * query per data source when its data items come from several).
 */
export const DashboardVisual = ({ item }: { item: DashboardVisualItem }) => {
    const applicationTitle = useApplicationTitle()
    const sources = useDataSources()
    const plan = useMemo(() => {
        if (!sources.data) return undefined
        const resolve: ResolveSource = (id) =>
            !id || id === CURRENT_INSTANCE_ID
                ? { isCurrentInstance: true, instanceName: applicationTitle }
                : sources.data?.find((entry) => entry.key === id)?.value
        return visualItemQueries(item, resolve)
    }, [item, sources.data, applicationTitle])
    const { data, isLoading, error, sourceErrors } = useCombinedAnalytics(
        plan?.missing ? undefined : plan?.queries,
        plan?.dataOrder,
        { withMetadata: false }
    )

    if (plan?.missing) {
        return (
            <NoticeBox warning title={i18n.t('Data source not found')}>
                {i18n.t(
                    'A data source of this visualization was deleted or is not shared with you.'
                )}
            </NoticeBox>
        )
    }
    if (isLoading || sources.isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <CircularLoader small />
            </div>
        )
    }
    const failure = error ?? sources.error
    if (failure) {
        return (
            <NoticeBox error title={i18n.t('Could not load this visualization')}>
                {failure.message}
            </NoticeBox>
        )
    }
    const chart = (
        <ChartRenderer
            type={item.visualType}
            data={data}
            visualSettings={item.visualSettings}
            visualTitleAndSubTitle={item.visualTitleAndSubTitle}
            analyticsPayloadDeterminer={item.analyticsPayloadDeterminer}
        />
    )
    if (!sourceErrors.length) return chart
    return (
        <div className="flex h-full flex-col">
            <NoticeBox warning title={i18n.t('Some data could not be loaded')}>
                {sourceErrors.map(({ instanceName }) => instanceName).join(', ')}
            </NoticeBox>
            <div className="min-h-0 flex-grow">{chart}</div>
        </div>
    )
}
