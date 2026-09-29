import type { DataItemTypeOption, DataSetMetric } from '../types/dataItem.types'

export const DATA_ITEM_TYPES: DataItemTypeOption[] = [
    { label: 'All Types', value: 'dataItems' },
    { label: 'Indicator', value: 'indicators' },
    { label: 'Data Element', value: 'dataElements' },
    { label: 'Data Set', value: 'dataSets' },
    { label: 'Event Data Item', value: 'Event Data Item' },
    { label: 'Program Indicator', value: 'Program Indicator' },
    { label: 'Calculation', value: 'Calculation' },
]

export const DATA_SET_METRICS: Array<{ label: string; value: DataSetMetric }> = [
    { label: 'Reporting Rate', value: 'REPORTING_RATE' },
    { label: 'Reporting Rate on Time', value: 'REPORTING_RATE_ON_TIME' },
    { label: 'Actual Reports', value: 'ACTUAL_REPORTS' },
    { label: 'Expected Reports', value: 'EXPECTED_REPORTS' },
]

export const PAGE_SIZE = 50
