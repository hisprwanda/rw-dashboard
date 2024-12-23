import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthorities } from '../context/AuthContext';
import { dimensionItemTypesTYPES } from '../types/dimensionDataItemTypes';

export const useExternalDataItems = () => {
    const { setDataItemsData } = useAuthorities();
    const [response, setResponse] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Helper function to build API path and params
    const buildApiPathAndParams = useCallback(
        (dimensionType: string, searchItem?: string, dataItemsDataPage: number = 1) => {
            const commonParams = {
                fields: 'id,displayName~rename(name),dimensionItemType,expression',
                order: 'displayName:asc',
                pageSize: 50,
                page: dataItemsDataPage,
                filter: searchItem ? `displayName:ilike:${searchItem}` : undefined,
            };

            switch (dimensionType) {
                case 'dataItems':
                    return { path: 'dataItems.json', params: commonParams };
                case 'indicators':
                    return { path: 'indicators.json', params: { ...commonParams } };
                case 'dataElements':
                    return {
                        path: 'dataElements.json',
                        params: {
                            ...commonParams,
                            filter: [
                                `domainType:eq:AGGREGATE`,
                                searchItem && `displayName:ilike:${searchItem}`,
                            ].filter(Boolean).join(','),
                        },
                    };
                case 'dataSets':
                    return { path: 'dataSets.json', params: commonParams };
                case 'Event Data Item':
                    return {
                        path: 'dataItems.json',
                        params: {
                            ...commonParams,
                            filter: [
                                `dimensionItemType:in:[PROGRAM_DATA_ELEMENT,PROGRAM_ATTRIBUTE]`,
                                searchItem && `displayName:ilike:${searchItem}`,
                            ].filter(Boolean).join(','),
                        },
                    };
                case 'Program Indicator':
                    return {
                        path: 'dataItems.json',
                        params: {
                            ...commonParams,
                            filter: [
                                `dimensionItemType:eq:PROGRAM_INDICATOR`,
                                searchItem && `displayName:ilike:${searchItem}`,
                            ].filter(Boolean).join(','),
                        },
                    };
                case 'Calculation':
                    return {
                        path: 'dataItems.json',
                        params: {
                            ...commonParams,
                            filter: [
                                `dimensionItemType:eq:EXPRESSION_DIMENSION_ITEM`,
                                searchItem && `displayName:ilike:${searchItem}`,
                            ].filter(Boolean).join(','),
                        },
                    };
                default:
                    return { path: '', params: {} };
            }
        },
        []
    );

    // Fetch external data items
    const fetchExternalDataItems = useCallback(
        async (
            url: string,
            token: string,
            selectedDimensionItemType: dimensionItemTypesTYPES,
            searchItem?: string,
            dataItemsDataPage: number = 1
        ) => {
            const { value } = selectedDimensionItemType;
            const { path, params } = buildApiPathAndParams(value, searchItem, dataItemsDataPage);

            if (!path) {
                setError('Invalid dimension item type selected.');
                return;
            }

            setLoading(true);
            setError(null);
            setResponse(null);

            try {
                const res = await axios.get(`${url}/api/40/${path}`, {
                    headers: {
                        Authorization: `ApiToken ${token}`,
                    },
                    params,
                });

                setResponse(res.data);
                setDataItemsData(res.data); // Update context state
            } catch (err: any) {
                setError(err.response?.statusText || err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        },
        [buildApiPathAndParams, setDataItemsData]
    );

    return { response, error, loading, fetchExternalDataItems };
};
