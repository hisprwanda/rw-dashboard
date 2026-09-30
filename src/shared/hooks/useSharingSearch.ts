import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery } from '@tanstack/react-query'
import { searchSharingCandidates } from '../api/sharingSearch'
import { useDebouncedValue } from './useDebouncedValue'

/** Users and groups matching the (debounced) search text; idle while it is empty. */
export const useSharingSearch = (text: string) => {
    const engine = useDataEngine()
    const key = useDebouncedValue(text.trim(), 400)
    return useQuery({
        queryKey: ['sharingSearch', key],
        queryFn: key ? ({ signal }) => searchSharingCandidates(engine, key, signal) : skipToken,
    })
}
