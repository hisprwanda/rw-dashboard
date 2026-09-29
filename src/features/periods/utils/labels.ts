import i18n from '@dhis2/d2-i18n'
import type { RelativePeriodGroup } from '../constants/periods'

// Labels are built at render time: the locale is only known after the app has loaded,
// and literal i18n.t() keys let `d2-app-scripts i18n extract` find them.

export const periodTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        DAILY: i18n.t('Daily'),
        WEEKLY: i18n.t('Weekly'),
        WEEKLYWED: i18n.t('Weekly (Start Wednesday)'),
        WEEKLYTHU: i18n.t('Weekly (Start Thursday)'),
        WEEKLYSAT: i18n.t('Weekly (Start Saturday)'),
        WEEKLYSUN: i18n.t('Weekly (Start Sunday)'),
        BIWEEKLY: i18n.t('Bi-weekly'),
        MONTHLY: i18n.t('Monthly'),
        BIMONTHLY: i18n.t('Bi-monthly'),
        QUARTERLY: i18n.t('Quarterly'),
        SIXMONTHLY: i18n.t('Six-monthly'),
        SIXMONTHLYAPR: i18n.t('Six-monthly April'),
        YEARLY: i18n.t('Yearly'),
        FYAPR: i18n.t('Financial year (April)'),
        FYJUL: i18n.t('Financial year (July)'),
        FYOCT: i18n.t('Financial year (October)'),
    }
    return labels[type] ?? type
}

export const relativeGroupLabel = (group: RelativePeriodGroup): string =>
    ({
        days: i18n.t('Days'),
        weeks: i18n.t('Weeks'),
        biweeks: i18n.t('Bi-weeks'),
        months: i18n.t('Months'),
        bimonths: i18n.t('Bi-months'),
        quarters: i18n.t('Quarters'),
        sixmonths: i18n.t('Six-months'),
        financialYears: i18n.t('Financial years'),
        years: i18n.t('Years'),
    })[group]

/** `LAST_12_MONTHS` -> `Last 12 months` (fallback for ids without a translation). */
export const humanizeRelativePeriod = (id: string) => {
    const words = id.toLowerCase().split('_').join(' ')
    return words.charAt(0).toUpperCase() + words.slice(1)
}

export const relativePeriodLabel = (id: string): string => {
    const labels: Record<string, string> = {
        TODAY: i18n.t('Today'),
        YESTERDAY: i18n.t('Yesterday'),
        LAST_3_DAYS: i18n.t('Last 3 days'),
        LAST_7_DAYS: i18n.t('Last 7 days'),
        LAST_14_DAYS: i18n.t('Last 14 days'),
        LAST_30_DAYS: i18n.t('Last 30 days'),
        THIS_WEEK: i18n.t('This week'),
        LAST_WEEK: i18n.t('Last week'),
        LAST_4_WEEKS: i18n.t('Last 4 weeks'),
        LAST_12_WEEKS: i18n.t('Last 12 weeks'),
        LAST_52_WEEKS: i18n.t('Last 52 weeks'),
        THIS_BIWEEK: i18n.t('This bi-week'),
        LAST_BIWEEK: i18n.t('Last bi-week'),
        LAST_4_BIWEEKS: i18n.t('Last 4 bi-weeks'),
        THIS_MONTH: i18n.t('This month'),
        LAST_MONTH: i18n.t('Last month'),
        LAST_3_MONTHS: i18n.t('Last 3 months'),
        LAST_6_MONTHS: i18n.t('Last 6 months'),
        LAST_12_MONTHS: i18n.t('Last 12 months'),
        MONTHS_THIS_YEAR: i18n.t('Months this year'),
        THIS_BIMONTH: i18n.t('This bi-month'),
        LAST_BIMONTH: i18n.t('Last bi-month'),
        LAST_6_BIMONTHS: i18n.t('Last 6 bi-months'),
        THIS_QUARTER: i18n.t('This quarter'),
        LAST_QUARTER: i18n.t('Last quarter'),
        LAST_4_QUARTERS: i18n.t('Last 4 quarters'),
        QUARTERS_THIS_YEAR: i18n.t('Quarters this year'),
        THIS_SIX_MONTH: i18n.t('This six-month'),
        LAST_SIX_MONTH: i18n.t('Last six-month'),
        LAST_2_SIXMONTHS: i18n.t('Last 2 six-months'),
        THIS_FINANCIAL_YEAR: i18n.t('This financial year'),
        LAST_FINANCIAL_YEAR: i18n.t('Last financial year'),
        LAST_5_FINANCIAL_YEARS: i18n.t('Last 5 financial years'),
        LAST_10_FINANCIAL_YEARS: i18n.t('Last 10 financial years'),
        THIS_YEAR: i18n.t('This year'),
        LAST_YEAR: i18n.t('Last year'),
        LAST_5_YEARS: i18n.t('Last 5 years'),
        LAST_10_YEARS: i18n.t('Last 10 years'),
    }
    return labels[id] ?? humanizeRelativePeriod(id)
}
