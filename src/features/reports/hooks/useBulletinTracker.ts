import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBulletinTracker, type DateRange } from '../services/bulletinService'
import { reportKeys } from './queryKeys'

/** Tracker summaries of one week; idle without a range. */
export const useBulletinTracker = (range: DateRange | null) => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    return useQuery({
        queryKey: reportKeys.tracker(range),
        queryFn: range
            ? ({ signal }) => fetchBulletinTracker(engine, queryClient, range, signal)
            : skipToken,
    })
}
