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

/** Chart types a dashboard draws with the DHIS2 components instead of the legacy charts. */
export const isOfficialDashboardType = (type: string) =>
    type === 'Table' || type === 'Outlier Table' || isYearOverYearChart(type as ChartType)

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
    return useMemo(() => {
        if (!type) return undefined
        const visualization = buildVisualization(type, layout, params)
        return {
            ...(options ? withOptions(visualization, options) : visualization),
            title: title || undefined,
        }
    }, [type, layout, params, options, title])
}

const PivotView = ({ item, instance }: ViewProps) => {
    const { resolve } = useResolveSource()
    const plan = useMemo(
        () => (resolve ? visualItemQueries(item, resolve) : undefined),
        [item, resolve]
    )
    const visualization = useVisualization(item)
    const legendSets = useChartLegendSets(instance)
    const legendSet = legendSets.data?.find(({ id }) => id === item.visualOptions?.legendSetId)
    const { data, isLoading, error } = useCombinedAnalytics(
        plan?.missing ? undefined : plan?.queries,
        plan?.dataOrder,
        { withMetadata: false }
    )
    if (plan?.missing) return <Missing />
    if (isLoading || !plan) return <Loading />
    if (error) return <Failure error={error} />
    if (!data || !visualization) return null
    return (
        <DhisPivotTable
            data={data}
            visualization={visualization}
            legendSets={legendSet ? [legendSet] : undefined}
        />
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
    return <DhisChart data={data} visualization={visualization} extraOptions={extraOptions} />
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

/** A pivot table, year-over-year chart or outlier table on a dashboard, drawn as in DHIS2. */
export const DashboardOfficialVisual = ({ item }: { item: DashboardVisualItem }) => {
    const { resolve, isLoading, error } = useResolveSource()
    if (error) return <Failure error={error} />
    if (isLoading || !resolve) return <Loading />
    const source = resolve(item.dataSourceId)
    if (!source) return <Missing />
    const { instanceName: _name, ...instance } = source
    const views: Record<string, (props: ViewProps) => ReactNode> = {
        Table: PivotView,
        'Outlier Table': OutlierView,
    }
    const View = views[item.visualType] ?? YearOverYearView
    return <View item={item} instance={instance} />
}
