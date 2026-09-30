import i18n from '@dhis2/d2-i18n'
import { generateUid } from '@/shared/utils/uid'
import type { BulletinSection, BulletinSectionType, LocalizedText } from '../types/bulletin.types'

export const SECTION_TYPES: BulletinSectionType[] = [
    'cover',
    'text',
    'indicatorTrends',
    'trackerCases',
    'eventSignals',
    'completeness',
    'outbreaks',
    'notes',
]

export const sectionTypeLabel = (type: BulletinSectionType): string =>
    ({
        cover: i18n.t('Cover'),
        text: i18n.t('Text'),
        indicatorTrends: i18n.t('Indicator trends'),
        trackerCases: i18n.t('Tracker cases and deaths'),
        eventSignals: i18n.t('Event signals'),
        completeness: i18n.t('Reporting completeness'),
        outbreaks: i18n.t('Outbreak table'),
        notes: i18n.t('Notes'),
    })[type]

const empty = (): LocalizedText => ({})

/** A new section of a type with empty texts and safe defaults. */
export const newSection = (type: BulletinSectionType): BulletinSection => {
    const base = { id: generateUid(), title: empty() }
    switch (type) {
        case 'cover':
            return { ...base, type, logos: [], subtitle: empty() }
        case 'text':
            return { ...base, type, body: empty() }
        case 'indicatorTrends':
            return { ...base, type, dataItems: [], lookback: 11, chartType: 'Line' }
        case 'trackerCases':
            return { ...base, type, program: null, groupBy: null, rules: [] }
        case 'eventSignals':
            return {
                ...base,
                type,
                program: null,
                codeElement: null,
                locationElement: null,
                countElement: null,
            }
        case 'completeness':
            return {
                ...base,
                type,
                dataSets: [],
                orgUnitLevel: 2,
                lookback: 3,
                thresholds: { good: 80, fair: 60 },
            }
        case 'outbreaks':
            return { ...base, type, columns: [] }
        case 'notes':
            return { ...base, type }
    }
}

/** Moves the item at `index` by `step` (−1 up, +1 down); out of range = unchanged. */
export const move = <T>(items: readonly T[], index: number, step: number): T[] => {
    const target = index + step
    if (target < 0 || target >= items.length) return [...items]
    const next = [...items]
    const [item] = next.splice(index, 1)
    if (item !== undefined) next.splice(target, 0, item)
    return next
}
