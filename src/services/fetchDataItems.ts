import { useState, useCallback } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { useAuthorities } from '../context/AuthContext';
import { dimensionItemTypesTYPES } from '../types/dimensionDataItemTypes';

export const useDataItems = () => {
    const engine = useDataEngine();
    const { setDataItemsData, selectedDimensionItemType} = useAuthorities();

    // Local state for managing loading, error, and data
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    // Helper function to build the query based on dimension type
    const buildQuery = (dimensionType: string,dataItemsDataPage?:number) => {
        const commonParams = {
            fields: ['id', 'displayName~rename(name)', 'dimensionItemType', 'expression'],
            order: 'displayName:asc',
            pageSize: 50,
            page: dataItemsDataPage ,
            paging: true,
        };

        switch (dimensionType) {
            case 'dataItems':
                return { dataItems: { resource: 'dataItems.json', params: commonParams } };
            case 'indicators':
                return { indicators: { resource: 'indicators.json', params: { ...commonParams, paging: true } } };
            case 'dataElements':
                return {
                    dataElements: {
                        resource: 'dataElements.json',
                        params: { ...commonParams, filter: 'domainType:eq:AGGREGATE', paging: true },
                    },
                };
            case 'dataSets':
                return { dataSets: { resource: 'dataSets.json', params: { ...commonParams, paging: true } } };
            case 'Event Data Item':
                return {
                    dataItems: {
                        resource: 'dataItems',
                        params: {
                            ...commonParams,
                            filter: 'dimensionItemType:in:[PROGRAM_DATA_ELEMENT,PROGRAM_ATTRIBUTE]',
                        },
                    },
                };
            case 'Program Indicator':
                return {
                    dataItems: {
                        resource: 'dataItems',
                        params: {
                            ...commonParams,
                            filter: 'dimensionItemType:eq:PROGRAM_INDICATOR',
                        },
                    },
                };
            case 'Calculation':
                return {
                    dataItems: {
                        resource: 'dataItems',
                        params: {
                            ...commonParams,
                            filter: 'dimensionItemType:eq:EXPRESSION_DIMENSION_ITEM',
                        },
                    },
                };
            default:
                return {};
        }
    };

    // Function to fetch data, only called when explicitly invoked
    const fetchCurrentInstanceData = useCallback(async (selectedDimensionItemType: dimensionItemTypesTYPES,dataItemsDataPage?:number) => {
        const { value } = selectedDimensionItemType;
        const query = buildQuery(value,dataItemsDataPage);

        setLoading(true);
        setError(null);

        try {
            const result = await engine.query(query);
            const dataKey = ['dataItems', 'Event Data Item', 'Program Indicator', 'Calculation'].includes(value) ? 'dataItems' : value;

            const fetchedData = result[dataKey];

            setData(fetchedData);
            setDataItemsData(fetchedData);
        } catch (err) {
            setError(err);d
        } finally {
            setLoading(false);
        }
    }, [engine, setDataItemsData]);

    return { loading, error, data, fetchCurrentInstanceData };
};
