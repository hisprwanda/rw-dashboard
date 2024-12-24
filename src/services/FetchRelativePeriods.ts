import { useDataMutation, useDataQuery } from '@dhis2/app-runtime';

export const useRelativePeriodsData = ()=>{

const query = {
  results: {
    resource: 'periodTypes/relativePeriodTypes',

  }
};

    const { data, loading, error ,isError,refetch} = useDataQuery(query);

    return { data, loading, error,isError,refetch };

}