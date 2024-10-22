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

/// fetch single visual

export const useFetchSingleVisualData = (visualId: string) => {
    // If visualId is missing, return default values to avoid breaking components
    if (!visualId) {
      return { data: null, loading: false, error: null, isError: false, refetch: () => {} };
    }
  
    // Define your query to fetch the single visual data
    const query = {
      dataStore: {
        resource: `dataStore/rw-visuals/${visualId}`,
      },
    };
  
    // Fetch the data using useDataQuery
    const { data, loading, error, refetch } = useDataQuery(query);
  
    // Return all values for use in components
    return { data, loading, error, isError: !!error, refetch };
  };