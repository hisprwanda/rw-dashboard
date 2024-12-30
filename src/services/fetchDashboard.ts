import { useDataQuery } from '@dhis2/app-runtime';


export const useFetchSingleDashboardData = (dashboardId: string) => {

  // Return default values if no dashboardId
  if (!dashboardId) {
    return { data: null, loading: false, error: null, isError: false, refetch: () => {} };
  }

  // Define the query
  const query = {
    dataStore: {
      resource: `dataStore/${process.env.REACT_APP_DASHBOARD_STORE}/${dashboardId}`,
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




export const useDashboardsData = () => {
  const query = {
      dataStore: {
          resource: `dataStore/${process.env.REACT_APP_DASHBOARD_STORE}`,
          params: () => ({
              fields: '.',
              paging: false,
          }),
      },
  };

  const { data, loading, error, isError, refetch } = useDataQuery(query);

  // Sort the entries based on `updatedAt` in descending order
  const sortedData = data?.dataStore?.entries?.sort(
      (a, b) => b.value.updatedAt - a.value.updatedAt
  );

  return { data: { ...data, dataStore: { ...data?.dataStore, entries: sortedData } }, loading, error, isError, refetch };
};

