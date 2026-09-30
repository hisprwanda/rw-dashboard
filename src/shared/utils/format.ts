import i18n from '@dhis2/d2-i18n'

// The app platform sets `i18n.language` from the user's interface language
// (`keyUiLocale`), so dates and numbers follow it instead of the browser's locale.
const currentLocale = () => (i18n.language || 'en').replace('_', '-')

const safeLocale = (locale: string) => {
    try {
        return Intl.getCanonicalLocales(locale)[0] ?? 'en'
    } catch {
        return 'en'
    }
}

export const formatNumber = (
    value: number,
    options?: Intl.NumberFormatOptions,
    locale = currentLocale()
): string => new Intl.NumberFormat(safeLocale(locale), options).format(value)

/** `1 Mar 2024`-style date (or the locale's equivalent). */
export const formatDate = (value: number | string | Date, locale = currentLocale()): string =>
    new Intl.DateTimeFormat(safeLocale(locale), { dateStyle: 'medium' }).format(new Date(value))

export const formatDateTime = (value: number | string | Date, locale = currentLocale()): string =>
    new Intl.DateTimeFormat(safeLocale(locale), { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value)
    )

export const formatPercent = (value: number, fractionDigits = 1, locale = currentLocale()) =>
    formatNumber(value / 100, { style: 'percent', maximumFractionDigits: fractionDigits }, locale)
