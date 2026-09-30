import { useMemo } from 'react'
import { useDisplayProperty } from '@/features/auth'
import { SavedMapView, type BasemapType } from '@/features/maps'
import type { InstanceConnection } from '@/shared/api'
import { LoadingState } from '@/shared/components'
import { useDhis2Map } from '../hooks/useDhis2Objects'
import type { Dhis2Map } from '../types/dhis2Object.types'
import { mapToThematic } from '../utils/favoriteRequest'
import { Dhis2ImageView } from './Dhis2ImageView'
import { Dhis2ObjectError } from './Dhis2ObjectError'

const basemapOf = (map: Dhis2Map): BasemapType | undefined => {
    const id = typeof map.basemap === 'string' ? map.basemap : map.basemap?.id
    if (id === 'openStreetMap') return 'osm-detailed'
    if (id === 'osmLight') return 'osm-light'
    return undefined
}

interface Dhis2NativeMapProps {
    instance: InstanceConnection
    /** Data source of the item, handed to the map view that resolves it again. */
    dataSourceId: string
    objectId: string
    name: string
}

/**
 * A Maps favorite drawn by this app when it is a single thematic layer; other maps
 * (events, facilities, Earth Engine, several layers) show DHIS2's image.
 */
export const Dhis2NativeMap = ({ instance, dataSourceId, objectId, name }: Dhis2NativeMapProps) => {
    const displayProperty = useDisplayProperty()
    const map = useDhis2Map(instance, objectId)
    const thematic = useMemo(
        () => (map.data ? mapToThematic(map.data, displayProperty) : null),
        [map.data, displayProperty]
    )

    if (map.error) return <Dhis2ObjectError error={map.error} />
    if (!map.data) return <LoadingState />
    if (!thematic) {
        return (
            <Dhis2ImageView instance={instance} objectType="map" objectId={objectId} name={name} />
        )
    }
    return (
        <div className="h-full w-full">
            <SavedMapView
                geoFeaturesQuery={thematic.geoFeaturesQuery}
                analyticsQuery={thematic.analyticsQuery}
                basemap={basemapOf(map.data)}
                settings={thematic.settings}
                dataSourceId={dataSourceId}
            />
        </div>
    )
}
