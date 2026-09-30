import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '../services/authService'
import { authKeys } from './queryKeys'

/** The signed-in user. Fetched once per session; every consumer shares the cache. */
export const useMe = () => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: authKeys.me(),
        queryFn: ({ signal }) => fetchMe(engine, signal),
        staleTime: Infinity,
    })
}
