import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthorities } from '../context/AuthContext';
import { dimensionItemTypesTYPES } from '../types/dimensionDataItemTypes';
import { useConfig } from '@dhis2/app-runtime';


export const useExternalDataItems = () => {
    const { apiVersion } = useConfig();
    const { setDataItemsData, setSubDataItemsData } = useAuthorities();
    const [response, setResponse] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Helper function to build API path and params
    const buildApiPathAndParams = useCallback(
        (dimensionType: string, searchItem?: string, dataItemsDataPage: number = 1, groupsIdOrSubDataItemIds?: string,otherOptions?:string) => {
            const commonParams = {
                fields: 'id,displayName~rename(name),dimensionItemType,expression',
                order: 'displayName:asc',
                pageSize: 50,
                page: dataItemsDataPage,
                paging: true,
            };

            // Add dynamic filter for searchItem
            const filterParams = [];
            if (searchItem) {
                filterParams.push(`displayName:ilike:${searchItem}`);
            }

            switch (dimensionType) {
                case 'dataItems':
                    return {
                        main: { 
                            path: 'dataItems.json',
                            params: { 
                                ...commonParams,
                                ...(filterParams.length > 0 && { filter: filterParams[0] })
                            }
                        },
                    };
                case 'indicators':
                    return {
                        main: {
                            path: 'indicators.json',
                            params: {
                                ...commonParams,
                                ...(groupsIdOrSubDataItemIds && { 
                                    filter: `indicatorGroups.id:eq:${groupsIdOrSubDataItemIds}` 
                                })
                            }
                        },
                        sub: {
                            path: 'indicatorGroups.json',
                            params: { ...commonParams }
                        }
                    };
                    case "dataElements":
                        return {
                            ...(otherOptions === "dataElementOperands"
                                ? {
                                    main: {
                                        path: "dataElementOperands.json",
                                        params: { ...commonParams },
                                    },
                                }
                                : {
                                    main: {
                                        path: "dataElements.json",
                                        params: {
                                            ...commonParams,
                                            filter: groupsIdOrSubDataItemIds
                                                ? `dataElementGroups.id:eq:${groupsIdOrSubDataItemIds}`
                                                : "domainType:eq:AGGREGATE",
                                        },
                                    },
                                }),
                            sub: {
                                path: "dataElementGroups.json",
                                params: { ...commonParams },
                            },
                        };
                    
                case 'dataSets':
                    return {
                        main: {
                            path: 'dataSets.json',
                            params: {
                                ...commonParams,
                                ...(filterParams.length > 0 && { filter: filterParams[0] })
                            }
                        }
                    };
                case 'Event Data Item':
                    return {
                        main: {
                            path: 'dataItems.json',
                            params: {
                                ...commonParams,
                                filter: groupsIdOrSubDataItemIds
                                    ? `programId:eq:${groupsIdOrSubDataItemIds}`
                                    : 'dimensionItemType:in:[PROGRAM_DATA_ELEMENT,PROGRAM_ATTRIBUTE]'
                            }
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
                                filter: groupsIdOrSubDataItemIds
                                    ? `programId:eq:${groupsIdOrSubDataItemIds}`
                                    : 'dimensionItemType:eq:PROGRAM_INDICATOR'
                            }
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
                                filter: 'dimensionItemType:eq:EXPRESSION_DIMENSION_ITEM'
                            }
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
            dataItemsDataPage: number = 1,
            groupsIdOrSubDataItemIds?: string,
            otherOptions?:string
        ) => {
            const { value } = selectedDimensionItemType;
            const apiPaths = buildApiPathAndParams(value, searchItem, dataItemsDataPage, groupsIdOrSubDataItemIds,otherOptions);

            if (!apiPaths.main.path) {
                setError('Invalid dimension item type selected.');
                return;
            }

            setLoading(true);
            setError(null);
            setResponse(null);

            try {
                // Fetch main data
                const mainResponse = await axios.get(`${url}/api/${apiPaths.main.path}`, {
                    headers: {
                        Authorization: `ApiToken ${token}`,
                    },
                    params: apiPaths.main.params
                });

                let subResponse = null;
                // Fetch sub data if path exists
                if (apiPaths.sub) {
                    subResponse = await axios.get(`${url}/api/${apiPaths.sub.path}`, {
                        headers: {
                            Authorization: `ApiToken ${token}`,
                        },
                        params: apiPaths.sub.params
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