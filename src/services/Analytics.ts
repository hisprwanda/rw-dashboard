import { useDataMutation, useDataQuery } from '@dhis2/app-runtime';

export const useAnalyticsData = ()=>{

    const query = {
        results: {
          resource: 'analytics',
          params: {
            dimension: [
                'dx:KbO5KK88zA9.uwoCtzFHFa5;KbO5KK88zA9.GrYdkX4Udq3;KbO5KK88zA9.qK9S5pKFtD9',
                'pe:LAST_12_MONTHS'
            ],
          }
        }
      };
      
    const { data, loading, error ,isError,refetch} = useDataQuery(query);

    return { data, loading, error,isError,refetch };

}