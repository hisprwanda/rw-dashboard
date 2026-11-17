import type { AnalyticsLayout, AnalyticsParams, DisplayProperty } from '@/features/analytics'
import {
    DEFAULT_OUTLIER_OPTIONS,
    outlierParamsFromQuery,
    type OutlierParams,
    type YearOverYearSelection,
} from '@/features/visualizers'
import type {
    Dhis2Axes,
    Dhis2Dimension,
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

/** A favorite's axes, plus any of its options (read when they have the expected type). */
type FavoriteDefinition = Dhis2Axes & { type?: string; [option: string]: unknown }

const text = (value: unknown) => (typeof value === 'string' && value ? value : undefined)

/** The analytics options a favorite sets, as Data Visualizer sends them with its request. */
const favoriteOptions = (visualization: FavoriteDefinition): AnalyticsParams => {
    const aggregationType = text(visualization.aggregationType)
    const measureCriteria = text(visualization.measureCriteria)
    const relativePeriodDate = text(visualization.relativePeriodDate)
    return {
        // The DHIS2 chart engine and pivot table read the dimension types of the metadata.
        includeMetadataDetails: true,
        ...(visualization.showHierarchy === true ? { showHierarchy: true } : {}),
        ...(aggregationType && aggregationType !== 'DEFAULT' ? { aggregationType } : {}),
        ...(measureCriteria ? { measureCriteria } : {}),
        ...(visualization.completedOnly === true ? { completedOnly: true } : {}),
        ...(relativePeriodDate ? { relativePeriodDate } : {}),
        // Pivot tables can show numerators and denominators of indicators.
        ...(visualization.type === 'PIVOT_TABLE' ? { includeNumDen: true } : {}),
    }
}

/**
 * The analytics request of a Data Visualizer favorite: its columns and rows become
 * `dimension`, its filters `filter`, and its analytics options are sent along. Items are
 * sent as they are (relative periods, `USER_ORGUNIT_CHILDREN`, `LEVEL-2`… are understood
 * by the analytics API).
 */
export const visualizationToRequest = (
    visualization: FavoriteDefinition,
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
            ...favoriteOptions(visualization),
        },
        layout: {
            Columns: layoutNames(visualization.columns),
            Rows: layoutNames(visualization.rows),
            Filter: layoutNames(visualization.filters),
        },
    }
}

export const isPivotTable = (type: string) => type === 'PIVOT_TABLE'

/** The years (series) and periods (category) of a year-over-year favorite, or `null`. */
export const favoriteYearOverYear = (
    visualization: Pick<Dhis2Visualization, 'rows' | 'columns'> & { yearlySeries?: unknown }
): YearOverYearSelection | null => {
    const years = Array.isArray(visualization.yearlySeries)
        ? visualization.yearlySeries.filter((year): year is string => typeof year === 'string')
        : []
    const periods = [...(visualization.rows ?? []), ...(visualization.columns ?? [])].find(
        ({ dimension }) => dimension === 'pe'
    )
    const category = (periods?.items ?? []).map(({ id }) => id).join(';')
    return years.length && category ? { years, category } : null
}

/**
 * A year-over-year favorite's axes as the chart engine reads them with one response per
 * year: no series axis, the periods as category, everything else as filters.
 */
export const yearOverYearAxes = <T extends Dhis2Axes>(visualization: T): T => {
    const all = [
        ...(visualization.columns ?? []),
        ...(visualization.rows ?? []),
        ...(visualization.filters ?? []),
    ]
    return {
        ...visualization,
        columns: [],
        rows: all.filter(({ dimension }) => dimension === 'pe'),
        filters: all.filter(({ dimension }) => dimension !== 'pe'),
    }
}

const OUTLIER_METHODS: Record<string, OutlierParams['algorithm']> = {
    STANDARD_Z_SCORE: 'Z_SCORE',
    Z_SCORE: 'Z_SCORE',
    MODIFIED_Z_SCORE: 'MODIFIED_Z_SCORE',
}

/**
 * The outlier detection request of an outlier table favorite, or `null` when its method
 * has no analytics counterpart (IQR) or it misses data, periods or org units.
 */
export const favoriteOutlierParams = (
    visualization: FavoriteDefinition,
    displayProperty: DisplayProperty = 'NAME'
): OutlierParams | null => {
    const analysis =
        typeof visualization.outlierAnalysis === 'object' && visualization.outlierAnalysis
            ? (visualization.outlierAnalysis as Record<string, unknown>)
            : {}
    const method = typeof analysis.outlierMethod === 'string' ? analysis.outlierMethod : undefined
    const algorithm = method ? OUTLIER_METHODS[method] : DEFAULT_OUTLIER_OPTIONS.algorithm
    if (!algorithm) return null
    const number = (value: unknown, fallback: number) =>
        typeof value === 'number' && value > 0 ? value : fallback
    return outlierParamsFromQuery(visualizationToRequest(visualization, displayProperty).params, {
        ...DEFAULT_OUTLIER_OPTIONS,
        algorithm,
        threshold: number(analysis.thresholdFactor, DEFAULT_OUTLIER_OPTIONS.threshold),
        maxResults: number(analysis.maxResults, DEFAULT_OUTLIER_OPTIONS.maxResults),
    })
}

/** The layer kind of a map view: `thematic1` -> `thematic`. */
export const layerKind = (view: Pick<Dhis2MapView, 'layer'>) => view.layer.replace(/\d+$/, '')
