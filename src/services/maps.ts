import { useDataQuery } from '@dhis2/app-runtime';

export const useMapData = () => {
    const query = {
        maps: {
            resource: 'maps',
            params: {
                fields: 'id,name,createdBy',
                paging: false,
            },
        },
    };

    const { data, loading, error, isError, refetch } = useDataQuery(query);

    return { data: data?.maps, loading, error, isError, refetch };
};
