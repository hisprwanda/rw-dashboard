import { formatAnalyticsDimensions, parseAnalyticsDimensions } from './dimensions'

describe('formatAnalyticsDimensions', () => {
    it('joins items per dimension', () => {
        expect(formatAnalyticsDimensions({ dx: ['a', 'b'], pe: ['2024'] })).toEqual([
            'dx:a;b',
            'pe:2024',
        ])
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
