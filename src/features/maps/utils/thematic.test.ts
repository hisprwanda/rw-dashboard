import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import {
    buildAutoLegend,
    colorForValue,
    escapeHtml,
    toFeatureCollection,
    toGeometry,
    valuesByOrgUnit,
} from './thematic'

const header = (name: string) => ({
    name,
    column: name,
    valueType: 'TEXT',
    type: 'java.lang.String',
    hidden: false,
    meta: true,
})

describe('toGeometry', () => {
    it('reads polygons and multipolygons', () => {
        expect(toGeometry({ co: '[[[1,2],[3,4],[1,2]]]' })?.type).toBe('Polygon')
        expect(toGeometry({ co: '[[[[1,2],[3,4],[1,2]]]]' })?.type).toBe('MultiPolygon')
    })

    it('draws points as small squares', () => {
        const geometry = toGeometry({ co: '[10,20]' })
        expect(geometry?.type).toBe('Polygon')
        expect(geometry?.coordinates[0]).toHaveLength(5)
    })

    it('rejects unreadable coordinates', () => {
        expect(toGeometry({ co: 'not json' })).toBeNull()
    })
})

describe('valuesByOrgUnit', () => {
    it('maps the first data item per org unit, using the headers', () => {
        const response = {
            headers: [header('ou'), header('dx'), header('value')],
            rows: [
                ['a', 'x', '10'],
                ['b', 'x', '5.5'],
                ['a', 'y', '99'],
            ],
        } as unknown as AnalyticsResponse
        expect([...valuesByOrgUnit(response)]).toEqual([
            ['a', 10],
            ['b', 5.5],
        ])
    })

    it('is empty without rows', () => {
        expect(valuesByOrgUnit(undefined).size).toBe(0)
    })
})

describe('toFeatureCollection', () => {
    it('attaches values and skips unreadable features', () => {
        const collection = toFeatureCollection(
            [
                { id: 'a', na: 'A', co: '[1,2]', ty: 1 },
                { id: 'b', na: 'B', co: '???', ty: 2 },
            ],
            new Map([['a', 3]])
        )
        expect(collection.features).toHaveLength(1)
        expect(collection.features[0]?.properties).toEqual({ id: 'a', name: 'A', value: 3 })
    })
})

describe('legend', () => {
    const names = ['1', '2', '3', '4', '5']

    it('builds five classes from min to max', () => {
        const legend = buildAutoLegend([0, 50, 100], names)
        expect(legend).toHaveLength(5)
        expect(legend[0]?.startValue).toBe(0)
        expect(legend[4]?.endValue).toBe(100)
        expect(colorForValue(100, legend)).toBe(legend[4]?.color)
    })

    it('has no classes without values and colors missing values white', () => {
        expect(buildAutoLegend([], names)).toEqual([])
        expect(colorForValue(null, buildAutoLegend([1, 2], names))).toBe('#FFFFFF')
    })
})

it('escapes HTML', () => {
    expect(escapeHtml('<b>"A&B"</b>')).toBe('&lt;b&gt;&quot;A&amp;B&quot;&lt;/b&gt;')
})
