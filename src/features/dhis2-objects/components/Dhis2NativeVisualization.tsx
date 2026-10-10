import { useMemo } from 'react'
import { useAnalytics, useChartLegendSets } from '@/features/analytics'
import { useDisplayProperty } from '@/features/auth'
import {
    DhisChart,
    DhisPivotTable,
    OutlierError,
    OutlierTable,
    resolveYears,
    useOutliers,
    useYearOverYearAnalytics,
    yearOverYearParams,
} from '@/features/visualizers'
import type { InstanceConnection } from '@/shared/api'
import { LoadingState } from '@/shared/components'
import { useDhis2Visualization } from '../hooks/useDhis2Objects'
import type { Dhis2Visualization } from '../types/dhis2Object.types'
import {
    favoriteOutlierParams,
    favoriteYearOverYear,
    isPivotTable,
    visualizationToRequest,
    yearOverYearAxes,
} from '../utils/favoriteRequest'
import { Dhis2ImageView } from './Dhis2ImageView'
import { Dhis2ObjectError } from './Dhis2ObjectError'

/** Data Visualizer types drawn from one analytics response by the DHIS2 chart engine. */
const CHART_TYPES = [
    'COLUMN',
    'STACKED_COLUMN',
    'BAR',
    'STACKED_BAR',
    'LINE',
    'AREA',
    'STACKED_AREA',
    'PIE',
    'RADAR',
    'GAUGE',
    'SINGLE_VALUE',
    'SCATTER',
]

/** On a dashboard the tile shows the name: the chart leaves its title out, as in DHIS2. */
const DASHBOARD = { dashboard: true }

interface ViewProps {
    instance: InstanceConnection
    definition: Dhis2Visualization
}

/** The legend set a favorite colors its values with, if any. */
const useFavoriteLegendSets = (instance: InstanceConnection, definition: Dhis2Visualization) => {
    const legendSets = useChartLegendSets(instance)
    const legend = definition.legend as { set?: { id?: string } } | undefined
    const id = legend?.set?.id
    const set = id ? legendSets.data?.find((candidate) => candidate.id === id) : undefined
    return set ? [set] : undefined
}

/** Pivot tables and charts: the favorite object itself drives the official components. */
const AnalyticsView = ({ instance, definition }: ViewProps) => {
    const displayProperty = useDisplayProperty()
    const params = useMemo(
        () => visualizationToRequest(definition, displayProperty).params,
        [definition, displayProperty]
    )
    const analytics = useAnalytics(params, instance)
    const legendSets = useFavoriteLegendSets(instance, definition)
    if (analytics.error) return <Dhis2ObjectError error={analytics.error} />
    if (!analytics.data) return <LoadingState />
    return isPivotTable(definition.type) ? (
        <DhisPivotTable
            fill
            data={analytics.data}
            visualization={definition}
            legendSets={legendSets}
        />
    ) : (
        <DhisChart
            fill
            data={analytics.data}
            visualization={definition}
            legendSets={legendSets}
            extraOptions={DASHBOARD}
        />
    )
}

/** Year over year: one analytics request per year of the favorite's series. */
const YearOverYearView = ({ instance, definition }: ViewProps) => {
    const displayProperty = useDisplayProperty()
    const selection = useMemo(() => favoriteYearOverYear(definition), [definition])
    const run = useMemo(() => {
        if (!selection) return undefined
        const years = resolveYears(selection.years)
        const { params } = visualizationToRequest(definition, displayProperty)
        return { years, params: yearOverYearParams(params, selection.category, years) }
    }, [definition, selection, displayProperty])
    const axes = useMemo(() => yearOverYearAxes(definition), [definition])
    const { data, extraOptions, error } = useYearOverYearAnalytics(instance, run)
    const options = useMemo(() => ({ ...DASHBOARD, ...extraOptions }), [extraOptions])
    if (error) return <Dhis2ObjectError error={error} />
    if (!data) return <LoadingState />
    return <DhisChart fill data={data} visualization={axes} extraOptions={options} />
}

/** Outlier tables: the analytics outlier detection with the favorite's method. */
const OutlierView = ({ instance, definition }: ViewProps) => {
    const displayProperty = useDisplayProperty()
    const params = useMemo(
        () => favoriteOutlierParams(definition, displayProperty) ?? undefined,
        [definition, displayProperty]
    )
    const outliers = useOutliers(instance, params)
    if (outliers.error) return <OutlierError error={outliers.error} />
    if (!outliers.data) return <LoadingState />
    return <OutlierTable data={outliers.data} />
}

interface Dhis2NativeVisualizationProps {
    instance: InstanceConnection
    objectId: string
    name: string
}

/**
 * A Data Visualizer favorite drawn with the official DHIS2 components: its analytics are
 * fetched through the instance client (any data source) and the favorite object itself
 * (type, layout, colors, axes, legend, totals…) is handed to the DHIS2 chart engine or
 * pivot table, so it looks as in DHIS2. Types they cannot draw show DHIS2's image.
 */
export const Dhis2NativeVisualization = ({
    instance,
    objectId,
    name,
}: Dhis2NativeVisualizationProps) => {
    const displayProperty = useDisplayProperty()
    const visualization = useDhis2Visualization(instance, objectId)
    const definition = visualization.data

    if (visualization.error) return <Dhis2ObjectError error={visualization.error} />
    if (!definition) return <LoadingState />

    const type = definition.type
    if (isPivotTable(type) || CHART_TYPES.includes(type)) {
        return <AnalyticsView instance={instance} definition={definition} />
    }
    if (
        (type === 'YEAR_OVER_YEAR_LINE' || type === 'YEAR_OVER_YEAR_COLUMN') &&
        favoriteYearOverYear(definition)
    ) {
        return <YearOverYearView instance={instance} definition={definition} />
    }
    if (type === 'OUTLIER_TABLE' && favoriteOutlierParams(definition, displayProperty)) {
        return <OutlierView instance={instance} definition={definition} />
    }
    return (
        <Dhis2ImageView
            instance={instance}
            objectType="visualization"
            objectId={objectId}
            name={name}
        />
    )
}
