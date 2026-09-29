import 'leaflet/dist/leaflet.css'
import i18n from '@dhis2/d2-i18n'
import type { Feature } from 'geojson'
import L, { type PathOptions } from 'leaflet'
import { useEffect, useMemo } from 'react'
import { GeoJSON, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import type { AnalyticsMetaData, AnalyticsResponse } from '@/shared/types/dhis2.types'
import { basemaps } from '../constants/basemaps'
import type { BasemapType, GeoFeature, MapLabelKind, MapSettings } from '../types/map.types'
import {
    buildAutoLegend,
    colorForValue,
    escapeHtml,
    toFeatureCollection,
    valuesByOrgUnit,
    type ThematicCollection,
    type ThematicFeature,
} from '../utils/thematic'
import { MapLegend } from './MapLegend'

interface ThematicMapProps {
    geoFeatures: readonly GeoFeature[]
    data: AnalyticsResponse | undefined
    metaData?: Partial<AnalyticsMetaData>
    basemap: BasemapType
    settings: MapSettings
    title?: string
    /** Small views (dashboard tiles): the legend starts collapsed. */
    compact?: boolean
}

/**
 * Zooms to the areas whenever they change, and again when the container is resized
 * (dashboard tiles get their final size after Leaflet has measured them).
 */
const FitBounds = ({ collection }: { collection: ThematicCollection }) => {
    const map = useMap()
    useEffect(() => {
        const fit = () => {
            map.invalidateSize()
            if (!collection.features.length) return
            const bounds = L.geoJSON(collection).getBounds()
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20], maxZoom: 12 })
        }
        fit()
        const observer = new ResizeObserver(fit)
        observer.observe(map.getContainer())
        return () => observer.disconnect()
    }, [map, collection])
    return null
}

/** Leaflet types features loosely: read our numeric value back safely. */
const valueOf = (feature?: Feature): number | null => {
    const value: unknown = feature?.properties?.value
    return typeof value === 'number' ? value : null
}

const itemNames = (metaData: Partial<AnalyticsMetaData> | undefined, dimension: string) =>
    (metaData?.dimensions?.[dimension] ?? [])
        .map((id) => metaData?.items?.[id]?.name ?? id)
        .join(', ')

const labelHtml = (
    kinds: readonly MapLabelKind[],
    feature: ThematicFeature,
    dataName: string,
    periodName: string
) => {
    const { name, value } = feature.properties
    const parts: Record<MapLabelKind, string> = {
        area: name,
        data: dataName,
        period: periodName,
        value: value === null ? i18n.t('No data') : String(value),
    }
    return kinds
        .map((kind) => parts[kind])
        .filter(Boolean)
        .map(escapeHtml)
        .join('<br/>')
}

/** A choropleth of one data item over org-unit boundaries, with labels and a legend. */
export const ThematicMap = ({
    geoFeatures,
    data,
    metaData,
    basemap,
    settings,
    title,
    compact = false,
}: ThematicMapProps) => {
    const layer = basemaps()[basemap] ?? basemaps()['osm-light']
    const meta = metaData ?? data?.metaData
    const dataName = itemNames(meta, 'dx')
    const periodName = itemNames(meta, 'pe')

    const collection = useMemo(
        () => toFeatureCollection(geoFeatures, valuesByOrgUnit(data)),
        [geoFeatures, data]
    )
    const classes = useMemo(() => {
        const custom = settings.legendType === 'dhis2' ? settings.legend.legends : undefined
        if (custom?.length) return custom
        const values = collection.features.flatMap((f) =>
            f.properties.value === null ? [] : [f.properties.value]
        )
        return buildAutoLegend(values, [
            i18n.t('Very low'),
            i18n.t('Low'),
            i18n.t('Medium'),
            i18n.t('High'),
            i18n.t('Very high'),
        ])
    }, [collection, settings.legendType, settings.legend.legends])

    // GeoJSON styles and popups are only applied on mount: remount when they change.
    const layerKey = useMemo(
        () => JSON.stringify([collection.features.map((f) => f.properties), classes]),
        [collection, classes]
    )

    const style = (feature?: Feature): PathOptions => ({
        fillColor: colorForValue(valueOf(feature), classes),
        fillOpacity: 0.75,
        weight: 1,
        color: '#ffffff',
        opacity: 1,
    })

    const labels = settings.appliedLabels

    return (
        <div className="relative h-full w-full">
            {title && (
                <div className="absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded bg-white/90 px-4 py-1 text-lg font-bold text-gray-800 shadow">
                    {title}
                </div>
            )}
            <MapContainer center={[0, 20]} zoom={3} zoomAnimation={false} className="h-full w-full">
                <TileLayer key={basemap} url={layer.url} attribution={layer.attribution} />
                <FitBounds collection={collection} />
                <GeoJSON
                    key={layerKey}
                    data={collection}
                    style={style}
                    onEachFeature={(feature: ThematicFeature, leafletLayer) => {
                        const value = feature.properties.value
                        leafletLayer.bindPopup(
                            [
                                `<strong>${escapeHtml(feature.properties.name)}</strong>`,
                                escapeHtml(dataName),
                                escapeHtml(periodName),
                                escapeHtml(
                                    `${i18n.t('Value')} ${value === null ? i18n.t('No data') : value}`
                                ),
                            ]
                                .filter(Boolean)
                                .join('<br/>')
                        )
                    }}
                />
                {labels.length > 0 &&
                    collection.features.map((feature) => (
                        <Marker
                            key={`${feature.properties.id}-${labels.join()}`}
                            position={L.geoJSON(feature).getBounds().getCenter()}
                            interactive={false}
                            icon={L.divIcon({
                                className: 'bg-transparent border-0',
                                html: `<div style="font-size:12px;text-align:center;white-space:nowrap;transform:translate(-50%,-50%);display:inline-block">${labelHtml(labels, feature, dataName, periodName)}</div>`,
                                iconSize: [0, 0],
                            })}
                        />
                    ))}
            </MapContainer>
            <MapLegend
                title={
                    settings.legendType === 'dhis2' && settings.legend.name
                        ? settings.legend.name
                        : i18n.t('Legend')
                }
                classes={classes}
                defaultOpen={!compact}
            />
            {!collection.features.length && (
                <div className="absolute bottom-6 left-6 z-[1000] rounded bg-white/90 p-2 text-sm shadow">
                    {i18n.t('No areas to show')}
                </div>
            )}
        </div>
    )
}
