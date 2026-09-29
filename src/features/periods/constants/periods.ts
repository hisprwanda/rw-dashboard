import type { PeriodType } from '@dhis2/multi-calendar-dates/build/types/period-calculation/types'

export type { PeriodType }

export const RELATIVE_PERIOD_GROUPS = {
    days: ['TODAY', 'YESTERDAY', 'LAST_3_DAYS', 'LAST_7_DAYS', 'LAST_14_DAYS', 'LAST_30_DAYS'],
    weeks: ['THIS_WEEK', 'LAST_WEEK', 'LAST_4_WEEKS', 'LAST_12_WEEKS', 'LAST_52_WEEKS'],
    biweeks: ['THIS_BIWEEK', 'LAST_BIWEEK', 'LAST_4_BIWEEKS'],
    months: [
        'THIS_MONTH',
        'LAST_MONTH',
        'LAST_3_MONTHS',
        'LAST_6_MONTHS',
        'LAST_12_MONTHS',
        'MONTHS_THIS_YEAR',
    ],
    bimonths: ['THIS_BIMONTH', 'LAST_BIMONTH', 'LAST_6_BIMONTHS'],
    quarters: ['THIS_QUARTER', 'LAST_QUARTER', 'LAST_4_QUARTERS', 'QUARTERS_THIS_YEAR'],
    sixmonths: ['THIS_SIX_MONTH', 'LAST_SIX_MONTH', 'LAST_2_SIXMONTHS'],
    financialYears: [
        'THIS_FINANCIAL_YEAR',
        'LAST_FINANCIAL_YEAR',
        'LAST_5_FINANCIAL_YEARS',
        'LAST_10_FINANCIAL_YEARS',
    ],
    years: ['THIS_YEAR', 'LAST_YEAR', 'LAST_5_YEARS', 'LAST_10_YEARS'],
} as const

export type RelativePeriodGroup = keyof typeof RELATIVE_PERIOD_GROUPS

export const RELATIVE_GROUP_LABELS: Record<RelativePeriodGroup, string> = {
    days: 'Days',
    weeks: 'Weeks',
    biweeks: 'Bi-weeks',
    months: 'Months',
    bimonths: 'Bi-months',
    quarters: 'Quarters',
    sixmonths: 'Six-months',
    financialYears: 'Financial years',
    years: 'Years',
}

export const FIXED_PERIOD_TYPES: Array<{ label: string; value: PeriodType }> = [
    { label: 'Daily', value: 'DAILY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Weekly (Start Wednesday)', value: 'WEEKLYWED' },
    { label: 'Weekly (Start Thursday)', value: 'WEEKLYTHU' },
    { label: 'Weekly (Start Saturday)', value: 'WEEKLYSAT' },
    { label: 'Weekly (Start Sunday)', value: 'WEEKLYSUN' },
    { label: 'Bi-weekly', value: 'BIWEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Bi-monthly', value: 'BIMONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
    { label: 'Six-monthly', value: 'SIXMONTHLY' },
    { label: 'Six-monthly April', value: 'SIXMONTHLYAPR' },
    { label: 'Yearly', value: 'YEARLY' },
    { label: 'Financial year (April)', value: 'FYAPR' },
    { label: 'Financial year (July)', value: 'FYJUL' },
    { label: 'Financial year (October)', value: 'FYOCT' },
]

/** Period types allowed for weekly epidemiological bulletins. */
export const BULLETIN_PERIOD_TYPES: PeriodType[] = [
    'WEEKLY',
    'WEEKLYWED',
    'WEEKLYTHU',
    'WEEKLYSAT',
    'WEEKLYSUN',
    'BIWEEKLY',
]
