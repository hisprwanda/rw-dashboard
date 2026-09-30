import { useDataEngine } from '@dhis2/app-runtime'
import { skipToken, useQuery } from '@tanstack/react-query'
import { createInstanceClient, type InstanceConnection } from '@/shared/api'
import { fetchGeoFeatures } from '../services/geoService'
import type { GeoFeaturesParams } from '../types/map.types'
import { mapKeys } from './queryKeys'

const ONE_HOUR = 60 * 60 * 1000

/** Org-unit boundaries; idle while `params` is undefined. Boundaries rarely change. */
export const useGeoFeatures = (
    params: GeoFeaturesParams | undefined,
    instance: InstanceConnection | undefined
) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: mapKeys.geoFeatures(instance, params ?? null),
        queryFn: params
            ? ({ signal }) =>
                  fetchGeoFeatures(createInstanceClient(engine, instance), params, signal)
            : skipToken,
        staleTime: ONE_HOUR,
    })
}
