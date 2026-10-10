import type { AnalyticsParams } from '@/features/analytics'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'

/** The periods of a year-over-year chart: one series per year, the periods of a year as categories. */
export interface YearOverYearSelection {
    /** Relative (`THIS_YEAR`, `LAST_5_YEARS`…) or fixed (`2022`) years. */
    years: string[]
    /** A "per year" relative period, e.g. `MONTHS_THIS_YEAR`. */
    category: string
}

export const DEFAULT_YEAR_OVER_YEAR: YearOverYearSelection = {
    years: ['THIS_YEAR', 'LAST_YEAR'],
    category: 'MONTHS_THIS_YEAR',
}

/** The relative years of the official app's year-over-year series. */
export const RELATIVE_YEARS = ['THIS_YEAR', 'LAST_YEAR', 'LAST_5_YEARS', 'LAST_10_YEARS'] as const

/** The "per year" periods of the official app's year-over-year category. */
export const YEAR_OVER_YEAR_CATEGORIES = [
    'DAYS_THIS_YEAR',
    'WEEKS_THIS_YEAR',
    'MONTHS_THIS_YEAR',
    'BIMONTHS_THIS_YEAR',
    'QUARTERS_THIS_YEAR',
    'SIXMONTHS_THIS_YEAR',
] as const

const RELATIVE_SPANS: Record<string, [number, number]> = {
    THIS_YEAR: [0, 0],
    LAST_YEAR: [1, 1],
    LAST_5_YEARS: [5, 1],
    LAST_10_YEARS: [10, 1],
}

/** The actual years of a selection, newest first: `LAST_5_YEARS` in 2026 -> 2025…2021. */
export const resolveYears = (years: readonly string[], today: Date = new Date()): number[] => {
    const current = today.getFullYear()
    const resolved = years.flatMap((year) => {
        if (/^\d{4}$/.test(year)) return [Number(year)]
        const span = RELATIVE_SPANS[year]
        if (!span) return []
        const [from, to] = span
        return Array.from({ length: from - to + 1 }, (_, index) => current - to - index)
    })
    return [...new Set(resolved)].sort((a, b) => b - a)
}

const asList = (value: string | string[] | undefined) => (value === undefined ? [] : [value].flat())

/**
 * One analytics request per year: the category periods as the only dimension, everything
 * else (data, org units, other dimensions) as filters, computed relative to that year.
 */
export const yearOverYearParams = (
    params: AnalyticsParams,
    category: string,
    years: readonly number[]
): AnalyticsParams[] => {
    const others = (params.dimension ?? []).filter((entry) => !entry.startsWith('pe:'))
    const base: AnalyticsParams = {
        ...params,
        dimension: [`pe:${category}`],
        filter: [...others, ...asList(params.filter)],
    }
    return years.map((year) => ({ ...base, relativePeriodDate: `${year}-12-31` }))
}

/** A period name without its year: "January 2024" -> "January", "2024W5" -> "W5". */
const genericPeriodName = (id: string, name: string) => {
    const week = /W(\d+)$/.exec(id)
    if (week) return `W${week[1]}`
    const day = /^\d{4}(\d{2})(\d{2})$/.exec(id)
    if (day) return `${day[1]}-${day[2]}`
    return (
        name
            .replace(/\b\d{4}\b/g, '')
            .replace(/\s+/g, ' ')
            .trim() || name
    )
}

/** What the DHIS2 chart engine needs to draw year-over-year responses (one per year). */
export const yearOverYearExtraOptions = (
    responses: readonly AnalyticsResponse[],
    years: readonly number[]
) => {
    const periodKeyAxisIndexMap: Record<string, number> = {}
    let longest: AnalyticsResponse | undefined
    for (const response of responses) {
        const periods = response.metaData.dimensions.pe ?? []
        periods.forEach((id, index) => {
            periodKeyAxisIndexMap[id] = index
        })
        if (!longest || periods.length > (longest.metaData.dimensions.pe ?? []).length) {
            longest = response
        }
    }
    const xAxisLabels = (longest?.metaData.dimensions.pe ?? []).map((id) =>
        genericPeriodName(id, longest?.metaData.items[id]?.name ?? id)
    )
    return { yearlySeries: years.map(String), xAxisLabels, periodKeyAxisIndexMap }
}
