import { hasAuthorities } from './authorities'

describe('hasAuthorities', () => {
    it('requires every listed authority', () => {
        expect(hasAuthorities(['A', 'B'], ['A', 'B'])).toBe(true)
        expect(hasAuthorities(['A'], ['A', 'B'])).toBe(false)
    })

    it('grants everything to superusers (ALL)', () => {
        expect(hasAuthorities(['ALL'], ['F_SYSTEM_SETTING'])).toBe(true)
    })

    it('allows an empty requirement', () => {
        expect(hasAuthorities([], [])).toBe(true)
    })
})
