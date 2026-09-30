import { useMemo } from 'react'
import { getDimensionItems, transformMetadataLabels, useAnalytics } from '@/features/analytics'
import { useDisplayProperty } from '@/features/auth'
import {
    ChartRenderer,
    DEFAULT_VISUAL_SETTINGS,
    PivotTable,
    type VisualTitles,
} from '@/features/charts'
import type { InstanceConnection } from '@/shared/api'
import { LoadingState } from '@/shared/components'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { useDhis2Visualization } from '../hooks/useDhis2Objects'
import { dhis2ChartType, isPivotTable, visualizationToRequest } from '../utils/favoriteRequest'
import { Dhis2ImageView } from './Dhis2ImageView'
import { Dhis2ObjectError } from './Dhis2ObjectError'

/** No title (the dashboard tile shows the name); the subtitle lists the filter items. */
const titlesOf = (data: AnalyticsResponse | undefined): VisualTitles => {
    const labels = transformMetadataLabels(data?.metaData)
    return {
        DefaultSubTitle: {
            periods: getDimensionItems(labels, 'periods'),
            orgUnits: getDimensionItems(labels, 'orgUnits'),
            dataElements: getDimensionItems(labels, 'dataElements'),
        },
    }
}

interface Dhis2NativeVisualizationProps {
    instance: InstanceConnection
    objectId: string
    name: string
}

/**
 * A Data Visualizer favorite drawn by this app: its analytics are fetched through the
 * instance client (any data source) and drawn as a pivot table or one of this app's
 * charts. Types without an equivalent (year-over-year…) show DHIS2's image.
 */
export const Dhis2NativeVisualization = ({
    instance,
    objectId,
    name,
}: Dhis2NativeVisualizationProps) => {
    const displayProperty = useDisplayProperty()
    const visualization = useDhis2Visualization(instance, objectId)
    const definition = visualization.data
    const pivot = !!definition && isPivotTable(definition.type)
    const chartType = definition ? dhis2ChartType(definition.type) : null
    const request = useMemo(
        () => (definition ? visualizationToRequest(definition, displayProperty) : undefined),
        [definition, displayProperty]
    )
    const analytics = useAnalytics(pivot || chartType ? request?.params : undefined, instance)
    const titles = useMemo(() => titlesOf(analytics.data), [analytics.data])

    if (visualization.error) return <Dhis2ObjectError error={visualization.error} />
    if (!definition || !request) return <LoadingState />
    if (!pivot && !chartType) {
        return (
            <Dhis2ImageView
                instance={instance}
                objectType="visualization"
                objectId={objectId}
                name={name}
            />
        )
    }
    if (analytics.error) return <Dhis2ObjectError error={analytics.error} />
    if (!analytics.data) return <LoadingState />
    if (pivot) {
        return (
            <PivotTable
                data={analytics.data}
                columns={(definition.columns ?? []).map((axis) => axis.dimension)}
                rows={(definition.rows ?? []).map((axis) => axis.dimension)}
                rowTotals={!!definition.rowTotals}
                colTotals={!!definition.colTotals}
                hideEmptyRows={!!definition.hideEmptyRows}
            />
        )
    }
    return (
        <ChartRenderer
            type={chartType ?? undefined}
            data={analytics.data}
            visualSettings={DEFAULT_VISUAL_SETTINGS}
            visualTitleAndSubTitle={titles}
            analyticsPayloadDeterminer={request.layout}
        />
    )
}
