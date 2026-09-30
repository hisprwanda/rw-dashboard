import type { LocalizedText } from '../types/bulletin.types'

/**
 * The text in `locale`, else in the first content language that has one, else any.
 * `en-GB` falls back to `en`.
 */
export const pickText = (
    text: LocalizedText | undefined,
    locale: string,
    languages: readonly string[] = []
): string => {
    if (!text) return ''
    const base = locale.split(/[-_]/)[0] ?? locale
    const candidates = [locale, base, ...languages]
    for (const candidate of candidates) {
        const value = text[candidate]
        if (value) return value
    }
    return Object.values(text).find(Boolean) ?? ''
}

/** Sets the text of one locale, keeping the others. */
export const withText = (
    text: LocalizedText | undefined,
    locale: string,
    value: string
): LocalizedText => ({ ...text, [locale]: value })

/** Same text in every language (for defaults). */
export const textIn = (languages: readonly string[], value: string): LocalizedText =>
    Object.fromEntries(languages.map((language) => [language, value]))
