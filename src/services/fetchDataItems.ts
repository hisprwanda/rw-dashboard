import { useDataQuery } from '@dhis2/app-runtime';

export const useDataItems = (page = 1, PAGE_SIZE = 20) => {
    const query = {
        dataItems: {
            resource: 'dataItems.json',
            params: {
                fields: ['id', 'displayName~rename(name)', 'dimensionItemType', 'expression'],
                order: 'displayName:asc',
                // paging: true,
                pageSize: PAGE_SIZE,
                page,
            },
        },
    };

    const { loading, error, data, refetch } = useDataQuery(query);

    return { loading, error, data, refetch };
};