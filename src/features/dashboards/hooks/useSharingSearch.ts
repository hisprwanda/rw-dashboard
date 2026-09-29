import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/shared/hooks'
import { searchSharingCandidates } from '../services/dashboardService'
import { dashboardKeys } from './queryKeys'

/** Users and groups matching the (debounced) search text; idle while it is empty. */
export const useSharingSearch = (text: string) => {
    const engine = useDataEngine()
    const key = useDebouncedValue(text.trim(), 400)
    return useQuery({
        queryKey: dashboardKeys.sharingSearch(key),
        queryFn: key ? ({ signal }) => searchSharingCandidates(engine, key, signal) : skipToken,
    })
}
