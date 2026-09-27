import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { dataSourceService } from '../services/dataSourceService'
import { dataSourceKeys } from './queryKeys'

/** All saved external data sources (dataStore entries: `{ key, value }`). */
export const useDataSources = () => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: dataSourceKeys.list(),
        queryFn: ({ signal }) => dataSourceService.list(engine, signal),
    })
}
