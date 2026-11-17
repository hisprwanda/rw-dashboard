import { lazy, Suspense } from 'react'
import { useDisplayProperty } from '@/features/auth'
import type { InstanceConnection } from '@/shared/api'
import { LoadingState } from '@/shared/components'
import { useDhis2Map, useDhis2MapLayers } from '../hooks/useDhis2Objects'
import { isSupportedMap } from '../services/dhis2MapLayersService'
import { Dhis2ImageView } from './Dhis2ImageView'
import { Dhis2ObjectError } from './Dhis2ObjectError'

// The DHIS2 map engine (MapLibre, WebGL) is a large chunk: loaded only when a map shows.
const Dhis2GlMap = lazy(() => import('./Dhis2GlMap'))

interface Dhis2NativeMapProps {
    instance: InstanceConnection
    objectId: string
    name: string
}

/**
 * A Maps favorite drawn by the official DHIS2 map engine: its thematic, org unit and
 * facility layers are loaded from its instance and styled as the DHIS2 Maps app does.
 * Maps with other layers (events, Earth Engine, timelines…) show DHIS2's image.
 */
export const Dhis2NativeMap = ({ instance, objectId, name }: Dhis2NativeMapProps) => {
    const displayProperty = useDisplayProperty()
    const map = useDhis2Map(instance, objectId)
    const supported = !!map.data && isSupportedMap(map.data)
    const layers = useDhis2MapLayers(instance, supported ? map.data : undefined, displayProperty)

    if (map.error) return <Dhis2ObjectError error={map.error} />
    if (!map.data) return <LoadingState />
    if (!supported) {
        return (
            <Dhis2ImageView instance={instance} objectType="map" objectId={objectId} name={name} />
        )
    }
    if (layers.error) return <Dhis2ObjectError error={layers.error} />
    if (!layers.data) return <LoadingState />
    return (
        <Suspense fallback={<LoadingState />}>
            <Dhis2GlMap layers={layers.data} basemap={map.data.basemap} />
        </Suspense>
    )
}
