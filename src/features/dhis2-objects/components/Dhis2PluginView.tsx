// The platform's plugin host (iframe + post-robot), as used by the official Dashboard app.
import { Plugin } from '@dhis2/app-runtime/experimental'
import { useCallback, useMemo, useState } from 'react'
import { useMe } from '@/features/auth'
import type { InstanceConnection } from '@/shared/api'
import { LoadingState } from '@/shared/components'
import { useDhis2Map, useDhis2Visualization } from '../hooks/useDhis2Objects'
import type { Dhis2ObjectType } from '../types/dhis2Object.types'
import { Dhis2NativeMap } from './Dhis2NativeMap'
import { Dhis2NativeVisualization } from './Dhis2NativeVisualization'
import { Dhis2ObjectError } from './Dhis2ObjectError'

const CURRENT_INSTANCE: InstanceConnection = { isCurrentInstance: true }

interface Dhis2PluginViewProps {
    objectType: Dhis2ObjectType
    objectId: string
    name: string
    dataSourceId: string
    /** `…/dhis-web-data-visualizer/plugin.html` or `…/dhis-web-maps/plugin.html`. */
    pluginSource: string
}

/**
 * A favorite of the current instance drawn by its own app's plugin: exactly as in the
 * official Dashboard app (every chart type, pivot table and map layer). If the plugin
 * fails, the item falls back to this app's drawing.
 */
export const Dhis2PluginView = ({
    objectType,
    objectId,
    name,
    dataSourceId,
    pluginSource,
}: Dhis2PluginViewProps) => {
    const { data: me } = useMe()
    const visualization = useDhis2Visualization(
        objectType === 'visualization' ? CURRENT_INSTANCE : undefined,
        objectId
    )
    const map = useDhis2Map(objectType === 'map' ? CURRENT_INSTANCE : undefined, objectId)
    const definition = objectType === 'map' ? map.data : visualization.data
    const error = objectType === 'map' ? map.error : visualization.error
    const [failed, setFailed] = useState(false)
    const onError = useCallback(() => setFailed(true), [])

    // Same props as the official Dashboard app (dashboard-app IframePlugin).
    const pluginProps = useMemo(
        () => ({
            isVisualizationLoaded: true,
            forDashboard: true,
            displayProperty: me?.settings?.keyAnalysisDisplayProperty ?? 'name',
            visualization: definition,
            onError,
        }),
        [definition, me?.settings?.keyAnalysisDisplayProperty, onError]
    )

    if (failed) {
        return objectType === 'map' ? (
            <Dhis2NativeMap
                instance={CURRENT_INSTANCE}
                dataSourceId={dataSourceId}
                objectId={objectId}
                name={name}
            />
        ) : (
            <Dhis2NativeVisualization instance={CURRENT_INSTANCE} objectId={objectId} name={name} />
        )
    }
    if (error) return <Dhis2ObjectError error={error} />
    if (!definition) return <LoadingState />
    return (
        <Plugin
            pluginSource={pluginSource}
            width="100%"
            height="100%"
            className="block h-full w-full"
            {...pluginProps}
        />
    )
}
