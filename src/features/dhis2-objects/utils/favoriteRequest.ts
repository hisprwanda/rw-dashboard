import type {
    AnalyticsLayout,
    AnalyticsParams,
    DisplayProperty,
    StoredAnalyticsQuery,
} from '@/features/analytics'
import type { ChartType } from '@/features/charts'
import type { MapSettings, StoredGeoFeaturesQuery } from '@/features/maps'
import type {
    Dhis2Dimension,
    Dhis2Map,
    Dhis2MapView,
    Dhis2Visualization,
} from '../types/dhis2Object.types'

const LAYOUT_NAME: Record<string, string> = {
    dx: 'Data',
    pe: 'Period',
    ou: 'Organisation unit',
}

/** `dx:a;b`, or the bare dimension id when all its items are wanted (e.g. a category). */
export const dimensionParam = ({ dimension, items }: Dhis2Dimension): string =>
    items?.length ? `${dimension}:${items.map((item) => item.id).join(';')}` : dimension

const layoutNames = (axis: readonly Dhis2Dimension[] | undefined) =>
    (axis ?? []).map(({ dimension }) => LAYOUT_NAME[dimension] ?? dimension)

const filterParam = (filters: readonly Dhis2Dimension[] | undefined) => {
    const values = (filters ?? []).map(dimensionParam)
    return values.length === 0 ? undefined : values.length === 1 ? values[0] : values
}

export interface FavoriteRequest {
    params: AnalyticsParams
    layout: AnalyticsLayout
}

/**
 * The analytics request of a Data Visualizer favorite: its columns and rows become
 * `dimension`, its filters `filter`. Items are sent as they are (relative periods,
 * `USER_ORGUNIT_CHILDREN`, `LEVEL-2`… are understood by the analytics API).
 */
export const visualizationToRequest = (
    visualization: Pick<Dhis2Visualization, 'columns' | 'rows' | 'filters'>,
    displayProperty: DisplayProperty = 'NAME'
): FavoriteRequest => {
    const filter = filterParam(visualization.filters)
    return {
        params: {
            dimension: [...(visualization.columns ?? []), ...(visualization.rows ?? [])].map(
                dimensionParam
            ),
            ...(filter === undefined ? {} : { filter }),
            displayProperty,
        },
        layout: {
            Columns: layoutNames(visualization.columns),
            Rows: layoutNames(visualization.rows),
            Filter: layoutNames(visualization.filters),
        },
    }
}

const CHART_TYPE: Record<string, ChartType> = {
    COLUMN: 'Column',
    STACKED_COLUMN: 'Stacked Col',
    BAR: 'Bar',
    STACKED_BAR: 'Stacked Bar',
    LINE: 'Line',
    AREA: 'Area',
    STACKED_AREA: 'Area',
    PIE: 'Pie',
    RADAR: 'Radar',
    GAUGE: 'Gauge',
    SINGLE_VALUE: 'Single Value',
    SCATTER: 'Scatter',
}

/** This app's chart type for a Data Visualizer type; `null` when it has no equivalent. */
export const dhis2ChartType = (type: string): ChartType | null => CHART_TYPE[type] ?? null

export const isPivotTable = (type: string) => type === 'PIVOT_TABLE'

/** The layer kind of a map view: `thematic1` -> `thematic`. */
export const layerKind = (view: Pick<Dhis2MapView, 'layer'>) => view.layer.replace(/\d+$/, '')

export interface ThematicMapQuery {
    analyticsQuery: StoredAnalyticsQuery
    geoFeaturesQuery: StoredGeoFeaturesQuery
    settings: MapSettings
}

const find = (axes: readonly Dhis2Dimension[] | undefined, dimension: string) =>
    (axes ?? []).find((axis) => axis.dimension === dimension && axis.items?.length)

/**
 * The queries of this app's thematic map for a Maps favorite, or `null` when the map
 * cannot be drawn natively: other layer kinds (events, facilities, Earth Engine…), several
 * layers, or no data, org unit or period dimension.
 */
export const mapToThematic = (
    map: Pick<Dhis2Map, 'mapViews'>,
    displayProperty: DisplayProperty = 'NAME'
): ThematicMapQuery | null => {
    const layers = map.mapViews.filter((view) => layerKind(view) !== 'boundary')
    const [view] = layers
    if (layers.length !== 1 || !view || layerKind(view) !== 'thematic') return null

    const axes = [...(view.columns ?? []), ...(view.rows ?? []), ...(view.filters ?? [])]
    const dx = find(axes, 'dx')
    const ou = find(axes, 'ou')
    const pe = find(axes, 'pe')
    if (!dx || !ou || !pe) return null

    const orgUnits = dimensionParam(ou)
    const legends = view.legendSet?.legends ?? []
    return {
        analyticsQuery: {
            myData: {
                resource: 'analytics',
                params: {
                    dimension: [dimensionParam(dx), orgUnits],
                    filter: dimensionParam(pe),
                    displayProperty,
                },
            },
        },
        geoFeaturesQuery: {
            result: { resource: 'geoFeatures', params: { ou: orgUnits, displayProperty } },
        },
        settings: {
            appliedLabels: [],
            selectedLabels: [],
            legend: legends.length
                ? {
                      name: view.legendSet?.name ?? '',
                      legends: [...legends]
                          .sort((a, b) => a.startValue - b.startValue)
                          .map((legend) => ({
                              name: legend.name ?? `${legend.startValue} - ${legend.endValue}`,
                              startValue: legend.startValue,
                              endValue: legend.endValue,
                              color: legend.color,
                          })),
                  }
                : {},
            legendType: legends.length ? 'dhis2' : 'auto',
        },
    }
}
