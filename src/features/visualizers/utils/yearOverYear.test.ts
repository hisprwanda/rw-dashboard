import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { resolveYears, yearOverYearExtraOptions, yearOverYearParams } from './yearOverYear'

describe('resolveYears', () => {
    const today = new Date(2026, 5, 1)

    it('resolves relative and fixed years, newest first and without duplicates', () => {
        expect(resolveYears(['THIS_YEAR', 'LAST_YEAR', '2020', '2025'], today)).toEqual([
            2026, 2025, 2020,
        ])
        expect(resolveYears(['LAST_5_YEARS'], today)).toEqual([2025, 2024, 2023, 2022, 2021])
    })

    it('ignores unknown ids', () => {
        expect(resolveYears(['NEXT_YEAR'], today)).toEqual([])
    })
})

describe('yearOverYearParams', () => {
    it('makes one request per year with the periods as the only dimension', () => {
        const params = yearOverYearParams(
            {
                dimension: ['dx:a', 'pe:LAST_12_MONTHS', 'co:x'],
                filter: 'ou:ou1',
                includeNumDen: true,
            },
            'MONTHS_THIS_YEAR',
            [2026, 2025]
        )
        expect(params).toEqual([
            {
                dimension: ['pe:MONTHS_THIS_YEAR'],
                filter: ['dx:a', 'co:x', 'ou:ou1'],
                includeNumDen: true,
                relativePeriodDate: '2026-12-31',
            },
            {
                dimension: ['pe:MONTHS_THIS_YEAR'],
                filter: ['dx:a', 'co:x', 'ou:ou1'],
                includeNumDen: true,
                relativePeriodDate: '2025-12-31',
            },
        ])
    })
})

describe('yearOverYearExtraOptions', () => {
    const response = (periods: Array<[string, string]>): AnalyticsResponse => ({
        headers: [],
        rows: [],
        width: 0,
        height: 0,
        metaData: {
            items: Object.fromEntries(periods.map(([id, name]) => [id, { name }])),
            dimensions: { pe: periods.map(([id]) => id) },
        },
    })

    it('places the periods of each year on shared, year-less categories', () => {
        const options = yearOverYearExtraOptions(
            [
                response([
                    ['202601', 'January 2026'],
                    ['202602', 'February 2026'],
                ]),
                response([['202501', 'January 2025']]),
            ],
            [2026, 2025]
        )
        expect(options.yearlySeries).toEqual(['2026', '2025'])
        expect(options.xAxisLabels).toEqual(['January', 'February'])
        expect(options.periodKeyAxisIndexMap).toEqual({ '202601': 0, '202602': 1, '202501': 0 })
    })

    it('names weeks by number', () => {
        expect(
            yearOverYearExtraOptions([response([['2026W1', 'Week 1 2026-01-05']])], [2026])
                .xAxisLabels
        ).toEqual(['W1'])
    })
})
