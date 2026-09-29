import { createFixedPeriodFromPeriodId, generateFixedPeriods } from '@dhis2/multi-calendar-dates'
import type { SupportedCalendar } from '@dhis2/multi-calendar-dates/build/types/types'
import {
    RELATIVE_PERIOD_GROUPS,
    type PeriodType,
    type RelativePeriodGroup,
} from '../constants/periods'

export interface PeriodOption {
    label: string
    value: string
}

const RELATIVE_IDS = new Set<string>(Object.values(RELATIVE_PERIOD_GROUPS).flat())

export const isRelativePeriod = (id: string) => RELATIVE_IDS.has(id)

/** `LAST_12_MONTHS` -> `Last 12 months`. */
export const humanizeRelativePeriod = (id: string) => {
    const words = id.toLowerCase().split('_').join(' ')
    return words.charAt(0).toUpperCase() + words.slice(1)
}

export const relativePeriodOptions = (group: RelativePeriodGroup): PeriodOption[] =>
    RELATIVE_PERIOD_GROUPS[group].map((id) => ({ value: id, label: humanizeRelativePeriod(id) }))

/** All periods of a type in a year, with DHIS2 ids (e.g. `2026W1`, `202601B`). */
export const fixedPeriodOptions = (
    year: number,
    periodType: PeriodType,
    calendar: SupportedCalendar = 'gregory',
    locale = 'en'
): PeriodOption[] =>
    generateFixedPeriods({ year, periodType, calendar, locale }).map((period) => ({
        value: period.id,
        label: period.displayName,
    }))

/** Display name of any period id; unknown ids are shown as-is. */
export const periodLabel = (
    id: string,
    calendar: SupportedCalendar = 'gregory',
    locale = 'en'
): string => {
    if (isRelativePeriod(id)) return humanizeRelativePeriod(id)
    try {
        return createFixedPeriodFromPeriodId({ periodId: id, calendar, locale }).displayName
    } catch {
        return id
    }
}
