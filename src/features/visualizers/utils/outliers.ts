import {
    buildOrgUnitDimension,
    parseAnalyticsDimensions,
    type AnalyticsParams,
    type DisplayProperty,
    type SelectionState,
} from '@/features/analytics'
import type { OrgUnitSelectionState } from '@/features/org-units'

/** The outlier detection methods of the analytics API. */
export type OutlierAlgorithm = 'Z_SCORE' | 'MODIFIED_Z_SCORE'

/** Options of the outlier table, named as the `analytics/outlierDetection` API names them. */
export interface OutlierOptions {
    algorithm: OutlierAlgorithm
    /** Values further than this many (modified) z-scores away are outliers. */
    threshold: number
    /** At most 500 (the API limit). */
    maxResults: number
    orderBy: string
    sortOrder: 'ASC' | 'DESC'
}

export const DEFAULT_OUTLIER_OPTIONS: OutlierOptions = {
    algorithm: 'MODIFIED_Z_SCORE',
    threshold: 3,
    maxResults: 500,
    orderBy: 'absdev',
    sortOrder: 'DESC',
}

export const MAX_OUTLIER_RESULTS = 500

/** The columns the outliers can be sorted by with each method (others are refused). */
export const orderByOptions = (algorithm: OutlierAlgorithm): string[] =>
    algorithm === 'Z_SCORE'
        ? ['absdev', 'zscore', 'mean', 'stddev', 'lowerbound', 'upperbound']
        : ['absdev', 'modifiedzscore', 'median', 'medianabsdeviation', 'lowerbound', 'upperbound']

/** The options with another method; a sort column it does not have falls back to deviation. */
export const withAlgorithm = (
    options: OutlierOptions,
    algorithm: OutlierAlgorithm
): OutlierOptions => ({
    ...options,
    algorithm,
    orderBy: orderByOptions(algorithm).includes(options.orderBy) ? options.orderBy : 'absdev',
})

/** Query-string parameters of `GET /api/analytics/outlierDetection`. */
export type OutlierParams = {
    dx: string
    pe: string
    ou: string
    algorithm: OutlierAlgorithm
    threshold: number
    maxResults: number
    orderBy: string
    sortOrder: 'ASC' | 'DESC'
    displayProperty?: DisplayProperty
}

const buildOutlierParamsFrom = (
    dx: readonly string[],
    pe: readonly string[],
    ou: string,
    options: OutlierOptions,
    displayProperty: DisplayProperty = 'NAME'
): OutlierParams | null => {
    if (!dx.length || !pe.length || !ou) return null
    return {
        dx: dx.join(';'),
        pe: pe.join(';'),
        ou,
        algorithm: options.algorithm,
        threshold: options.threshold > 0 ? options.threshold : DEFAULT_OUTLIER_OPTIONS.threshold,
        maxResults: Math.min(Math.max(1, Math.round(options.maxResults)), MAX_OUTLIER_RESULTS),
        orderBy: withAlgorithm(options, options.algorithm).orderBy,
        sortOrder: options.sortOrder,
        displayProperty,
    }
}

/**
 * The outlier detection request of a builder selection: its data elements, periods and
 * org units. `null` while one of them is missing.
 */
export const buildOutlierParams = (
    selection: Pick<SelectionState, 'dimensions'>,
    orgUnits: OrgUnitSelectionState,
    options: OutlierOptions = DEFAULT_OUTLIER_OPTIONS,
    displayProperty: DisplayProperty = 'NAME'
): OutlierParams | null => {
    const dx = selection.dimensions.dx ?? []
    const pe = selection.dimensions.pe ?? []
    const ou = buildOrgUnitDimension({
        useCurrentUserOrgUnits: orgUnits.useCurrentUserOrgUnits,
        userOrgUnitScope: orgUnits.userOrgUnitScope,
        orgUnitIds: orgUnits.selectedOrgUnitIds,
        levelIds: orgUnits.selectedLevelIds,
        groupIds: orgUnits.selectedGroupIds,
    }).replace(/^ou:/, '')
    return buildOutlierParamsFrom(dx, pe, ou, options, displayProperty)
}

/** The outlier detection request of a saved query (its data elements, periods and org units). */
export const outlierParamsFromQuery = (
    params: AnalyticsParams | undefined,
    options: OutlierOptions = DEFAULT_OUTLIER_OPTIONS
): OutlierParams | null => {
    const entries = [...(params?.dimension ?? []), ...[params?.filter ?? []].flat()]
    const dimensions = parseAnalyticsDimensions(entries)
    const ou = dimensions.ou ?? []
    if (!ou.length) return null
    return buildOutlierParamsFrom(
        dimensions.dx ?? [],
        dimensions.pe ?? [],
        ou.join(';'),
        options,
        params?.displayProperty
    )
}
