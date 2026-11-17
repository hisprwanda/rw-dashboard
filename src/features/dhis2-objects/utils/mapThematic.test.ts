import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import type { Dhis2MapView } from '../types/dhis2Object.types'
import { toGeoJson, type GeoFeatureItem } from './mapGeo'
import { styleThematic, thematicAnalyticsParams } from './mapThematic'

const square = (x: number) => `[[[${x},0],[${x + 1},0],[${x + 1},1],[${x},1],[${x},0]]]`
const geoItems: GeoFeatureItem[] = [
    { id: 'a', na: 'Alpha', le: 2, co: square(0), ty: 2, pn: 'Root' },
    { id: 'b', na: 'Beta', le: 2, co: square(1), ty: 2 },
    { id: 'c', na: 'Gamma', le: 2, co: square(2), ty: 2 },
    { id: 'p', na: 'Clinic', le: 4, co: '[3.5,0.5]', ty: 1 },
    { id: 'x', na: 'No coordinates', le: 2, co: '[]', ty: 2 },
]

const header = (name: string) => ({
    name,
    column: name,
    valueType: 'TEXT',
    type: 'java.lang.String',
    hidden: false,
    meta: name !== 'value',
})

const analytics = (values: Record<string, string>): AnalyticsResponse => ({
    headers: ['dx', 'ou', 'value'].map(header),
    rows: Object.entries(values).map(([ou, value]) => ['anc', ou, value]),
    width: 3,
    height: Object.keys(values).length,
    metaData: {
        items: {
            anc: { name: 'ANC coverage' },
            LAST_YEAR: { name: '2025' },
            sex: { name: 'Sex' },
            f: { name: 'Female' },
        },
        dimensions: {},
    },
})

const view: Dhis2MapView = {
    layer: 'thematic',
    columns: [{ dimension: 'dx', items: [{ id: 'anc', name: 'ANC' }] }],
    rows: [{ dimension: 'ou', items: [{ id: 'root' }, { id: 'LEVEL-2' }] }],
    filters: [
        { dimension: 'pe', items: [{ id: 'LAST_YEAR' }] },
        { dimension: 'sex', items: [{ id: 'f' }] },
    ],
    method: 2,
    classes: 2,
    colorScale: '#eeeeee,#111111',
}

describe('toGeoJson', () => {
    it('converts geoFeatures, by level, without org units lacking coordinates', () => {
        const features = toGeoJson(geoItems)
        expect(features.map(({ id }) => id)).toEqual(['a', 'b', 'c', 'p'])
        expect(features[0]?.geometry.type).toBe('Polygon')
        expect(features[3]?.geometry).toEqual({ type: 'Point', coordinates: [3.5, 0.5] })
        expect(features[0]?.properties).toMatchObject({ name: 'Alpha', parentName: 'Root' })
    })
})

describe('thematicAnalyticsParams', () => {
    it('asks for the data item by org unit, with periods and other filters', () => {
        expect(thematicAnalyticsParams(view)).toEqual({
            dimension: ['dx:anc', 'ou:root;LEVEL-2'],
            filter: ['pe:LAST_YEAR', 'sex:f'],
            displayProperty: 'NAME',
        })
    })

    it('uses the date range when there are no periods, and reporting rates for data sets', () => {
        expect(
            thematicAnalyticsParams({
                ...view,
                valueType: 'ds',
                filters: [],
                startDate: '2025-01-01T00:00:00.000',
                endDate: '2025-06-30T00:00:00.000',
            })
        ).toMatchObject({
            dimension: ['dx:anc.REPORTING_RATE', 'ou:root;LEVEL-2'],
            startDate: '2025-01-01',
            endDate: '2025-06-30',
        })
    })
})

describe('styleThematic', () => {
    const features = toGeoJson(geoItems).filter(({ geometry }) => geometry.type !== 'Point')

    it('colors org units by class and leaves out those without data', () => {
        const layer = styleThematic({
            view,
            analytics: analytics({ a: '10', b: '90' }),
            features,
        })
        expect(layer.features.map(({ id }) => id)).toEqual(['a', 'b'])
        expect(layer.features.map(({ properties }) => properties.color)).toEqual([
            '#eeeeee',
            '#111111',
        ])
        expect(layer.legend).toMatchObject({
            title: 'ANC coverage',
            period: '2025',
            filters: ['Sex: Female'],
        })
        expect(layer.legend.entries.map(({ count }) => count)).toEqual([1, 1])
    })

    it('uses the legend set and keeps no-data org units when the layer has that class', () => {
        const layer = styleThematic({
            view: {
                ...view,
                legendSet: {
                    id: 'ls',
                    legends: [
                        { name: 'High', startValue: 50, endValue: 100, color: '#f00' },
                        { name: 'Low', startValue: 0, endValue: 50, color: '#0f0' },
                    ],
                },
                noDataColor: '#ccc',
            },
            analytics: analytics({ a: '10', b: '90' }),
            features,
        })
        expect(
            layer.features.map(({ id, properties }) => [id, properties.color, properties.legend])
        ).toEqual([
            ['a', '#0f0', 'Low'],
            ['b', '#f00', 'High'],
            ['c', '#ccc', 'No data'],
        ])
        expect(layer.legend.entries.map(({ name }) => name)).toEqual(['Low', 'High', 'No data'])
    })

    it('sizes bubbles between the low and high radius', () => {
        const layer = styleThematic({
            view: { ...view, thematicMapType: 'BUBBLE', radiusLow: 4, radiusHigh: 20 },
            analytics: analytics({ a: '0', b: '100' }),
            features,
        })
        expect(layer.isBubble).toBe(true)
        expect(layer.features.map(({ properties }) => properties.radius)).toEqual([4, 20])
        expect(layer.legend.bubbles).toMatchObject({ radiusLow: 4, radiusHigh: 20 })
    })
})
