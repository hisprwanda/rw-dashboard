import i18n from '@dhis2/d2-i18n'
import type { InstanceClient } from '@/shared/api'
import type {
    Dhis2Map,
    Dhis2ObjectPage,
    Dhis2ObjectSummary,
    Dhis2ObjectType,
    Dhis2Visualization,
    InstalledApp,
} from '../types/dhis2Object.types'

// Field lists of the official Dashboard app (dashboard-app `src/api/metadata.js`): the
// plugins expect a favorite in exactly this shape.
const ITEM_FIELDS = 'dimensionItem~rename(id),displayName~rename(name),dimensionItemType'
const DIMENSION_FIELDS = [
    'dimension',
    'legendSet[id]',
    'filter',
    'programStage',
    `items[${ITEM_FIELDS}]`,
    'dimensionType',
    'program[id]',
    'optionSet[id]',
    'valueType',
].join(',')
const AXES_FIELDS = ['columns', 'rows', 'filters']
    .map((axis) => `${axis}[${DIMENSION_FIELDS}]`)
    .join(',')
const OPTION_FIELDS = [
    '*',
    '!attributeDimensions',
    '!attributeValues',
    '!category',
    '!categoryDimensions',
    '!categoryOptionGroupSetDimensions',
    '!columnDimensions',
    '!dataDimensionItems',
    '!dataElementDimensions',
    '!dataElementGroupSetDimensions',
    '!filterDimensions',
    '!itemOrganisationUnitGroups',
    '!lastUpdatedBy',
    '!organisationUnitGroupSetDimensions',
    '!organisationUnitLevels',
    '!organisationUnits',
    '!programIndicatorDimensions',
    '!relativePeriods',
    '!reportParams',
    '!rowDimensions',
    '!translations',
    '!userOrganisationUnit',
    '!userOrganisationUnitChildren',
    '!userOrganisationUnitGrandChildren',
].join(',')
const FAVORITE_FIELDS = [
    'id',
    'displayName~rename(name)',
    'type',
    'displayDescription~rename(description)',
    AXES_FIELDS,
    OPTION_FIELDS,
].join(',')
const MAP_VIEW_FIELDS = [
    FAVORITE_FIELDS,
    'program[id,displayName~rename(name)]',
    'programStage[id,displayName~rename(name)]',
    'trackedEntityType[id,displayName~rename(name)]',
    // The legend classes inline, so the native map needs no second request.
    'legendSet[id,displayName~rename(name),legends[startValue,endValue,color,displayName~rename(name)]]',
].join(',')
export const VISUALIZATION_FIELDS = FAVORITE_FIELDS
export const MAP_FIELDS = [
    'id',
    'displayName~rename(name)',
    'user,longitude,latitude,zoom,basemap,basemaps',
    `mapViews[${MAP_VIEW_FIELDS}]`,
].join(',')

const RESOURCE: Record<Dhis2ObjectType, 'visualizations' | 'maps'> = {
    visualization: 'visualizations',
    map: 'maps',
}

interface ListResponse {
    pager?: { page?: number; pageCount?: number; total?: number }
    visualizations?: Array<{ id: string; displayName?: string; type?: string }>
    maps?: Array<{ id: string; displayName?: string; mapViews?: Array<{ layer?: string }> }>
}

/** The distinct layer kinds of a map (`thematic1`, `thematic2` -> `thematic`). */
export const layerKinds = (mapViews: ReadonlyArray<{ layer?: string }> | undefined): string =>
    [...new Set((mapViews ?? []).map((view) => (view.layer ?? '').replace(/\d+$/, '')))]
        .filter(Boolean)
        .join(',')

/** One page of the visualizations or maps whose name contains `query`, by name. */
export const searchObjects = async (
    client: InstanceClient,
    objectType: Dhis2ObjectType,
    query: string,
    page = 1,
    signal?: AbortSignal
): Promise<Dhis2ObjectPage> => {
    const resource = RESOURCE[objectType]
    const text = query.trim()
    const response = await client.get<ListResponse>(
        resource,
        {
            fields: objectType === 'map' ? 'id,displayName,mapViews[layer]' : 'id,displayName,type',
            order: 'displayName:asc',
            page,
            pageSize: 25,
            ...(text ? { filter: `displayName:ilike:${text}` } : {}),
        },
        signal
    )
    const items: Dhis2ObjectSummary[] =
        objectType === 'map'
            ? (response.maps ?? []).map((map) => ({
                  id: map.id,
                  name: map.displayName ?? map.id,
                  objectType,
                  subtype: layerKinds(map.mapViews),
              }))
            : (response.visualizations ?? []).map((visualization) => ({
                  id: visualization.id,
                  name: visualization.displayName ?? visualization.id,
                  objectType,
                  subtype: visualization.type ?? '',
              }))
    return {
        items,
        page: response.pager?.page ?? page,
        pageCount: response.pager?.pageCount ?? 1,
        total: response.pager?.total ?? items.length,
    }
}

export const fetchVisualization = (client: InstanceClient, id: string, signal?: AbortSignal) =>
    client.get<Dhis2Visualization>(
        `${RESOURCE.visualization}/${id}`,
        { fields: VISUALIZATION_FIELDS },
        signal
    )

export const fetchMap = (client: InstanceClient, id: string, signal?: AbortSignal) =>
    client.get<Dhis2Map>(`${RESOURCE.map}/${id}`, { fields: MAP_FIELDS }, signal)

/** The server-rendered image of a chart or map (`/api/<resource>/<id>/data.png`). */
export const fetchObjectImage = async (
    client: InstanceClient,
    objectType: Dhis2ObjectType,
    id: string,
    signal?: AbortSignal
): Promise<Blob> => {
    const blob = await client.getBlob(`${RESOURCE[objectType]}/${id}/data.png`, undefined, signal)
    // Pivot tables answer with a JSON grid instead of an image.
    if (!blob.type.startsWith('image/')) {
        throw new Error(i18n.t('DHIS2 has no image of this item.'))
    }
    return blob
}

/** Installed apps, to find the plugin of the Data Visualizer and Maps apps. */
export const fetchInstalledApps = (client: InstanceClient, signal?: AbortSignal) =>
    client.get<InstalledApp[]>('apps', undefined, signal)
