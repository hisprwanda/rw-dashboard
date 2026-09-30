import i18n from '@dhis2/d2-i18n'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import { useMemo } from 'react'
import { applyLayout, useAnalytics } from '@/features/analytics'
import { ChartRenderer } from '@/features/charts'
import { useDataSourceInstance } from '@/features/data-sources'
import type { DashboardVisualItem } from '../types/dashboard.types'

/** A visualization inside a dashboard: runs its saved query against its data source. */
export const DashboardVisual = ({ item }: { item: DashboardVisualItem }) => {
    const source = useDataSourceInstance(item.dataSourceId)
    const params = useMemo(
        () =>
            item.visualQuery?.myData?.params
                ? applyLayout(item.visualQuery.myData.params, item.analyticsPayloadDeterminer)
                : undefined,
        [item.visualQuery, item.analyticsPayloadDeterminer]
    )
    const { data, isLoading, error } = useAnalytics(params, source.instance)

    if (source.notFound) {
        return (
            <NoticeBox warning title={i18n.t('Data source not found')}>
                {i18n.t(
                    'The data source of this visualization was deleted or is not shared with you.'
                )}
            </NoticeBox>
        )
    }
    if (isLoading || source.isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <CircularLoader small />
            </div>
        )
    }
    if (error) {
        return (
            <NoticeBox error title={i18n.t('Could not load this visualization')}>
                {error.message}
            </NoticeBox>
        )
    }
    return (
        <ChartRenderer
            type={item.visualType}
            data={data}
            visualSettings={item.visualSettings}
            visualTitleAndSubTitle={item.visualTitleAndSubTitle}
            analyticsPayloadDeterminer={item.analyticsPayloadDeterminer}
        />
    )
}
