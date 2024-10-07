import { useDataMutation, useDataQuery } from '@dhis2/app-runtime';

export const useAnalyticsData = ()=>{

const query = {
  results: {
    resource: 'analytics',
    params: {
      dimension: ['dx:QqDhwirgkDy', 'pe:LAST_12_MONTHS']
    }
  }
};


    const { data, loading, error ,isError,refetch} = useDataQuery(query);

    return { data, loading, error,isError,refetch };

}