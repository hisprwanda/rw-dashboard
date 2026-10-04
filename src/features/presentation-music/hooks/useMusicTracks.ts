import { useConfig, useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { musicService } from '../services/musicService'
import { musicKeys } from './queryKeys'

/** Uploaded background tracks (with the URL of each audio file). */
export const useMusicTracks = () => {
    const engine = useDataEngine()
    const { baseUrl } = useConfig()
    return useQuery({
        queryKey: musicKeys.list(baseUrl),
        queryFn: ({ signal }) => musicService.list(engine, baseUrl, signal),
        staleTime: 5 * 60 * 1000,
    })
}
