import type {
    AnalyticsLayout,
    AnalyticsParams,
    DisplayProperty,
    OrgUnitRequestInput,
    StoredAnalyticsQuery,
} from '../types/analytics.types'
import { applyLayout } from './layout'
import { buildOrgUnitDimension } from './orgUnitDimension'

export interface AnalyticsRequestInput {
    /** Formatted dimensions, e.g. `['dx:a;b', 'pe:LAST_12_MONTHS']`. */
    dimension: readonly string[] | undefined
    layout?: AnalyticsLayout
    /** Required for charts and tables (org units go in the filter). */
    orgUnit?: OrgUnitRequestInput
    /** Maps: periods go in the filter and the org units become a dimension. */
    map?: { periodFilter: string; orgUnitDimension: string }
    /** Names or short names in the response (the user's analytics setting). */
    displayProperty?: DisplayProperty
}

export interface AnalyticsRequest {
    /** Params sent to fetch the data (layout applied). */
    dataParams: AnalyticsParams
    /** Params sent to fetch the metadata (names, dimension items). */
    metadataParams: AnalyticsParams
    /** What is saved with a visual: the query before the layout is applied. */
    storedQuery: StoredAnalyticsQuery
    /** What is saved with a map (maps only). */
    storedMapQuery?: StoredAnalyticsQuery
}

const hasItems = (value: string | undefined, prefix: string) =>
    !!value?.startsWith(`${prefix}:`) && value.slice(prefix.length + 1).trim().length > 0

/**
 * Turns the builder's selections into analytics requests.
 * Returns `null` when the request is incomplete (no data, period or org unit).
 */
export const buildAnalyticsRequest = ({
    dimension = [],
    layout,
    orgUnit,
    map,
    displayProperty = 'NAME',
}: AnalyticsRequestInput): AnalyticsRequest | null => {
    const filter = map ? map.periodFilter : orgUnit ? buildOrgUnitDimension(orgUnit) : ''

    const hasData = dimension.some((d) => hasItems(d, 'dx'))
    const hasPeriod = map ? hasItems(filter, 'pe') : dimension.some((d) => hasItems(d, 'pe'))
    const hasOrgUnit = map ? true : hasItems(filter, 'ou')
    if (!hasData || !hasPeriod || !hasOrgUnit) return null

    const fullDimension = map ? [...dimension, map.orgUnitDimension] : [...dimension]
    const base: AnalyticsParams = { dimension: fullDimension, filter, displayProperty }
    const original: AnalyticsParams = { ...base, includeNumDen: true }

    const labelsParams: AnalyticsParams = {
        ...original,
        skipMeta: false,
        skipData: true,
        includeMetadataDetails: true,
    }

    return {
        dataParams: map
            ? { ...base, skipData: false, skipMeta: true }
            : applyLayout(original, layout),
        metadataParams: map
            ? { ...base, skipMeta: false, skipData: true, includeMetadataDetails: true }
            : labelsParams,
        storedQuery: {
            myData: { resource: 'analytics', params: original },
            MetaDataLabels: { resource: 'analytics', params: labelsParams },
        },
        storedMapQuery: map ? { myData: { resource: 'analytics', params: original } } : undefined,
    }
}
