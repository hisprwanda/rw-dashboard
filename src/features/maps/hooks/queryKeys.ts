import { instanceKey, type InstanceConnection } from '@/shared/api'
import type { GeoFeaturesParams } from '../types/map.types'

export const mapKeys = {
    all: ['maps'] as const,
    list: () => [...mapKeys.all, 'list'] as const,
    detail: (id: string) => [...mapKeys.all, 'detail', id] as const,
    geoFeatures: (instance: InstanceConnection | undefined, params: GeoFeaturesParams | null) =>
        ['geoFeatures', instanceKey(instance), params] as const,
    legendSets: () => ['legendSets'] as const,
    legendSet: (id: string) => ['legendSets', id] as const,
}
