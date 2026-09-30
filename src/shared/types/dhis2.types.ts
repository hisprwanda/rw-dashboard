/**
 * Shapes of DHIS2 Web API payloads used across features.
 * Only the fields the app actually requests are declared; extend as needed.
 */

export interface IdentifiableObject {
    id: string
    name?: string
    displayName?: string
}

export interface Pager {
    page: number
    pageCount: number
    total: number
    pageSize: number
}

// --- Organisation units -----------------------------------------------------

export interface OrgUnit extends IdentifiableObject {
    level?: number
    path?: string
    parent?: IdentifiableObject
    children?: OrgUnit[]
}

export interface OrgUnitLevel extends IdentifiableObject {
    level: number
}

export type OrgUnitGroup = IdentifiableObject

// --- Current user & system --------------------------------------------------

export interface UserSettings {
    keyUiLocale?: string
    keyDbLocale?: string
    /** Whether analytics show names or short names (`name` | `shortName`). */
    keyAnalysisDisplayProperty?: string
}

export interface Me extends IdentifiableObject {
    username: string
    email?: string
    authorities: string[]
    organisationUnits: OrgUnit[]
    dataViewOrganisationUnits?: OrgUnit[]
    userGroups?: IdentifiableObject[]
    settings?: UserSettings
}

export interface SystemInfo {
    version: string
    revision?: string
    contextPath?: string
    serverDate?: string
    systemName?: string
    instanceBaseUrl?: string
}

// --- Analytics --------------------------------------------------------------

export interface AnalyticsHeader {
    name: string
    column: string
    valueType: string
    type: string
    hidden: boolean
    meta: boolean
}

export interface AnalyticsMetaDataItem {
    name: string
    uid?: string
    code?: string
    dimensionItemType?: string
    valueType?: string
    totalAggregationType?: string
}

export interface AnalyticsMetaData {
    items: Record<string, AnalyticsMetaDataItem>
    dimensions: Record<string, string[]>
}

export interface AnalyticsResponse {
    headers: AnalyticsHeader[]
    rows: string[][]
    metaData: AnalyticsMetaData
    width: number
    height: number
    headerWidth?: number
}

// --- Legends ----------------------------------------------------------------

export interface Legend extends IdentifiableObject {
    startValue: number
    endValue: number
    color: string
}

export interface LegendSet extends IdentifiableObject {
    legends: Legend[]
}

// --- dataStore --------------------------------------------------------------

export interface DataStoreEntry<T> {
    key: string
    value: T
}

/** Response of `GET dataStore/<namespace>?fields=.` */
export interface DataStoreEntriesResponse<T> {
    entries: DataStoreEntry<T>[]
    pager?: Pager
}
