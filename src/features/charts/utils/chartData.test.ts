import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import {
    isAnalyticsResponse,
    toSeriesConfig,
    toSeriesRows,
    toSlices,
    toTreeNodes,
} from './chartData'

const header = (name: string, meta = true) => ({
    name,
    column: name,
    valueType: 'TEXT',
    type: 'java.lang.String',
    hidden: false,
    meta,
})

/** Two data items over two months (the common case). */
const withDx: AnalyticsResponse = {
    headers: [header('dx'), header('pe'), header('value', false)],
    rows: [
        ['a', '202401', '10'],
        ['b', '202401', '5'],
        ['a', '202402', ''],
    ],
    metaData: {
        items: {
            a: { name: 'ANC 1' },
            b: { name: 'ANC 2' },
            '202401': { name: 'January 2024' },
            '202402': { name: 'February 2024' },
        },
        dimensions: { dx: ['a', 'b'], pe: ['202401', '202402'] },
    },
    width: 3,
    height: 3,
}

/** No dx column (single indicator in filter): org units become the series. */
const withoutDx: AnalyticsResponse = {
    headers: [header('pe'), header('ou'), header('value', false)],
    rows: [
        ['202401', 'o1', '7'],
        ['202401', 'o2', '3'],
    ],
    metaData: {
        items: { o1: { name: 'Kigali' }, o2: { name: 'Huye' }, '202401': { name: 'January 2024' } },
        dimensions: { pe: ['202401'], ou: ['o1', 'o2'] },
    },
    width: 3,
    height: 2,
}

describe('toSeriesRows', () => {
    it('pivots data items into series per period, keeping empty cells as null', () => {
        expect(toSeriesRows(withDx)).toEqual([
            { period: 'January 2024', 'ANC 1': 10, 'ANC 2': 5 },
            { period: 'February 2024', 'ANC 1': null, 'ANC 2': null },
        ])
    })

    it('uses org units as series when there is no dx column', () => {
        expect(toSeriesRows(withoutDx)).toEqual([{ period: 'January 2024', Kigali: 7, Huye: 3 }])
    })

    it('rejects responses without a value column', () => {
        expect(() => toSeriesRows({ ...withDx, headers: [header('dx'), header('pe')] })).toThrow()
    })
})

describe('toSeriesConfig', () => {
    const palette = { name: 'p', itemsBackgroundColors: ['#111', '#222'] }

    it('colors each series from the palette, cycling', () => {
        expect(toSeriesConfig(withDx, palette)).toEqual({
            'ANC 1': { label: 'ANC 1', color: '#111' },
            'ANC 2': { label: 'ANC 2', color: '#222' },
        })
    })

    it('falls back to org units, then theme colors', () => {
        expect(Object.keys(toSeriesConfig(withoutDx))).toEqual(['Kigali', 'Huye'])
        expect(toSeriesConfig(withoutDx).Kigali?.color).toBe('hsl(var(--chart-1))')
    })
})

describe('toSlices / toTreeNodes', () => {
    const rows = toSeriesRows(withDx)

    it('totals each series over all categories', () => {
        expect(toSlices(rows).map(({ name, total }) => ({ name, total }))).toEqual([
            { name: 'ANC 1', total: 10 },
            { name: 'ANC 2', total: 5 },
        ])
    })

    it('builds tree nodes with positive values only', () => {
        expect(toTreeNodes(rows)).toEqual([
            { name: 'ANC 1', children: [{ name: 'January 2024', size: 10 }] },
            { name: 'ANC 2', children: [{ name: 'January 2024', size: 5 }] },
        ])
    })
})

it('isAnalyticsResponse guards against empty or partial data', () => {
    expect(isAnalyticsResponse(withDx)).toBe(true)
    expect(isAnalyticsResponse(null)).toBe(false)
    expect(isAnalyticsResponse([])).toBe(false)
})
