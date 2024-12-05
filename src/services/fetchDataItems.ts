import { useEffect } from 'react';
import { useAuthorities } from '../context/AuthContext';
import { useDataQuery } from '@dhis2/app-runtime';


export const useDataItems = () => {
    const { dataItemsData, setDataItemsData } = useAuthorities();

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

    const { loading, error, data, refetch } = useDataQuery(query);

    // Update `dataItemsData` only when `data` changes
    useEffect(() => {
        if (data) {
            setDataItemsData(data);
        }
    }, [data, setDataItemsData]);

    return { loading, error, data, refetch };
};
