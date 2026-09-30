import { applyLayout, moveDimension } from './layout'

const params = {
    dimension: ['dx:a', 'pe:2024'],
    filter: 'ou:USER_ORGUNIT',
    displayProperty: 'NAME' as const,
}

describe('applyLayout', () => {
    it('returns the params unchanged without a layout', () => {
        expect(applyLayout(params, undefined)).toEqual(params)
    })

    it('moves dimensions between dimension and filter', () => {
        expect(
            applyLayout(params, {
                Columns: ['Organisation unit'],
                Rows: ['Data'],
                Filter: ['Period'],
            })
        ).toEqual({
            dimension: ['ou:USER_ORGUNIT', 'dx:a'],
            filter: 'pe:2024',
            displayProperty: 'NAME',
        })
    })

    it('uses an array when several dimensions are filters', () => {
        expect(
            applyLayout(params, {
                Columns: ['Data'],
                Rows: [],
                Filter: ['Period', 'Organisation unit'],
            }).filter
        ).toEqual(['pe:2024', 'ou:USER_ORGUNIT'])
    })

    it('drops the filter when nothing is on Filter', () => {
        const result = applyLayout(params, {
            Columns: ['Data', 'Period'],
            Rows: ['Organisation unit'],
            Filter: [],
        })
        expect(result.filter).toBeUndefined()
        expect(result.dimension).toEqual(['dx:a', 'pe:2024', 'ou:USER_ORGUNIT'])
    })

    it('does not mutate its input', () => {
        const copy = JSON.parse(JSON.stringify(params))
        applyLayout(params, { Columns: ['Period'], Rows: ['Data'], Filter: ['Organisation unit'] })
        expect(params).toEqual(copy)
    })
})

describe('moveDimension', () => {
    const layout = { Columns: ['Data'], Rows: ['Period'], Filter: ['Organisation unit'] }

    it('moves a dimension between areas', () => {
        expect(moveDimension(layout, 'Period', 'Rows', 'Filter')).toEqual({
            Columns: ['Data'],
            Rows: [],
            Filter: ['Organisation unit', 'Period'],
        })
    })

    it('ignores moves to the same area or of a missing item', () => {
        expect(moveDimension(layout, 'Data', 'Columns', 'Columns')).toBe(layout)
        expect(moveDimension(layout, 'Data', 'Rows', 'Filter')).toBe(layout)
    })
})
