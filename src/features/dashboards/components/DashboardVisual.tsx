import i18n from '@dhis2/d2-i18n'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import { useMemo } from 'react'
import { useCombinedAnalytics } from '@/features/analytics'
import { ChartRenderer } from '@/features/charts'
import type { DashboardVisualItem } from '../types/dashboard.types'
import { DashboardOfficialVisual, isOfficialDashboardType } from './DashboardOfficialVisual'
import { useResolveSource } from '../hooks/useResolveSource'
import { visualItemQueries } from '../utils/visualQueries'

/**
 * A visualization inside a dashboard: runs its saved query against its data source (one
 * query per data source when its data items come from several).
 */
export const DashboardVisual = ({ item }: { item: DashboardVisualItem }) =>
    isOfficialDashboardType(item.visualType) ? (
        <DashboardOfficialVisual item={item} />
    ) : (
        <DashboardChartVisual item={item} />
    )

/** A visual drawn by the app's own charts. */
const DashboardChartVisual = ({ item }: { item: DashboardVisualItem }) => {
    const sources = useResolveSource()
    const { resolve } = sources
    const plan = useMemo(
        () => (resolve ? visualItemQueries(item, resolve) : undefined),
        [item, resolve]
    )
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
