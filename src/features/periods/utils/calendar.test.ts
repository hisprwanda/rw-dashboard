import { toSupportedCalendar } from './calendar'
import { fixedPeriodOptions } from './periodOptions'

describe('toSupportedCalendar', () => {
    it('treats DHIS2 iso8601 (the default) as Gregorian', () => {
        expect(toSupportedCalendar('iso8601')).toBe('gregory')
        expect(
            fixedPeriodOptions(2026, 'BIMONTHLY', toSupportedCalendar('iso8601'))[0]?.label
        ).toBe('January - February 2026')
    })

    it('maps other calendars and falls back to Gregorian', () => {
        expect(toSupportedCalendar('ethiopian')).toBe('ethiopic')
        expect(toSupportedCalendar(undefined)).toBe('gregory')
        expect(toSupportedCalendar('unknown')).toBe('gregory')
    })
})
