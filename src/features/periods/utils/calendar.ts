import type { SupportedCalendar } from '@dhis2/multi-calendar-dates/build/types/types'

/**
 * DHIS2 calendar setting keys -> multi-calendar-dates calendar ids. DHIS2's default,
 * `iso8601`, is the Gregorian calendar: passing it through as `iso8601` makes names
 * come out year-first ("January - 2026 February").
 */
const DHIS2_CALENDARS: Record<string, SupportedCalendar> = {
    iso8601: 'gregory',
    gregorian: 'gregory',
    ethiopian: 'ethiopic',
    nepali: 'nepali',
    persian: 'persian',
    coptic: 'coptic',
    islamic: 'islamic-civil',
    thai: 'buddhist',
}

export const toSupportedCalendar = (dhis2Calendar: string | undefined): SupportedCalendar =>
    (dhis2Calendar && DHIS2_CALENDARS[dhis2Calendar]) || 'gregory'
