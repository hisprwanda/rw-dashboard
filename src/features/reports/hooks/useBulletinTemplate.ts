import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { fetchBulletinTemplate } from '../services/bulletinService'
import { reportKeys } from './queryKeys'

/** The static texts of the bulletin (dataStore). */
export const useBulletinTemplate = () => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: reportKeys.template(),
        queryFn: ({ signal }) => fetchBulletinTemplate(engine, signal),
        staleTime: Infinity,
    })
}
