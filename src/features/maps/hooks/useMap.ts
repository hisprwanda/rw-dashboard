import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery } from '@tanstack/react-query'
import { mapService } from '../services/mapService'
import { mapKeys } from './queryKeys'

/** One saved map; idle while `id` is undefined (new map). */
export const useMap = (id: string | undefined) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: mapKeys.detail(id ?? ''),
        queryFn: id ? ({ signal }) => mapService.get(engine, id, signal) : skipToken,
    })
}
