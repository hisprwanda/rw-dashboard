import { adaptLayoutToVisType } from './layoutRules'

describe('adaptLayoutToVisType', () => {
    it('allows one series and two category dimensions for column charts', () => {
        expect(
            adaptLayoutToVisType(
                {
                    Columns: ['Data', 'cat1'],
                    Rows: ['Period', 'cat2', 'cat3'],
                    Filter: ['Organisation unit'],
                },
                'COLUMN'
            )
        ).toEqual({
            Columns: ['Data'],
            Rows: ['Period', 'cat2'],
            Filter: ['Organisation unit', 'cat1', 'cat3'],
        })
    })

    it('allows one category dimension for radar charts', () => {
        expect(
            adaptLayoutToVisType(
                { Columns: ['Data'], Rows: ['Period', 'cat2'], Filter: ['Organisation unit'] },
                'RADAR'
            )
        ).toEqual({ Columns: ['Data'], Rows: ['Period'], Filter: ['Organisation unit', 'cat2'] })
    })

    it('leaves a valid layout as it is', () => {
        const layout = {
            Columns: ['Data'],
            Rows: ['Period'],
            Filter: ['Organisation unit'],
        }
        expect(adaptLayoutToVisType(layout, 'LINE')).toEqual(layout)
    })

    it('uses a single series dimension and no categories for pie charts', () => {
        const pie = adaptLayoutToVisType(
            { Columns: ['Data'], Rows: ['Period'], Filter: ['Organisation unit'] },
            'PIE'
        )
        expect(pie.Columns).toEqual(['Data'])
        expect(pie.Rows).toEqual([])
        expect(pie.Filter).toEqual(['Organisation unit', 'Period'])
    })
})
