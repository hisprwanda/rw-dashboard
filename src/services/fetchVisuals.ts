import { useDataMutation, useDataQuery } from '@dhis2/app-runtime';

export const useFetchVisualsData = ()=>{

    const query = {
        dataStore: {
            resource: 'dataStore/rw-visuals',
            params: () => ({
              fields: '.',
            }),
        },
    };

    const { data, loading, error ,isError,refetch} = useDataQuery(query);

    return { data, loading, error,isError,refetch };

}