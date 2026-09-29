import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { mapService } from '../services/mapService'
import type { SavedMapEntry } from '../types/map.types'
import { mapKeys } from './queryKeys'

const byLastUpdate = (a: SavedMapEntry, b: SavedMapEntry) =>
    (b.value.updatedAt ?? 0) - (a.value.updatedAt ?? 0)

/** All saved maps, most recently updated first. */
export const useMaps = () => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: mapKeys.list(),
        queryFn: async ({ signal }) => (await mapService.list(engine, signal)).sort(byLastUpdate),
    })
}
