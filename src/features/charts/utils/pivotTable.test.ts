import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { buildPivot } from './pivotTable'

const header = (name: string) => ({ name, column: name, meta: name !== 'value' })

// ANC 1 and 2 (dx) for two years (pe) across, two districts (ou) down; Bo has no ANC 2 last year.
const data = {
    headers: ['dx', 'pe', 'ou', 'value'].map(header),
    rows: [
        ['anc1', '2025', 'bo', '10'],
        ['anc1', '2026', 'bo', '12'],
        ['anc2', '2026', 'bo', '5'],
        ['anc1', '2025', 'ke', '7'],
        ['anc1', '2026', 'ke', '8'],
        ['anc2', '2025', 'ke', '3'],
        ['anc2', '2026', 'ke', '4'],
    ],
    metaData: {
        items: {
            anc1: { name: 'ANC 1' },
            anc2: { name: 'ANC 2' },
            2025: { name: '2025' },
            2026: { name: '2026' },
            bo: { name: 'Bo' },
            ke: { name: 'Kenema' },
            ab: { name: 'Absent' },
        },
        dimensions: { dx: ['anc1', 'anc2'], pe: ['2025', '2026'], ou: ['bo', 'ke', 'ab'] },
    },
    width: 4,
    height: 7,
} as unknown as AnalyticsResponse

describe('buildPivot', () => {
    it('spans outer column headers over the inner ones', () => {
        const pivot = buildPivot(data, ['dx', 'pe'], ['ou'])
        expect(pivot.columnHeaders.map((level) => level.map((c) => `${c.name}/${c.span}`))).toEqual(
            [
                ['ANC 1/2', 'ANC 2/2'],
                ['2025/1', '2026/1', '2025/1', '2026/1'],
            ]
        )
    })

    it('fills the cells, with row and column totals', () => {
        const pivot = buildPivot(data, ['dx', 'pe'], ['ou'])
        expect(pivot.rows.map((row) => [row.headers[0]?.name, ...row.values, row.total])).toEqual([
            ['Bo', 10, 12, null, 5, 27],
            ['Kenema', 7, 8, 3, 4, 22],
            ['Absent', null, null, null, null, null],
        ])
        expect(pivot.columnTotals).toEqual([17, 20, 3, 9])
        expect(pivot.grandTotal).toBe(49)
    })

    it('hides empty rows and merges repeated row headers', () => {
        const pivot = buildPivot(data, ['pe'], ['ou', 'dx'], { hideEmptyRows: true })
        expect(pivot.rowDimensionCount).toBe(2)
        expect(
            pivot.rows.map((row) => row.headers.map((h) => (h ? `${h.name}/${h.span}` : '-')))
        ).toEqual([
            ['Bo/2', 'ANC 1/1'],
            ['-', 'ANC 2/1'],
            ['Kenema/2', 'ANC 1/1'],
            ['-', 'ANC 2/1'],
        ])
    })

    it('ignores dimensions that are not in the response (filters)', () => {
        const pivot = buildPivot(data, ['dx', 'co'], ['ou'])
        expect(pivot.columnHeaders).toHaveLength(1)
    })
})
