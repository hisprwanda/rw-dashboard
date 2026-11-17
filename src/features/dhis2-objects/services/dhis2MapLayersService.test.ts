import type { InstanceClient, QueryParams } from '@/shared/api'
import type { Dhis2Map } from '../types/dhis2Object.types'
import { isSupportedMap, loadMapLayers } from './dhis2MapLayersService'

const square = '[[[0,0],[1,0],[1,1],[0,1],[0,0]]]'

const responses: Record<string, unknown> = {
    analytics: {
        headers: ['dx', 'ou', 'value'].map((name) => ({ name, column: name, meta: true })),
        rows: [['anc', 'd1', '42']],
        width: 3,
        height: 1,
        metaData: { items: { anc: { name: 'ANC' } }, dimensions: {} },
    },
    geoFeatures: [
        { id: 'd1', na: 'District 1', le: 2, co: square, ty: 2 },
        { id: 'f1', na: 'Clinic', le: 3, co: '[0.5,0.5]', ty: 1 },
    ],
    organisationUnitLevels: { organisationUnitLevels: [{ level: 2, displayName: 'District' }] },
}

const client = (calls: Array<[string, QueryParams | undefined]>): InstanceClient => ({
    get: async <T>(resource: string, params?: QueryParams) => {
        calls.push([resource, params])
        return responses[resource] as T
    },
    getBlob: async () => new Blob(),
})

const map: Dhis2Map = {
    id: 'm1',
    name: 'ANC map',
    mapViews: [
        {
            layer: 'thematic1',
            columns: [{ dimension: 'dx', items: [{ id: 'anc' }] }],
            rows: [{ dimension: 'ou', items: [{ id: 'LEVEL-2' }] }],
            filters: [{ dimension: 'pe', items: [{ id: 'LAST_YEAR' }] }],
            opacity: 0.8,
            labels: true,
            labelFontColor: '000000',
        },
        { layer: 'boundary', rows: [{ dimension: 'ou', items: [{ id: 'LEVEL-2' }] }] },
        { layer: 'facility', rows: [{ dimension: 'ou', items: [{ id: 'LEVEL-3' }] }] },
    ],
}

describe('isSupportedMap', () => {
    it('draws thematic, org unit and facility layers, not events or timelines', () => {
        expect(isSupportedMap(map)).toBe(true)
        expect(isSupportedMap({ mapViews: [{ layer: 'event' }] })).toBe(false)
        expect(
            isSupportedMap({ mapViews: [{ layer: 'thematic', renderingStrategy: 'TIMELINE' }] })
        ).toBe(false)
        expect(isSupportedMap({ mapViews: [] })).toBe(false)
    })
})

describe('loadMapLayers', () => {
    it('loads every layer from the instance, in order, styled for the engine', async () => {
        const calls: Array<[string, QueryParams | undefined]> = []
        const layers = await loadMapLayers(client(calls), map, {
            displayProperty: 'NAME',
            baseUrl: 'https://x',
        })
        expect(layers.map(({ kind }) => kind)).toEqual(['thematic', 'orgUnit', 'facility'])
        expect(layers[0]).toMatchObject({
            opacity: 0.8,
            label: '{name}',
            labelStyle: { color: '#000000' },
        })
        expect(layers[0]?.features.map(({ id }) => id)).toEqual(['d1'])
        // Facilities are the point org units only.
        expect(layers[2]?.features.map(({ id }) => id)).toEqual(['f1'])
        expect(calls).toContainEqual(['geoFeatures', { ou: 'ou:LEVEL-2', displayProperty: 'NAME' }])
    })
})
