import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthorities } from '../context/AuthContext';
import { dimensionItemTypesTYPES } from '../types/dimensionDataItemTypes';

export const useExternalDataItems = () => {
    const { setDataItemsData, setSubDataItemsData } = useAuthorities();
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
                    return {
                        main: { path: 'dataItems.json', params: commonParams },
                    };
                case 'indicators':
                    return {
                        main: { path: 'indicators.json', params: { ...commonParams } },
                        sub: { path: 'indicatorGroups.json', params: { ...commonParams } }
                    };
                case 'dataElements':
                    return {
                        main: {
                            path: 'dataElements.json',
                            params: {
                                ...commonParams,
                                filter: [
                                    `domainType:eq:AGGREGATE`,
                                    searchItem && `displayName:ilike:${searchItem}`,
                                ].filter(Boolean).join(','),
                            },
                        },
                        sub: {
                            path: 'dataElementGroups.json',
                            params: { ...commonParams }
                        }
                    };
                case 'dataSets':
                    return {
                        main: { path: 'dataSets.json', params: commonParams }
                    };
                case 'Event Data Item':
                    return {
                        main: {
                            path: 'dataItems.json',
                            params: {
                                ...commonParams,
                                filter: [
                                    `dimensionItemType:in:[PROGRAM_DATA_ELEMENT,PROGRAM_ATTRIBUTE]`,
                                    searchItem && `displayName:ilike:${searchItem}`,
                                ].filter(Boolean).join(','),
                            },
                        },
                        sub: {
                            path: 'programs.json',
                            params: { ...commonParams }
                        }
                    };
                case 'Program Indicator':
                    return {
                        main: {
                            path: 'dataItems.json',
                            params: {
                                ...commonParams,
                                filter: [
                                    `dimensionItemType:eq:PROGRAM_INDICATOR`,
                                    searchItem && `displayName:ilike:${searchItem}`,
                                ].filter(Boolean).join(','),
                            },
                        },
                        sub: {
                            path: 'programs.json',
                            params: { ...commonParams }
                        }
                    };
                case 'Calculation':
                    return {
                        main: {
                            path: 'dataItems.json',
                            params: {
                                ...commonParams,
                                filter: [
                                    `dimensionItemType:eq:EXPRESSION_DIMENSION_ITEM`,
                                    searchItem && `displayName:ilike:${searchItem}`,
                                ].filter(Boolean).join(','),
                            },
                        }
                    };
                default:
                    return { main: { path: '', params: {} } };
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
            const apiPaths = buildApiPathAndParams(value, searchItem, dataItemsDataPage);

            if (!apiPaths.main.path) {
                setError('Invalid dimension item type selected.');
                return;
            }

            setLoading(true);
            setError(null);
            setResponse(null);

            try {
                // Fetch main data
                const mainResponse = await axios.get(`${url}/api/40/${apiPaths.main.path}`, {
                    headers: {
                        Authorization: `ApiToken ${token}`,
                    },
                    params: apiPaths.main.params,
                });

                let subResponse = null;
                // Fetch sub data if path exists
                if (apiPaths.sub) {
                    subResponse = await axios.get(`${url}/api/40/${apiPaths.sub.path}`, {
                        headers: {
                            Authorization: `ApiToken ${token}`,
                        },
                        params: apiPaths.sub.params,
                    });
                }

                setResponse(mainResponse.data);
                setDataItemsData(mainResponse.data);
                if (subResponse) {
                    setSubDataItemsData(subResponse.data);
                }
            } catch (err: any) {
                setError(err.response?.statusText || err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        },
        [buildApiPathAndParams, setDataItemsData, setSubDataItemsData]
    );

    return { response, error, loading, fetchExternalDataItems };
};