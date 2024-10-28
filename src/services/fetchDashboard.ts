import { useDataQuery } from '@dhis2/app-runtime';


export const useFetchSingleDashboardData = (dashboardId: string) => {

  // Return default values if no dashboardId
  if (!dashboardId) {
    return { data: null, loading: false, error: null, isError: false, refetch: () => {} };
  }

  // Define the query
  const query = {
    dataStore: {
      resource: `dataStore/rw-dashboard/${dashboardId}`,
    },
  };

  // Fetch data using useDataQuery
  const { data, loading, error, refetch } = useDataQuery(query);

  // Return the query result and other metadata
  return {
    data,
    loading,
    error,
    isError: !!error,
    refetch,
  };
};
export const useDashboardsData = ()=>{

    const query = {
        dataStore: {  
            resource: 'dataStore/rw-dashboard',
            params: () => ({
              fields: '.',
            }),
        },
    };

    const { data, loading, error ,isError,refetch} = useDataQuery(query);

    return { data, loading, error,isError,refetch };

}
