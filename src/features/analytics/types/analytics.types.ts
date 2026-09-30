import type { UserOrgUnitScope } from '@/features/org-units'

/** Selected items per dimension, e.g. `{ dx: ['abc', 'def'], pe: ['LAST_12_MONTHS'] }`. */
export type AnalyticsDimensions = Record<string, string[]>

/** Human names used in the layout editor. */
export type LayoutDimensionName = 'Data' | 'Period' | 'Organisation unit' | (string & {})

/** Which dimensions go on columns, rows and filter (the "payload determiner"). */
export interface AnalyticsLayout {
    Columns: LayoutDimensionName[]
    Rows: LayoutDimensionName[]
    Filter: LayoutDimensionName[]
}

/** Query-string parameters of `GET /api/analytics`. A type alias (not an interface) so
 * it stays assignable to the engine's parameter map. */
export type AnalyticsParams = {
    dimension?: string[]
    filter?: string | string[]
    displayProperty?: 'NAME' | 'SHORTNAME'
    includeNumDen?: boolean
    skipMeta?: boolean
    skipData?: boolean
    includeMetadataDetails?: boolean
}

/** The org-unit part of a request, as picked in the org-unit modal. */
export interface OrgUnitRequestInput {
    useCurrentUserOrgUnits: boolean
    userOrgUnitScope: UserOrgUnitScope
    orgUnitIds: readonly string[]
    levelIds: ReadonlyArray<string | number>
    groupIds: readonly string[]
}

/** A saved analytics query, as stored in visual/map dataStore entries. */
export interface StoredAnalyticsQuery {
    myData: { resource: 'analytics'; params: AnalyticsParams }
    MetaDataLabels?: { resource: 'analytics'; params: AnalyticsParams }
}

/** The data source picked in a builder: the current instance or a saved external one. */
export type SelectedDataSource = {
    isCurrentInstance: boolean
    instanceName: string
    url?: string
    token?: string
    description?: string
    type?: string
}

/** A dimension item type filter of the Data modal (indicators, data elements…). */
export interface DimensionItemType {
    label: string
    value: string
}

/** A data item picked in the Data modal, kept to restore the modal's selection. */
export interface DataItemRef {
    id: string
    label: string
}
