import type { AnalyticsHeader, AnalyticsResponse } from '@/shared/types/dhis2.types'
import { mergeAnalyticsMetaData, mergeAnalyticsResponses } from './mergeAnalytics'

const header = (name: string): AnalyticsHeader => ({
    name,
    column: name,
    valueType: 'TEXT',
    type: 'java.lang.String',
    hidden: false,
    meta: true,
})

const response = (
    names: string[],
    rows: string[][],
    metaData: AnalyticsResponse['metaData']
): AnalyticsResponse => ({
    headers: names.map(header),
    rows,
    metaData,
    width: names.length,
    height: rows.length,
})

describe('mergeAnalyticsResponses', () => {
    it('returns a single response unchanged', () => {
        const only = response(['dx', 'value'], [['a', '1']], { items: {}, dimensions: {} })
        expect(mergeAnalyticsResponses([only])).toBe(only)
        expect(mergeAnalyticsResponses([])).toBeUndefined()
    })

    it('aligns the rows on the first headers and combines the metadata', () => {
        const main = response(['dx', 'pe', 'value'], [['a', '2024', '1']], {
            items: { a: { name: 'ANC' }, '2024': { name: '2024' } },
            dimensions: { dx: ['a'], pe: ['2024'], ou: ['ou1'] },
        })
        const other = response(['pe', 'dx', 'value', 'numerator'], [['2023', 'b', '2', '9']], {
            items: { b: { name: 'Malaria' }, '2024': { name: 'Other name' } },
            dimensions: { dx: ['b'], pe: ['2023', '2024'], ou: ['ou1'] },
        })

        const merged = mergeAnalyticsResponses([main, other], ['b', 'a'])
        expect(merged?.headers.map(({ name }) => name)).toEqual(['dx', 'pe', 'value'])
        expect(merged?.rows).toEqual([
            ['a', '2024', '1'],
            ['b', '2023', '2'],
        ])
        expect(merged?.height).toBe(2)
        expect(merged?.metaData.items['2024']?.name).toBe('2024')
        expect(merged?.metaData.items.b?.name).toBe('Malaria')
        expect(merged?.metaData.dimensions).toEqual({
            dx: ['b', 'a'],
            pe: ['2024', '2023'],
            ou: ['ou1'],
        })
    })

    it('fills headers missing from a response with empty cells', () => {
        const main = response(['dx', 'numerator'], [['a', '3']], { items: {}, dimensions: {} })
        const other = response(['dx'], [['b']], { items: {}, dimensions: {} })
        expect(mergeAnalyticsResponses([main, other])?.rows).toEqual([
            ['a', '3'],
            ['b', ''],
        ])
    })
})

describe('mergeAnalyticsMetaData', () => {
    it('merges the org unit hierarchies', () => {
        const merged = mergeAnalyticsMetaData([
            { items: {}, dimensions: {}, ouHierarchy: { a: 'x' } } as never,
            { items: {}, dimensions: {}, ouHierarchy: { b: 'y' } } as never,
        ])
        expect(merged).toMatchObject({ ouHierarchy: { a: 'x', b: 'y' } })
    })
})
