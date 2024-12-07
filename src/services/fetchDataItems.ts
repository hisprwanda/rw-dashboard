import { useState, useCallback } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { useAuthorities } from '../context/AuthContext';

export const useDataItems = () => {
    const engine = useDataEngine();
    const { setDataItemsData } = useAuthorities();
    // Local state for managing loading, error, and data
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const query = {
        dataItems: {
            resource: 'dataItems.json',
            params: {
                fields: ['id', 'displayName~rename(name)', 'dimensionItemType', 'expression'],
                order: 'displayName:asc',
                pageSize: 10000,
                page: 1,
            },
        },
    };

    // Function to fetch data, only called when explicitly invoked
    const fetchCurrentInstanceData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await engine.query(query);
            setData(result.dataItems);
            setDataItemsData(result.dataItems); // Update context state
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [engine, query, setDataItemsData]);

    return { loading, error, data, fetchCurrentInstanceData };
};
