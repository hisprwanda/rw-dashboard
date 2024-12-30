import { useDataMutation, useDataQuery } from '@dhis2/app-runtime';

export const useDataSourceData = ()=>{

    const query = {
        dataStore: {
            resource: `dataStore/${process.env.REACT_APP_DATA_SOURCES_STORE}`,
            params: () => ({
              fields: '.',
            }),
        },
    };

    const { data, loading, error ,isError,refetch} = useDataQuery(query);

    return { data, loading, error,isError,refetch };

}