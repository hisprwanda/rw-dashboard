import type { OrgUnitSelectionState } from '@/features/org-units'
import type {
    AnalyticsDimensions,
    DisplayProperty,
    SelectedDataSource,
} from '../types/analytics.types'
import type { SelectionState } from '../store/selectionSlice'
import { buildAnalyticsRequest, type AnalyticsRequest } from './buildAnalyticsRequest'
import { formatAnalyticsDimensions } from './dimensions'

/**
 * The analytics request of a chart builder, from its Redux selection and org-unit
 * selection. `null` while data, period or org unit is missing.
 */
export const buildSelectionRequest = (
    selection: Pick<SelectionState, 'dimensions' | 'layout'>,
    orgUnits: OrgUnitSelectionState,
    displayProperty: DisplayProperty = 'NAME'
): AnalyticsRequest | null =>
    buildAnalyticsRequest({
        dimension: formatAnalyticsDimensions(selection.dimensions),
        layout: selection.layout,
        displayProperty,
        orgUnit: {
            useCurrentUserOrgUnits: orgUnits.useCurrentUserOrgUnits,
            userOrgUnitScope: orgUnits.userOrgUnitScope,
            orgUnitIds: orgUnits.selectedOrgUnitIds,
            levelIds: orgUnits.selectedLevelIds,
            groupIds: orgUnits.selectedGroupIds,
        },
    })

/** One analytics request against one data source. */
export interface SourceRequest {
    instance: SelectedDataSource
    request: AnalyticsRequest
}

/** The requests of a builder whose data items may come from several data sources. */
export interface SelectionRuns {
    /** The request with every data item: what the chart lays out and what gets saved. */
    request: AnalyticsRequest
    /** One request per data source, each with that source's data items only. */
    parts: SourceRequest[]
    /** Every data item, in the order of the selection. */
    dataOrder: string[]
}

type MultiSourceSelection = Pick<
    SelectionState,
    'dimensions' | 'layout' | 'dataSource' | 'additionalSources'
>

/** Why data items of additional sources cannot be combined with the current selection. */
export type MultiSourceIssue = 'dataInFilter' | 'dynamicDimensions'

const hasAdditionalItems = (selection: Pick<SelectionState, 'additionalSources'>) =>
    selection.additionalSources.some(({ items }) => items.length > 0)

/**
 * Additional sources only share periods and org units: data must be on columns or rows
 * (values of different instances cannot be aggregated together) and dimensions specific
 * to the main instance (categories, group sets…) are not available.
 */
export const multiSourceIssues = (selection: MultiSourceSelection): MultiSourceIssue[] => {
    if (!hasAdditionalItems(selection)) return []
    const issues: MultiSourceIssue[] = []
    if (selection.layout.Filter.includes('Data')) issues.push('dataInFilter')
    const dynamic = Object.entries(selection.dimensions).some(
        ([id, items]) => !['dx', 'pe', 'ou'].includes(id) && items.length > 0
    )
    if (dynamic) issues.push('dynamicDimensions')
    return issues
}

/**
 * The requests of a builder: the combined request plus one request per data source.
 * A data item picked from several sources is only read from the first one. `null` while
 * data, period or org unit is missing.
 */
export const buildSelectionRuns = (
    selection: MultiSourceSelection,
    orgUnits: OrgUnitSelectionState,
    displayProperty: DisplayProperty = 'NAME'
): SelectionRuns | null => {
    const primary = selection.dimensions.dx ?? []
    const claimed = new Set(primary)
    const additional = selection.additionalSources.map(({ dataSource, items }) => {
        const ids = items.map(({ id }) => id).filter((id) => !claimed.has(id))
        ids.forEach((id) => claimed.add(id))
        return { instance: dataSource, ids }
    })
    const dataOrder = [...claimed]

    const withData = (dimensions: AnalyticsDimensions, dx: string[]) =>
        buildSelectionRequest(
            { ...selection, dimensions: { ...dimensions, dx } },
            orgUnits,
            displayProperty
        )

    const request = withData(selection.dimensions, dataOrder)
    if (!request) return null

    const parts: SourceRequest[] = []
    for (const { instance, ids, dimensions } of [
        { instance: selection.dataSource, ids: primary, dimensions: selection.dimensions },
        // Additional sources only share the periods (and the org units).
        ...additional.map((source) => ({
            ...source,
            dimensions: { pe: selection.dimensions.pe ?? [] },
        })),
    ]) {
        const part = ids.length ? withData(dimensions, ids) : null
        if (part) parts.push({ instance, request: part })
    }
    return { request, parts, dataOrder }
}
