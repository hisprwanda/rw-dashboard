/** The DHIS2 favorites this feature can show: Data Visualizer and Maps objects. */
export type Dhis2ObjectType = 'visualization' | 'map'

/** One axis dimension of a favorite (`dx`, `pe`, `ou`, or a category/group set uid). */
export interface Dhis2Dimension {
    dimension: string
    items?: Array<{ id: string; name?: string; dimensionItemType?: string }>
    filter?: string
    legendSet?: { id: string }
}

/** The axes shared by visualizations and map views. */
export interface Dhis2Axes {
    columns?: Dhis2Dimension[]
    rows?: Dhis2Dimension[]
    filters?: Dhis2Dimension[]
}

/**
 * A Data Visualizer object. Only the fields read by this app are typed: the whole object
 * (every option of the favorite) is passed on to the official plugin untouched.
 */
export type Dhis2Visualization = Dhis2Axes & {
    id: string
    name: string
    type: string
    description?: string
    rowTotals?: boolean
    colTotals?: boolean
    hideEmptyRows?: boolean
    hideEmptyColumns?: boolean
    [option: string]: unknown
}

export interface Dhis2Legend {
    name?: string
    startValue: number
    endValue: number
    color: string
}

/** One layer of a map (`thematic1`, `event1`, `facility1`, `earthEngine1`…). */
export type Dhis2MapView = Dhis2Axes & {
    layer: string
    thematicMapType?: string
    legendSet?: { id: string; name?: string; legends?: Dhis2Legend[] }
    [option: string]: unknown
}

/** A Maps object (passed on to the official plugin untouched). */
export type Dhis2Map = {
    id: string
    name: string
    basemap?: string | { id: string }
    mapViews: Dhis2MapView[]
    [option: string]: unknown
}

/** A search result of the picker. */
export interface Dhis2ObjectSummary {
    id: string
    name: string
    objectType: Dhis2ObjectType
    /** Visualization type (`PIVOT_TABLE`, `COLUMN`…) or the map's layer kinds (`thematic,event`). */
    subtype: string
}

export interface Dhis2ObjectPage {
    items: Dhis2ObjectSummary[]
    page: number
    pageCount: number
    total: number
}

/** An installed app of `GET /api/apps` (only what locating a plugin needs). */
export interface InstalledApp {
    key: string
    short_name?: string
    pluginLaunchUrl?: string
}
