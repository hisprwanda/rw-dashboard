import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { fetchNotifications } from '../services/navigationService'
import { navigationKeys } from './queryKeys'

const FIVE_MINUTES = 5 * 60 * 1000

/** Unread interpretations and messages, refreshed every few minutes. */
export const useNotifications = () => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: navigationKeys.notifications(),
        queryFn: ({ signal }) => fetchNotifications(engine, signal),
        refetchInterval: FIVE_MINUTES,
    })
}
