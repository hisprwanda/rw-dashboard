import i18n from '@dhis2/d2-i18n'
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import { useMemo, type ReactNode } from 'react'
import { useChartLegendSets, useCombinedAnalytics } from '@/features/analytics'
import type { ChartType } from '@/features/charts'
import {
    buildVisualization,
    DEFAULT_OUTLIER_OPTIONS,
    DEFAULT_YEAR_OVER_YEAR,
    DhisChart,
    DhisPivotTable,
    isYearOverYearChart,
    OutlierError,
    OutlierTable,
    outlierParamsFromQuery,
    resolveYears,
    useOutliers,
    useYearOverYearAnalytics,
    visTypeFromChartType,
    withOptions,
    yearOverYearLayout,
    yearOverYearParams,
} from '@/features/visualizers'
import type { InstanceConnection } from '@/shared/api'
import { useResolveSource } from '../hooks/useResolveSource'
import type { DashboardVisualItem } from '../types/dashboard.types'
import { visualItemQueries } from '../utils/visualQueries'

/** Chart types a dashboard draws with the DHIS2 components (all but the app's own types). */
export const isOfficialDashboardType = (type: string) => !!visTypeFromChartType(type as ChartType)

const Loading = () => (
    <div className="flex h-full items-center justify-center">
        <CircularLoader small />
    </div>
)

const Failure = ({ error }: { error: Error }) => (
    <NoticeBox error title={i18n.t('Could not load this visualization')}>
        {error.message}
    </NoticeBox>
)

const Missing = () => (
    <NoticeBox warning title={i18n.t('Data source not found')}>
        {i18n.t('A data source of this visualization was deleted or is not shared with you.')}
    </NoticeBox>
)

interface ViewProps {
    item: DashboardVisualItem
    instance: InstanceConnection
}

const useVisualization = (item: DashboardVisualItem, yearOverYear = false) => {
    const type = visTypeFromChartType(item.visualType as ChartType)
    const saved = item.analyticsPayloadDeterminer
    const layout = useMemo(
        () => (yearOverYear ? yearOverYearLayout(saved) : saved),
        [yearOverYear, saved]
    )
    const params = item.visualQuery?.myData?.params
    const options = item.visualOptions
    const title = item.visualTitleAndSubTitle?.visualTitle
    const subtitle = item.visualTitleAndSubTitle?.customSubTitle
    return useMemo(() => {
        if (!type) return undefined
        const visualization = buildVisualization(type, layout, params)
        return {
            ...(options ? withOptions(visualization, options) : visualization),
            title: title || undefined,
            subtitle: subtitle || undefined,
        }
    }, [type, layout, params, options, title, subtitle])
}

/** Pivot tables and charts: one analytics request per data source, merged. */
const AnalyticsView = ({ item, instance }: ViewProps) => {
    const { resolve } = useResolveSource()
    const plan = useMemo(
        () => (resolve ? visualItemQueries(item, resolve) : undefined),
        [item, resolve]
    )
    const visualization = useVisualization(item)
    const legendSets = useChartLegendSets(instance)
    const legendSet = legendSets.data?.find(({ id }) => id === item.visualOptions?.legendSetId)
    const { data, isLoading, error, sourceErrors } = useCombinedAnalytics(
        plan?.missing ? undefined : plan?.queries,
        plan?.dataOrder,
        { withMetadata: false }
    )
    if (plan?.missing) return <Missing />
    if (isLoading || !plan) return <Loading />
    if (error) return <Failure error={error} />
    if (!data || !visualization) return null
    const legendSetList = legendSet ? [legendSet] : undefined
    return (
        <div className="flex h-full flex-col">
            {sourceErrors.length > 0 && (
                <NoticeBox warning title={i18n.t('Some data could not be loaded')}>
                    {sourceErrors.map(({ instanceName }) => instanceName).join(', ')}
                </NoticeBox>
            )}
            <div className="min-h-0 flex-grow">
                {visualization.type === 'PIVOT_TABLE' ? (
                    <DhisPivotTable
                        fill
                        data={data}
                        visualization={visualization}
                        legendSets={legendSetList}
                    />
                ) : (
                    <DhisChart
                        fill
                        data={data}
                        visualization={visualization}
                        legendSets={legendSetList}
                    />
                )}
            </div>
        </div>
    )
}

const YearOverYearView = ({ item, instance }: ViewProps) => {
    const visualization = useVisualization(item, true)
    const { years, category } = item.yearOverYear ?? DEFAULT_YEAR_OVER_YEAR
    const saved = item.visualQuery?.myData?.params
    const run = useMemo(() => {
        const resolved = resolveYears(years)
        return saved
            ? { years: resolved, params: yearOverYearParams(saved, category, resolved) }
            : undefined
    }, [saved, years, category])
    const { data, extraOptions, isLoading, error } = useYearOverYearAnalytics(instance, run)
    if (isLoading) return <Loading />
    if (error) return <Failure error={error} />
    if (!data || !visualization) return null
    return <DhisChart fill data={data} visualization={visualization} extraOptions={extraOptions} />
}

const OutlierView = ({ item, instance }: ViewProps) => {
    const params = useMemo(
        () =>
            outlierParamsFromQuery(item.visualQuery?.myData?.params, {
                ...DEFAULT_OUTLIER_OPTIONS,
                ...item.visualOptions?.outlier,
            }) ?? undefined,
        [item.visualQuery, item.visualOptions]
    )
    const { data, isLoading, error } = useOutliers(instance, params)
    if (isLoading) return <Loading />
    if (error) return <OutlierError error={error} />
    return data ? <OutlierTable data={data} /> : null
}

/** A visual of an official DHIS2 type on a dashboard, drawn exactly as in the builder. */
export const DashboardOfficialVisual = ({ item }: { item: DashboardVisualItem }) => {
    const { resolve, isLoading, error } = useResolveSource()
    if (error) return <Failure error={error} />
    if (isLoading || !resolve) return <Loading />
    const source = resolve(item.dataSourceId)
    if (!source) return <Missing />
    const { instanceName: _name, ...instance } = source
    const View: (props: ViewProps) => ReactNode =
        item.visualType === 'Outlier Table'
            ? OutlierView
            : isYearOverYearChart(item.visualType as ChartType)
              ? YearOverYearView
              : AnalyticsView
    return <View item={item} instance={instance} />
}
