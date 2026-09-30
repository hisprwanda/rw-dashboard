import i18n from '@dhis2/d2-i18n'
import type { DataItemTypeValue, DataSetMetric } from '../types/dataItem.types'

// Built at render time with literal keys (see periods/utils/labels.ts).

export const dataItemTypeLabel = (type: DataItemTypeValue | string): string => {
    const labels: Record<string, string> = {
        dataItems: i18n.t('All types'),
        indicators: i18n.t('Indicator'),
        dataElements: i18n.t('Data element'),
        dataSets: i18n.t('Data set'),
        'Event Data Item': i18n.t('Event data item'),
        'Program Indicator': i18n.t('Program indicator'),
        Calculation: i18n.t('Calculation'),
    }
    return labels[type] ?? type
}

/** Label of the group filter of a type; `undefined` when the type has no groups. */
export const dataItemGroupLabel = (type: DataItemTypeValue | string): string | undefined =>
    ({
        indicators: i18n.t('Indicator group'),
        dataElements: i18n.t('Data element group'),
        'Event Data Item': i18n.t('Program'),
        'Program Indicator': i18n.t('Program'),
    })[type]

export const dataSetMetricLabel = (metric: DataSetMetric | string): string => {
    const labels: Record<string, string> = {
        REPORTING_RATE: i18n.t('Reporting rate'),
        REPORTING_RATE_ON_TIME: i18n.t('Reporting rate on time'),
        ACTUAL_REPORTS: i18n.t('Actual reports'),
        EXPECTED_REPORTS: i18n.t('Expected reports'),
    }
    return labels[metric] ?? metric
}
