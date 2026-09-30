// The platform's plugin host (iframe + post-robot), as used by the official Dashboard app.
import { Plugin } from '@dhis2/app-runtime/experimental'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMe } from '@/features/auth'
import type { InstanceConnection } from '@/shared/api'
import { LoadingState } from '@/shared/components'
import { useDhis2Map, useDhis2Visualization } from '../hooks/useDhis2Objects'
import type { Dhis2ObjectType } from '../types/dhis2Object.types'
import { Dhis2NativeMap } from './Dhis2NativeMap'
import { Dhis2NativeVisualization } from './Dhis2NativeVisualization'
import { Dhis2ObjectError } from './Dhis2ObjectError'

const CURRENT_INSTANCE: InstanceConnection = { isCurrentInstance: true }

/**
 * How long a plugin may stay silent. A plugin asks for its props as soon as it starts; a
 * frame the server refuses to be embedded in (CSP `frame-ancestors`, e.g. an app served
 * from another origin) never does, and would otherwise stay blank.
 */
export const PLUGIN_HANDSHAKE_MS = 20_000

/** `true` once the iframe inside `container` has posted a message; `false` after the timeout. */
const usePluginHandshake = (active: boolean) => {
    const container = useRef<HTMLDivElement>(null)
    const [alive, setAlive] = useState<boolean | undefined>(undefined)
    useEffect(() => {
        if (!active) return undefined
        const onMessage = (event: MessageEvent) => {
            const frame = container.current?.querySelector('iframe')
            if (frame && event.source === frame.contentWindow) setAlive(true)
        }
        window.addEventListener('message', onMessage)
        const timer = setTimeout(() => setAlive((current) => current ?? false), PLUGIN_HANDSHAKE_MS)
        return () => {
            window.removeEventListener('message', onMessage)
            clearTimeout(timer)
        }
    }, [active])
    return { container, silent: alive === false }
}

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
    const handshake = usePluginHandshake(!!definition && !failed)

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

    if (failed || handshake.silent) {
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
        <div ref={handshake.container} className="h-full w-full">
            <Plugin
                pluginSource={pluginSource}
                width="100%"
                height="100%"
                className="block h-full w-full"
                {...pluginProps}
            />
        </div>
    )
}
