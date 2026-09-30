import { formatDate, formatLanguageName, formatNumber, formatPercent } from './format'

describe('locale-aware formatting', () => {
    it('formats numbers per locale', () => {
        expect(formatNumber(12345.5, undefined, 'en')).toBe('12,345.5')
        expect(formatNumber(12345.5, undefined, 'fr').replace(/\s/g, ' ')).toBe('12 345,5')
    })

    it('formats dates per locale', () => {
        const date = Date.UTC(2024, 2, 1, 12)
        expect(formatDate(date, 'en')).toMatch(/Mar 1, 2024|1 Mar 2024/)
        expect(formatDate(date, 'fr')).toMatch(/1 mars 2024/)
    })

    it('formats percentages and survives unknown locales', () => {
        expect(formatPercent(95.5, 1, 'en')).toBe('95.5%')
        expect(formatNumber(1, undefined, 'not_a_locale!!')).toBe('1')
    })

    it('names languages in the user language', () => {
        expect(formatLanguageName('fr', 'en')).toBe('French')
        expect(formatLanguageName('en', 'fr')).toBe('anglais')
        expect(formatLanguageName('??', 'en')).toBe('??')
    })
})
