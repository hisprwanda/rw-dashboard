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

/** Fixed period types offered in the period picker (labels: utils/labels.ts). */
export const FIXED_PERIOD_TYPES: PeriodType[] = [
    'DAILY',
    'WEEKLY',
    'WEEKLYWED',
    'WEEKLYTHU',
    'WEEKLYSAT',
    'WEEKLYSUN',
    'BIWEEKLY',
    'MONTHLY',
    'BIMONTHLY',
    'QUARTERLY',
    'SIXMONTHLY',
    'SIXMONTHLYAPR',
    'YEARLY',
    'FYAPR',
    'FYJUL',
    'FYOCT',
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
