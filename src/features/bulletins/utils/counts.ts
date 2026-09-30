import i18n from '@dhis2/d2-i18n'

// Counted nouns with their plural forms, to embed in sentences that already count
// something else ("12 cases of Cholera reported by 3 facilities").

export const facilityCount = (count: number) =>
    i18n.t('{{count}} facility', {
        count,
        defaultValue: '{{count}} facility',
        defaultValue_plural: '{{count}} facilities',
    })

export const orgUnitCount = (count: number) =>
    i18n.t('{{count}} org unit', {
        count,
        defaultValue: '{{count}} org unit',
        defaultValue_plural: '{{count}} org units',
    })

export const reportCount = (count: number) =>
    i18n.t('{{count}} report', {
        count,
        defaultValue: '{{count}} report',
        defaultValue_plural: '{{count}} reports',
    })

export const levelCount = (count: number) =>
    i18n.t('{{count}} level', {
        count,
        defaultValue: '{{count}} level',
        defaultValue_plural: '{{count}} levels',
    })

export const groupCount = (count: number) =>
    i18n.t('{{count}} group', {
        count,
        defaultValue: '{{count}} group',
        defaultValue_plural: '{{count}} groups',
    })
