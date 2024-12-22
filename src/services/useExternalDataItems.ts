import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthorities } from '../context/AuthContext';
import { dimensionItemTypesTYPES } from '../types/dimensionDataItemTypes';

export const useExternalDataItems = () => {
    const { setDataItemsData } = useAuthorities();
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Helper function to build API path and params
    const buildApiPathAndParams = (dimensionType: string,dataItemsDataPage?:number) => {
        const commonParams = {
            fields: 'id,displayName~rename(name),dimensionItemType,expression',
            order: 'displayName:asc',
            pageSize: 50,
            page: dataItemsDataPage,
        };

        switch (dimensionType) {
            case 'dataItems':
                return { path: 'dataItems.json', params: commonParams };
            case 'indicators':
                return { path: 'indicators.json', params: { ...commonParams } };
            case 'dataElements':
                return {
                    path: 'dataElements.json',
                    params: { ...commonParams, filter: 'domainType:eq:AGGREGATE' },
                };
            case 'dataSets':
                return { path: 'dataSets.json', params: { ...commonParams } };
            case 'Event Data Item':
                return {
                    path: 'dataItems.json',
                    params: {
                        ...commonParams,
                        filter: 'dimensionItemType:in:[PROGRAM_DATA_ELEMENT,PROGRAM_ATTRIBUTE]',
                    },
                };
            case 'Program Indicator':
                return {
                    path: 'dataItems.json',
                    params: {
                        ...commonParams,
                        filter: 'dimensionItemType:eq:PROGRAM_INDICATOR',
                    },
                };
            case 'Calculation':
                return {
                    path: 'dataItems.json',
                    params: {
                        ...commonParams,
                        filter: 'dimensionItemType:eq:EXPRESSION_DIMENSION_ITEM',
                    },
                };
            default:
                return { path: '', params: {} };
        }
    };

    // Fetch external data items
    const fetchExternalDataItems = useCallback(
        async (url: string, token: string, selectedDimensionItemType: dimensionItemTypesTYPES,dataItemsDataPage?:number) => {
            const { value } = selectedDimensionItemType;
            const { path, params } = buildApiPathAndParams(value, dataItemsDataPage);

            if (!path) {
                setError('Invalid dimension item type selected.');
                return;
            }

            setResponse(null);
            setError(null);
            setLoading(true);

            try {
                const res = await axios.get(`${url}/api/40/${path}`, {
                    headers: {
                        Authorization: `ApiToken ${token}`,
                    },
                    params: params,
                });

                setResponse(res.data);
                setDataItemsData(res.data); // Update context state
            } catch (err) {
                setError(err.response?.statusText || err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        },
        [setDataItemsData]
    );

    return { response, error, loading, fetchExternalDataItems };
};
