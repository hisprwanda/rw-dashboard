import { createFixedPeriodFromPeriodId, generateFixedPeriods } from '@dhis2/multi-calendar-dates'
import type { SupportedCalendar } from '@dhis2/multi-calendar-dates/build/types/types'
import {
    RELATIVE_PERIOD_GROUPS,
    type PeriodType,
    type RelativePeriodGroup,
} from '../constants/periods'
import { relativePeriodLabel } from './labels'

export interface PeriodOption {
    label: string
    value: string
}

const RELATIVE_IDS = new Set<string>(Object.values(RELATIVE_PERIOD_GROUPS).flat())

export const isRelativePeriod = (id: string) => RELATIVE_IDS.has(id)

export const relativePeriodOptions = (group: RelativePeriodGroup): PeriodOption[] =>
    RELATIVE_PERIOD_GROUPS[group].map((id) => ({ value: id, label: relativePeriodLabel(id) }))

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
    if (isRelativePeriod(id)) return relativePeriodLabel(id)
    try {
        return createFixedPeriodFromPeriodId({ periodId: id, calendar, locale }).displayName
    } catch {
        return id
    }
}

/** Name and ISO start/end dates of a fixed period id (`2026W10`); `null` for relative or unknown ids. */
export const periodRange = (
    id: string,
    calendar: SupportedCalendar = 'gregory'
): { displayName: string; startDate: string; endDate: string } | null => {
    if (isRelativePeriod(id)) return null
    try {
        const { displayName, startDate, endDate } = createFixedPeriodFromPeriodId({
            periodId: id,
            calendar,
        })
        return { displayName, startDate, endDate }
    } catch {
        return null
    }
}
