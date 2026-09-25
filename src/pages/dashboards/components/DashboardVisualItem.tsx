import i18n from '@dhis2/d2-i18n'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import React, { useMemo } from 'react'
import {
    applyLayout,
    useAnalytics,
    type AnalyticsLayout,
    type StoredAnalyticsQuery,
} from '@/features/analytics'
import type { InstanceConnection } from '@/shared/api'
import { chartComponents } from '../../../constants/systemCharts'
import { currentInstanceId } from '../../../constants/currentInstanceInfo'
import { useDataSourceData } from '../../../services/DataSourceHooks'
import { VisualSettingsTypes, VisualTitleAndSubtitleType } from '../../../types/visualSettingsTypes'
import type { DataSourceFormFields } from '../../../types/DataSource'

interface DashboardVisualItemProps {
    query: StoredAnalyticsQuery | undefined
    visualType: string
    visualTitleAndSubTitle: VisualTitleAndSubtitleType
    visualSettings: VisualSettingsTypes
    dataSourceId: string
    analyticsPayloadDeterminer: AnalyticsLayout
}

interface SavedDataSources {
    dataStore?: { entries?: Array<{ key: string; value: DataSourceFormFields }> }
}

const CURRENT_INSTANCE: InstanceConnection = { isCurrentInstance: true }

const DashboardVisualItem: React.FC<DashboardVisualItemProps> = ({
    query,
    visualType,
    visualSettings,
    visualTitleAndSubTitle,
    dataSourceId,
    analyticsPayloadDeterminer,
}) => {
    const { data: savedDataSources, loading: isSourcesLoading } = useDataSourceData()
    const isCurrentInstance = dataSourceId === currentInstanceId

    const instance = isCurrentInstance
        ? CURRENT_INSTANCE
        : (savedDataSources as SavedDataSources | undefined)?.dataStore?.entries?.find(
              (entry) => entry.key === dataSourceId
          )?.value

    // The same layout is applied for current and external instances.
    const params = useMemo(
        () =>
            query?.myData?.params
                ? applyLayout(query.myData.params, analyticsPayloadDeterminer)
                : undefined,
        [query, analyticsPayloadDeterminer]
    )

    const { data, isLoading, error } = useAnalytics(params, instance)

    if (isLoading || (!isCurrentInstance && isSourcesLoading)) return <CircularLoader />

    if (!isCurrentInstance && !isSourcesLoading && !instance) {
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

    const SelectedChart = chartComponents.find((chart) => chart.type === visualType)?.component
    return (
        <div>
            {SelectedChart ? (
                <SelectedChart
                    data={data}
                    visualSettings={visualSettings}
                    visualTitleAndSubTitle={visualTitleAndSubTitle}
                />
            ) : null}
        </div>
    )
}

export default DashboardVisualItem
