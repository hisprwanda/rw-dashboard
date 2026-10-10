import { formatAnalyticsDimensions, parseAnalyticsDimensions, withDataItems } from './dimensions'

describe('formatAnalyticsDimensions', () => {
    it('joins items per dimension', () => {
        expect(formatAnalyticsDimensions({ dx: ['a', 'b'], pe: ['2024'] })).toEqual([
            'dx:a;b',
            'pe:2024',
        ])
    })

    it('adds the dynamic dimensions after data and period, but never the org units', () => {
        expect(
            formatAnalyticsDimensions({
                dx: ['a'],
                J5jldMd8OHv: ['x', 'y'],
                ou: ['o'],
                pe: ['2024'],
            })
        ).toEqual(['dx:a', 'pe:2024', 'J5jldMd8OHv:x;y'])
        expect(formatAnalyticsDimensions({ dx: ['a'], cat: ['x'] }, true)).toEqual(['dx:a'])
    })

    it('leaves periods out for maps and skips empty dimensions', () => {
        expect(formatAnalyticsDimensions({ dx: ['a'], pe: ['2024'] }, true)).toEqual(['dx:a'])
        expect(formatAnalyticsDimensions({ dx: [], pe: [] })).toEqual([])
    })
})

describe('parseAnalyticsDimensions', () => {
    it('reverses formatAnalyticsDimensions', () => {
        expect(parseAnalyticsDimensions(['dx:a;b', 'pe:2024'])).toEqual({
            dx: ['a', 'b'],
            pe: ['2024'],
        })
    })

    it('rejects anything malformed as a whole', () => {
        expect(parseAnalyticsDimensions('dx:a')).toEqual({})
        expect(parseAnalyticsDimensions(['dx:a', 'broken'])).toEqual({})
        expect(parseAnalyticsDimensions(['dx:'])).toEqual({})
        expect(parseAnalyticsDimensions([42])).toEqual({})
    })
})

describe('withDataItems', () => {
    it('replaces the data items in the dimensions or the filter', () => {
        expect(withDataItems({ dimension: ['dx:a;b', 'pe:2024'], filter: 'ou:x' }, ['b'])).toEqual({
            dimension: ['dx:b', 'pe:2024'],
            filter: 'ou:x',
        })
        expect(
            withDataItems({ dimension: ['pe:2024'], filter: ['dx:a;b', 'ou:x'] }, ['a'])
        ).toEqual({ dimension: ['pe:2024'], filter: ['dx:a', 'ou:x'] })
    })
})
