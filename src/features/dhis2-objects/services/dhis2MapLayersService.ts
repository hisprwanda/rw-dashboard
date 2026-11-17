import i18n from '@dhis2/d2-i18n'
import type { DisplayProperty } from '@/features/analytics'
import type { InstanceClient } from '@/shared/api'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import type { Dhis2Map, Dhis2MapView } from '../types/dhis2Object.types'
import { layerKind } from '../utils/favoriteRequest'
import { pointItems, toGeoJson, type GeoFeatureItem, type MapFeature } from '../utils/mapGeo'
import type { MapLegend } from '../utils/mapLegend'
import { styleOrgUnits, type OrgUnitGroupSet } from '../utils/mapOrgUnits'
import {
    isSingleThematic,
    orgUnitParam,
    styleThematic,
    thematicAnalyticsParams,
} from '../utils/mapThematic'

/** The layer kinds drawn by the DHIS2 map engine in this app ("boundary" is the old org unit layer). */
const SUPPORTED_KINDS = ['thematic', 'orgUnit', 'boundary', 'facility']

/** Whether every layer of a map can be drawn here (the others show DHIS2's image). */
export const isSupportedMap = (map: Pick<Dhis2Map, 'mapViews'>) =>
    map.mapViews.length > 0 &&
    map.mapViews.every((view) => {
        const kind = layerKind(view)
        return SUPPORTED_KINDS.includes(kind) && (kind !== 'thematic' || isSingleThematic(view))
    })

export interface LabelStyle {
    fontSize: string
    fontStyle: string
    fontWeight: string
    color: string
}

/** One layer, ready for the DHIS2 map engine. */
export interface MapLayerData {
    id: string
    kind: 'thematic' | 'orgUnit' | 'facility'
    features: MapFeature[]
    legend: MapLegend
    opacity: number
    isVisible: boolean
    isBubble?: boolean
    /** `{name}`, `{name}\n{value}`… when the layer shows labels. */
    label?: string
    labelStyle?: LabelStyle
    /** Line color of org unit boundaries, or the color of facility points. */
    color?: string
    radius?: number
}

const text = (value: unknown) => (typeof value === 'string' && value ? value : undefined)
const number = (value: unknown) => (typeof value === 'number' ? value : undefined)

const labelStyleOf = (view: Dhis2MapView): LabelStyle => {
    const color = text(view.labelFontColor)
    return {
        fontSize: text(view.labelFontSize) ?? '14px',
        fontStyle: text(view.labelFontStyle) ?? 'normal',
        fontWeight: text(view.labelFontWeight) ?? 'normal',
        color: color ? (/^[0-9a-f]{3,6}$/i.test(color) ? `#${color}` : color) : '#333333',
    }
}

const labelsOf = (view: Dhis2MapView, template: string) =>
    view.labels === true ? { label: template, labelStyle: labelStyleOf(view) } : {}

const commonOf = (view: Dhis2MapView, index: number) => ({
    id: `${layerKind(view)}-${index}`,
    opacity: number(view.opacity) ?? 1,
    isVisible: view.hidden !== true,
})

const fetchGeoFeatures = (
    client: InstanceClient,
    orgUnits: string,
    displayProperty: DisplayProperty,
    includeGroupSets: boolean,
    signal?: AbortSignal
) =>
    client.get<GeoFeatureItem[]>(
        'geoFeatures',
        {
            ou: `ou:${orgUnits}`,
            displayProperty,
            ...(includeGroupSets ? { includeGroupSets } : {}),
        },
        signal
    )

const fetchGroupSet = async (
    client: InstanceClient,
    id: string,
    signal?: AbortSignal
): Promise<OrgUnitGroupSet> => {
    const result = await client.get<Omit<OrgUnitGroupSet, 'id'>>(
        `organisationUnitGroupSets/${id}`,
        { fields: 'name,organisationUnitGroups[id,name,color,symbol]' },
        signal
    )
    return { id, name: result.name, organisationUnitGroups: result.organisationUnitGroups ?? [] }
}

const fetchLevelNames = async (client: InstanceClient, signal?: AbortSignal) => {
    const result = await client.get<{
        organisationUnitLevels?: Array<{ level: number; displayName: string }>
    }>('organisationUnitLevels', { fields: 'level,displayName', paging: false }, signal)
    return Object.fromEntries(
        (result.organisationUnitLevels ?? []).map(({ level, displayName }) => [level, displayName])
    )
}

interface LoadOptions {
    displayProperty: DisplayProperty
    /** Base URL of the instance (org unit group symbols are served from it). */
    baseUrl: string
    signal?: AbortSignal
}

const loadThematic = async (
    client: InstanceClient,
    view: Dhis2MapView,
    index: number,
    { displayProperty, signal }: LoadOptions
): Promise<MapLayerData | null> => {
    const params = thematicAnalyticsParams(view, displayProperty)
    if (!params) return null
    const [analytics, geo] = await Promise.all([
        client.get<AnalyticsResponse>('analytics', params, signal),
        fetchGeoFeatures(client, orgUnitParam(view), displayProperty, false, signal),
    ])
    const layer = styleThematic({ view, analytics, features: toGeoJson(geo) })
    return {
        ...commonOf(view, index),
        kind: 'thematic',
        features: layer.features,
        legend: layer.legend,
        isBubble: layer.isBubble,
        ...labelsOf(view, text(view.labelTemplate) ?? '{name}'),
    }
}

const loadOrgUnits = async (
    client: InstanceClient,
    view: Dhis2MapView,
    index: number,
    isFacility: boolean,
    { displayProperty, baseUrl, signal }: LoadOptions
): Promise<MapLayerData | null> => {
    const orgUnits = orgUnitParam(view)
    if (!orgUnits) return null
    const groupSetRef = view.organisationUnitGroupSet as { id?: string } | undefined
    const groupSetId = groupSetRef?.id
    const [geo, groupSet, levelNames] = await Promise.all([
        fetchGeoFeatures(client, orgUnits, displayProperty, !!groupSetId, signal),
        groupSetId ? fetchGroupSet(client, groupSetId, signal) : Promise.resolve(undefined),
        isFacility ? Promise.resolve(undefined) : fetchLevelNames(client, signal),
    ])
    const color = text(view.organisationUnitColor)
    const radius = number(view.radiusLow)
    const layer = styleOrgUnits({
        features: toGeoJson(isFacility ? pointItems(geo) : geo),
        groupSet,
        levelNames,
        styleType: text(view.styleType),
        color,
        radius,
        baseUrl,
        title: isFacility ? i18n.t('Facilities') : i18n.t('Organisation units'),
    })
    return {
        ...commonOf(view, index),
        kind: isFacility ? 'facility' : 'orgUnit',
        features: layer.features,
        legend: layer.legend,
        color,
        radius,
        ...labelsOf(view, '{name}'),
    }
}

/**
 * Loads every layer of a DHIS2 map from its instance, styled as the DHIS2 Maps app does,
 * in the map's layer order (first = bottom).
 */
export const loadMapLayers = async (
    client: InstanceClient,
    map: Pick<Dhis2Map, 'mapViews'>,
    options: LoadOptions
): Promise<MapLayerData[]> => {
    const layers = await Promise.all(
        map.mapViews.map((view, index) => {
            const kind = layerKind(view)
            if (kind === 'thematic') return loadThematic(client, view, index, options)
            if (kind === 'facility') return loadOrgUnits(client, view, index, true, options)
            return loadOrgUnits(client, view, index, false, options)
        })
    )
    return layers.filter((layer): layer is MapLayerData => layer !== null)
}
