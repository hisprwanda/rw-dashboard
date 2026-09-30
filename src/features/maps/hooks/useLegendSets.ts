import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery } from '@tanstack/react-query'
import { fetchLegendSet, fetchLegendSets } from '../services/geoService'
import { mapKeys } from './queryKeys'

/** Legend sets of the current instance (names only). */
export const useLegendSets = (enabled = true) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: mapKeys.legendSets(),
        queryFn: enabled ? ({ signal }) => fetchLegendSets(engine, signal) : skipToken,
    })
}

/** One legend set with its classes; idle without an id. */
export const useLegendSet = (id: string | undefined) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: mapKeys.legendSet(id ?? ''),
        queryFn: id ? ({ signal }) => fetchLegendSet(engine, id, signal) : skipToken,
    })
}
