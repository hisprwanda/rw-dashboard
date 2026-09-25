import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { fetchApplicationTitle } from '../services/systemService'
import { systemKeys } from './queryKeys'

/** The instance's application title (System Settings > Appearance). */
export const useApplicationTitle = () => {
    const engine = useDataEngine()
    const { data } = useQuery({
        queryKey: systemKeys.applicationTitle(),
        queryFn: ({ signal }) => fetchApplicationTitle(engine, signal),
        staleTime: Infinity,
    })
    return data ?? ''
}
