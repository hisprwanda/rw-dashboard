import i18n from '@dhis2/d2-i18n'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import React, { useMemo } from 'react'
import {
    applyLayout,
    useAnalytics,
    type AnalyticsLayout,
    type StoredAnalyticsQuery,
} from '@/features/analytics'
import { ChartRenderer } from '@/features/charts'
import { useDataSourceInstance } from '@/features/data-sources'
import { VisualSettingsTypes, VisualTitleAndSubtitleType } from '../../../types/visualSettingsTypes'

interface DashboardVisualItemProps {
    query: StoredAnalyticsQuery | undefined
    visualType: string
    visualTitleAndSubTitle: VisualTitleAndSubtitleType
    visualSettings: VisualSettingsTypes
    dataSourceId: string
    analyticsPayloadDeterminer: AnalyticsLayout
}

const DashboardVisualItem: React.FC<DashboardVisualItemProps> = ({
    query,
    visualType,
    visualSettings,
    visualTitleAndSubTitle,
    dataSourceId,
    analyticsPayloadDeterminer,
}) => {
    const { instance, isLoading: isSourcesLoading, notFound } = useDataSourceInstance(dataSourceId)

    // The same layout is applied for current and external instances.
    const params = useMemo(
        () =>
            query?.myData?.params
                ? applyLayout(query.myData.params, analyticsPayloadDeterminer)
                : undefined,
        [query, analyticsPayloadDeterminer]
    )

    const { data, isLoading, error } = useAnalytics(params, instance)

    if (isLoading || isSourcesLoading) return <CircularLoader />

    if (notFound) {
        return (
            <NoticeBox warning title={i18n.t('Data source not found')}>
                {i18n.t(
                    'The data source of this visualization was deleted or is not shared with you.'
                )}
            </NoticeBox>
        )
    }

    if (error) {
        return (
            <NoticeBox title={i18n.t('Could not load this visualization')} error>
                {error.message}
            </NoticeBox>
        )
    }

    return (
        <div>
            <ChartRenderer
                type={visualType}
                data={data}
                visualSettings={visualSettings}
                visualTitleAndSubTitle={visualTitleAndSubTitle}
                analyticsPayloadDeterminer={analyticsPayloadDeterminer}
            />
        </div>
    )
}

export default DashboardVisualItem
