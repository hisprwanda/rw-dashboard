import {
    fixedPeriodOptions,
    isRelativePeriod,
    lastCompletePeriod,
    periodLabel,
    periodRange,
    previousPeriods,
    relativePeriodOptions,
} from './periodOptions'
import { humanizeRelativePeriod } from './labels'

describe('relative periods', () => {
    it('humanizes ids', () => {
        expect(humanizeRelativePeriod('LAST_12_MONTHS')).toBe('Last 12 months')
        expect(relativePeriodOptions('months')[0]).toEqual({
            value: 'THIS_MONTH',
            label: 'This month',
        })
    })

    it('recognises relative ids', () => {
        expect(isRelativePeriod('LAST_5_FINANCIAL_YEARS')).toBe(true)
        expect(isRelativePeriod('2024Q1')).toBe(false)
    })
})

describe('fixed periods (DHIS2 ids)', () => {
    it('includes week 53 when the year has one', () => {
        const weeks = fixedPeriodOptions(2026, 'WEEKLY')
        expect(weeks).toHaveLength(53)
        expect(weeks[0]?.value).toBe('2026W1')
    })

    it('uses the yyyyMMB format for bi-months (was "20241B")', () => {
        expect(fixedPeriodOptions(2024, 'BIMONTHLY').map((p) => p.value)).toEqual([
            '202401B',
            '202402B',
            '202403B',
            '202404B',
            '202405B',
            '202406B',
        ])
    })

    it('generates every day of the year as yyyyMMdd (was 31 "days" read as months)', () => {
        const days = fixedPeriodOptions(2024, 'DAILY')
        expect(days).toHaveLength(366)
        expect(days[0]?.value).toBe('20240101')
    })
})

describe('periodLabel', () => {
    it('names relative, fixed and unknown ids', () => {
        expect(periodLabel('LAST_3_MONTHS')).toBe('Last 3 months')
        expect(periodLabel('202401B')).toBe('January - February 2024')
        expect(periodLabel('not-a-period')).toBe('not-a-period')
    })
})

describe('periodRange', () => {
    it('gives the dates of a week', () => {
        expect(periodRange('2024W1')).toMatchObject({
            startDate: '2024-01-01',
            endDate: '2024-01-07',
        })
    })

    it('is null for relative and invalid ids', () => {
        expect(periodRange('LAST_12_MONTHS')).toBeNull()
        expect(periodRange('nonsense')).toBeNull()
    })
})

describe('previousPeriods', () => {
    it('lists the earlier periods then the period itself, across years', () => {
        expect(previousPeriods('2024W3', 2)).toEqual(['2024W1', '2024W2', '2024W3'])
        expect(previousPeriods('202402', 2)).toEqual(['202312', '202401', '202402'])
    })

    it('returns just the id without lookback or for relative ids', () => {
        expect(previousPeriods('2024W3', 0)).toEqual(['2024W3'])
        expect(previousPeriods('LAST_12_MONTHS', 3)).toEqual(['LAST_12_MONTHS'])
    })
})

describe('lastCompletePeriod', () => {
    it('is the period before the one containing today', () => {
        expect(lastCompletePeriod('WEEKLY', 'gregory', new Date('2024-01-10T12:00:00Z'))).toBe(
            '2024W1'
        )
        expect(lastCompletePeriod('MONTHLY', 'gregory', new Date('2024-01-10T12:00:00Z'))).toBe(
            '202312'
        )
    })
})
