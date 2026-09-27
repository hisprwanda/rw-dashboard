import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { visualService } from '../services/visualService'
import type { SavedVisualEntry } from '../types/visual.types'
import { visualKeys } from './queryKeys'

const byLastUpdate = (a: SavedVisualEntry, b: SavedVisualEntry) =>
    (b.value.updatedAt ?? 0) - (a.value.updatedAt ?? 0)

/** All saved visualizations, most recently updated first. */
export const useVisuals = () => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: visualKeys.list(),
        queryFn: async ({ signal }) =>
            (await visualService.list(engine, signal)).sort(byLastUpdate),
    })
}
