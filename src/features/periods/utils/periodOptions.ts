import {
    createFixedPeriodFromPeriodId,
    generateFixedPeriods,
    getAdjacentFixedPeriods,
    getFixedPeriodByDate,
} from '@dhis2/multi-calendar-dates'
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
    calendar: SupportedCalendar = 'gregory',
    locale = 'en'
): { displayName: string; startDate: string; endDate: string } | null => {
    if (isRelativePeriod(id)) return null
    try {
        const { displayName, startDate, endDate } = createFixedPeriodFromPeriodId({
            periodId: id,
            calendar,
            locale,
        })
        return { displayName, startDate, endDate }
    } catch {
        return null
    }
}

/**
 * The `count` periods before a fixed period, then the period itself, oldest first
 * (`previousPeriods('2024W3', 2)` -> `['2024W1', '2024W2', '2024W3']`). Crosses years.
 */
export const previousPeriods = (
    id: string,
    count: number,
    calendar: SupportedCalendar = 'gregory'
): string[] => {
    if (isRelativePeriod(id)) return [id]
    try {
        const period = createFixedPeriodFromPeriodId({ periodId: id, calendar })
        const before = count > 0 ? getAdjacentFixedPeriods({ period, calendar, steps: -count }) : []
        return [...before, period]
            .sort((a, b) => a.startDate.localeCompare(b.startDate))
            .map((p) => p.id)
    } catch {
        return [id]
    }
}

/** The last finished period of a type (e.g. last week), for a default selection. */
export const lastCompletePeriod = (
    periodType: PeriodType,
    calendar: SupportedCalendar = 'gregory',
    today: Date = new Date()
): string | undefined => {
    try {
        const date = today.toISOString().slice(0, 10)
        const current = getFixedPeriodByDate({ periodType, date, calendar })
        return previousPeriods(current.id, 1, calendar)[0]
    } catch {
        return undefined
    }
}
