import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthorities } from '../context/AuthContext';

export const useExternalDataItems = () => {
    const { dataItemsData, setDataItemsData } = useAuthorities();
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchExternalDataItems = useCallback(async (url:string, token:string) => {
        setResponse(null);
        setError(null);
        setLoading(true);

        const params = {
            fields: 'id,displayName~rename(name),dimensionItemType,expression',
            order: 'displayName:asc',
            pageSize: 10000,
            page: 1,
        };

        try {
            const res = await axios.get(`${url}/api/40/dataItems.json`, {
                headers: {
                    Authorization: `ApiToken ${token}`,
                },
                params: params,
            });

            setResponse(res.data);
            setDataItemsData(res.data)
        } catch (err) {
            setError(err.response?.statusText || err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    return { response, error, loading, fetchExternalDataItems };
};