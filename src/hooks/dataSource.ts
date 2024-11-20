import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";


export const useDataSourceData = (): any => {
  const REACT_APP_DataStore = process.env.REACT_APP_DataStore;
  const query = {
    dataStore: {
      resource: "dataStore/"+REACT_APP_DataStore,
      params: () => ({
        fields: ".",
      }),
    },
  };

  const { data, loading, error, isError, refetch } = useDataQuery(query);

  return { data, loading, error, isError, refetch };
};
