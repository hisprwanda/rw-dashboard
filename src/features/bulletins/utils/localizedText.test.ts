import { pickText, textIn, withText } from './localizedText'

describe('localized text', () => {
    const text = { en: 'Weekly bulletin', fr: 'Bulletin hebdomadaire' }

    it('picks the locale, its base language, then the content languages', () => {
        expect(pickText(text, 'fr')).toBe('Bulletin hebdomadaire')
        expect(pickText(text, 'fr-FR')).toBe('Bulletin hebdomadaire')
        expect(pickText(text, 'rw', ['en', 'fr'])).toBe('Weekly bulletin')
        expect(pickText({ fr: 'Seulement' }, 'rw', ['en'])).toBe('Seulement')
        expect(pickText(undefined, 'en')).toBe('')
    })

    it('edits one language and builds defaults', () => {
        expect(withText(text, 'rw', 'Raporo')).toEqual({ ...text, rw: 'Raporo' })
        expect(textIn(['en', 'fr'], 'x')).toEqual({ en: 'x', fr: 'x' })
    })
})
