import { useDataQuery } from '@dhis2/app-runtime';

export const useSystemInfoData = () => {
    const query = {
        systemInfo: {
            resource: 'system/info',
        },
    };

    const { data, loading, error, refetch } = useDataQuery(query);

    return { data, loading, error, refetch };
}
