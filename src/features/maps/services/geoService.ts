import { fetchResource, type DataEngine, type InstanceClient } from '@/shared/api'
import type { LegendSet } from '@/shared/types/dhis2.types'
import type { GeoFeature, GeoFeaturesParams } from '../types/map.types'

/** Boundaries of the org units of an `ou:` dimension (current or external instance). */
export const fetchGeoFeatures = (
    client: InstanceClient,
    params: GeoFeaturesParams,
    signal?: AbortSignal
): Promise<GeoFeature[]> => client.get<GeoFeature[]>('geoFeatures', params, signal)

export const fetchLegendSets = async (
    engine: DataEngine,
    signal?: AbortSignal
): Promise<LegendSet[]> => {
    const response = await fetchResource<{ legendSets?: LegendSet[] }>(
        engine,
        'legendSets',
        { fields: 'id,displayName', paging: false },
        signal
    )
    return response.legendSets ?? []
}

export const fetchLegendSet = (
    engine: DataEngine,
    id: string,
    signal?: AbortSignal
): Promise<LegendSet> =>
    fetchResource<LegendSet>(
        engine,
        `legendSets/${id}`,
        { fields: 'id,displayName,legends[displayName~rename(name),startValue,endValue,color]' },
        signal
    )
