import { useDataMutation, useDataQuery } from '@dhis2/app-runtime';

export const useFetchSingleChartApi = (query: any) => {
    if (!query) {

        return { data: null, loading: false, error: "Invalid query", isError: true, refetch: null };
    }

    const { data, loading, error, isError, refetch } = useDataQuery(query);

    return { data, loading, error, isError, refetch };
};
