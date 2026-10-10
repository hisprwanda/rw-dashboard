import MapGL, { poleOfInaccessibility, type MapGLLayer } from '@dhis2/maps-gl'
import { useEffect, useRef, useState } from 'react'
import { ErrorState } from '@/shared/components'
import type { MapLayerData } from '../services/dhis2MapLayersService'
import { basemapConfig } from '../utils/mapBasemap'
import type { MapFeature } from '../utils/mapGeo'
import { MapLegendPanel } from './MapLegendPanel'

/** Bubbles sit on a point inside each area (its pole of inaccessibility). */
const polygonsToPoints = (features: readonly MapFeature[]): MapFeature[] =>
    features.map((feature) => ({
        ...feature,
        geometry: { type: 'Point', coordinates: poleOfInaccessibility(feature.geometry) },
    }))

const labelsOf = ({ label, labelStyle }: MapLayerData) =>
    label && labelStyle ? { label, labelStyle: { ...labelStyle, paddingTop: '10px' } } : {}

/** The engine layer of one map layer, configured as the DHIS2 Maps app does. */
const createLayer = (map: MapGL, layer: MapLayerData, index: number): MapGLLayer => {
    const common = {
        id: layer.id,
        index,
        opacity: layer.opacity,
        isVisible: layer.isVisible,
    }
    if (layer.kind === 'thematic') {
        const choropleth = {
            type: 'choropleth',
            hoverLabel: '{name} ({value})',
            ...labelsOf(layer),
        }
        if (!layer.isBubble)
            return map.createLayer({ ...common, ...choropleth, data: layer.features })
        // Bubble maps: thin area outlines below the bubbles.
        const group = map.createLayer({ ...common, type: 'group' })
        group.addLayer?.({
            type: 'boundary',
            data: layer.features.map((feature) => ({
                ...feature,
                properties: { ...feature.properties, style: { color: '#333333', weight: 0.5 } },
            })),
            style: {},
        })
        group.addLayer?.({ ...choropleth, data: polygonsToPoints(layer.features) })
        return group
    }
    if (layer.kind === 'orgUnit') {
        return map.createLayer({
            ...common,
            type: 'geoJson',
            data: layer.features,
            hoverLabel: '{name}',
            style: {
                color: 'transparent',
                strokeColor: layer.color ?? '#333333',
                ...(layer.radius ? { radius: layer.radius } : {}),
            },
            ...labelsOf(layer),
        })
    }
    const color = layer.color ?? '#333333'
    return map.createLayer({
        ...common,
        type: 'geoJson',
        data: layer.features,
        hoverLabel: '{name}',
        style: { color, strokeColor: '#ffffff', ...(layer.radius ? { radius: layer.radius } : {}) },
        ...labelsOf(layer),
    })
}

interface Dhis2GlMapProps {
    layers: MapLayerData[]
    basemap?: string | { id?: string }
}

/**
 * A DHIS2 map drawn by the official DHIS2 map engine (`@dhis2/maps-gl`, WebGL): its
 * basemap and layers in their saved order, fitted to the data, with the layers' legends.
 */
export default function Dhis2GlMap({ layers, basemap }: Dhis2GlMapProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const element = containerRef.current
        if (!element) return
        let disposed = false
        let map: MapGL | undefined
        try {
            map = new MapGL(element, { attributionControl: true })
        } catch (cause) {
            setError(cause instanceof Error ? cause : new Error(String(cause)))
            return
        }
        const engine = map
        engine.on('ready', () => {
            void (async () => {
                try {
                    for (const [index, layer] of layers.entries()) {
                        if (disposed) return
                        await engine.addLayer(createLayer(engine, layer, index + 1))
                    }
                    if (disposed) return
                    engine.fitBounds(engine.getLayersBounds(), { padding: 20 })
                    // The basemap comes last so the data shows without waiting for its tiles
                    // (the engine keeps it below the data layers).
                    const base = basemapConfig(basemap)
                    if (base) {
                        await engine.addLayer(
                            engine.createLayer({ ...base, id: 'basemap', index: 0 })
                        )
                    }
                } catch (cause) {
                    if (!disposed)
                        setError(cause instanceof Error ? cause : new Error(String(cause)))
                }
            })()
        })
        const observer = new ResizeObserver(() => engine.resize())
        observer.observe(element)
        return () => {
            disposed = true
            observer.disconnect()
            engine.remove()
        }
    }, [layers, basemap])

    if (error) return <ErrorState error={error} />
    return (
        <div className="relative h-full min-h-[200px] w-full">
            {/* MapLibre styles its own element (`position: relative`), so it gets an inner one. */}
            <div className="absolute inset-0">
                <div ref={containerRef} className="h-full w-full" />
            </div>
            <MapLegendPanel
                legends={layers
                    .filter(({ isVisible }) => isVisible)
                    .map(({ id, kind, legend }) => ({ id, kind, legend }))}
            />
        </div>
    )
}
