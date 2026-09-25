import { filterRows, pageCountOf, paginateRows, sortRows } from './tableData'

interface Row {
    name: string
    count: number | null
}

const rows: Row[] = [
    { name: 'Kigali', count: 10 },
    { name: 'huye', count: 2 },
    { name: 'Musanze', count: null },
    { name: 'item 10', count: 2 },
    { name: 'item 9', count: 5 },
]
const valueOf = (row: Row, key: string) => (key === 'name' ? row.name : row.count)

describe('sortRows', () => {
    it('keeps the original order for "default" or no sort', () => {
        expect(sortRows(rows, null, valueOf)).toEqual(rows)
        expect(sortRows(rows, { key: 'name', direction: 'default' }, valueOf)).toEqual(rows)
    })

    it('sorts text case-insensitively and numerically ("item 9" before "item 10")', () => {
        const names = sortRows(rows, { key: 'name', direction: 'asc' }, valueOf).map((r) => r.name)
        expect(names).toEqual(['huye', 'item 9', 'item 10', 'Kigali', 'Musanze'])
    })

    it('sorts numbers descending, keeps ties stable and puts empty values last', () => {
        const names = sortRows(rows, { key: 'count', direction: 'desc' }, valueOf).map(
            (r) => r.name
        )
        expect(names).toEqual(['Kigali', 'item 9', 'huye', 'item 10', 'Musanze'])
    })

    it('does not mutate the input', () => {
        const copy = [...rows]
        sortRows(rows, { key: 'name', direction: 'asc' }, valueOf)
        expect(rows).toEqual(copy)
    })
})

describe('filterRows', () => {
    it('matches case-insensitively and ignores surrounding spaces', () => {
        expect(filterRows(rows, '  KIG ', (r) => r.name)).toEqual([rows[0]])
    })

    it('returns everything for an empty search', () => {
        expect(filterRows(rows, '', (r) => r.name)).toHaveLength(rows.length)
    })
})

describe('pagination', () => {
    it('slices the requested page', () => {
        expect(paginateRows(rows, 2, 2)).toEqual([rows[2], rows[3]])
    })

    it('always reports at least one page', () => {
        expect(pageCountOf(0, 10)).toBe(1)
        expect(pageCountOf(21, 10)).toBe(3)
    })
})
