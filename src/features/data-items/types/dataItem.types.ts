export type DataItemTypeValue =
    | 'dataItems'
    | 'indicators'
    | 'dataElements'
    | 'dataSets'
    | 'Event Data Item'
    | 'Program Indicator'
    | 'Calculation'

export interface DataItemTypeOption {
    label: string
    value: DataItemTypeValue
}

export type Disaggregation = 'totals' | 'details'

export type DataSetMetric =
    | 'REPORTING_RATE'
    | 'REPORTING_RATE_ON_TIME'
    | 'ACTUAL_REPORTS'
    | 'EXPECTED_REPORTS'

export interface DataItemsFilters {
    type: DataItemTypeValue
    search: string
    /** Indicator group, data element group or program id ('' = all). */
    groupId: string
    disaggregation: Disaggregation
    /** Data sets only: '' = all metrics. */
    metric: DataSetMetric | ''
}

export interface DataItem {
    id: string
    name: string
    dimensionItemType?: string
}

export interface DataItemsPage {
    items: DataItem[]
    page: number
    pageCount: number
}

export interface PickerOption {
    label: string
    value: string
}
