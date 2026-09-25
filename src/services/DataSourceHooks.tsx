import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
import { env } from '@/shared/constants/env'

export const useDataSourceData = () => {
    const query = {
        dataStore: {
            resource: `dataStore/${env.dataSourcesStore}`,
            params: () => ({
                fields: '.',
            }),
        },
    }

    const { data, loading, error, isError, refetch } = useDataQuery(query)

    return { data, loading, error, isError, refetch }
}
