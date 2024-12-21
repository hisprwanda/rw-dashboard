import { dimensionItemTypesTYPES } from "../types/dimensionDataItemTypes";



export const dimensionItemTypes: dimensionItemTypesTYPES[] = [
        { label: 'All Types', value: 'dataItems' },
        { label: 'Data Element', value: 'dataElements' },
        { label: 'Indicator', value: 'indicators' },
        { label: 'Data Set', value: 'dataSets'},
        // below uses data items but with difference of filter parameters
        { label: 'Event Data Item', value: 'Event Data Item' },
        { label: 'Program Indicator', value: 'Program Indicator' },
        { label: 'Calculation', value: 'Calculation' }
    ];