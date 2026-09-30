import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import type {
    CaseCategory,
    CategoryRule,
    EventSignalsSection,
    TrackerCasesSection,
} from '../types/bulletin.types'

/** Raw tracker rows read by the summaries. */
export interface EnrollmentRow {
    orgUnit: string
    attributes?: Array<{ attribute: string; value: string }>
}

export interface EventRow {
    orgUnit: string
    dataValues?: Array<{ dataElement: string; value: string }>
}

export interface NameValue {
    name: string
    value: number
}

export interface GroupCount {
    name: string
    category: CaseCategory
    count: number
    /** Distinct org units (facilities) that reported it. */
    orgUnits: number
}

const increment = (counts: Map<string, number>, key: string, by = 1) =>
    counts.set(key, (counts.get(key) ?? 0) + by)

const addTo = (sets: Map<string, Set<string>>, key: string, orgUnit: string) => {
    const set = sets.get(key) ?? new Set<string>()
    set.add(orgUnit)
    sets.set(key, set)
}

const byCountDesc = <T extends { count: number; name: string }>(a: T, b: T) =>
    b.count - a.count || a.name.localeCompare(b.name)

/** The first rule whose text is contained in the value (case-insensitive); else a case. */
export const categoryFor = (value: string, rules: readonly CategoryRule[]): CaseCategory => {
    const lower = value.toLowerCase()
    return rules.find((rule) => lower.includes(rule.match.toLowerCase()))?.category ?? 'case'
}

/** Enrollments of a tracker program grouped by the configured attribute. */
export const summarizeTrackerCases = (
    rows: readonly EnrollmentRow[],
    section: Pick<TrackerCasesSection, 'groupBy' | 'rules'>,
    orgUnitName: (id: string) => string
) => {
    const counts = new Map<string, number>()
    const units = new Map<string, Set<string>>()
    const deathsByUnit = new Map<string, number>()
    const attribute = section.groupBy?.id

    for (const row of rows) {
        const value = row.attributes?.find((a) => a.attribute === attribute)?.value?.trim()
        if (!value) continue
        increment(counts, value)
        addTo(units, value, row.orgUnit)
        if (categoryFor(value, section.rules) === 'death') increment(deathsByUnit, row.orgUnit)
    }

    const groups: GroupCount[] = [...counts]
        .map(([name, count]) => ({
            name,
            count,
            category: categoryFor(name, section.rules),
            orgUnits: units.get(name)?.size ?? 0,
        }))
        .sort(byCountDesc)
    const inCategory = (category: CaseCategory) => groups.filter((g) => g.category === category)
    const total = (list: GroupCount[]) => list.reduce((sum, g) => sum + g.count, 0)
    const deaths = inCategory('death')
    const publicEvents = inCategory('publicEvent')

    return {
        totalEnrollments: groups.reduce((sum, g) => sum + g.count, 0),
        cases: inCategory('case'),
        deaths,
        publicEvents,
        totalDeaths: total(deaths),
        totalPublicEvents: total(publicEvents),
        deathsByType: deaths.map((g) => ({ name: g.name, value: g.count })),
        deathsByFacility: [...deathsByUnit]
            .map(([id, value]) => ({ name: orgUnitName(id), value }))
            .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name)),
        facilities: new Set(rows.map((row) => row.orgUnit)).size,
    }
}

export type TrackerCasesSummary = ReturnType<typeof summarizeTrackerCases>

export interface SignalCount {
    name: string
    count: number
    orgUnits: number
}

/**
 * Events grouped by the code element (and location, when configured). With a count
 * element its numeric value is summed, otherwise each event counts as one.
 */
export const summarizeEventSignals = (
    events: readonly EventRow[],
    section: Pick<EventSignalsSection, 'codeElement' | 'locationElement' | 'countElement'>
) => {
    const counts = new Map<string, number>()
    const units = new Map<string, Set<string>>()
    for (const event of events) {
        const value = (id: string | undefined) =>
            id ? event.dataValues?.find((d) => d.dataElement === id)?.value?.trim() : undefined
        const code = value(section.codeElement?.id)
        if (!code) continue
        const location = value(section.locationElement?.id)
        const key = location ? `${code} - ${location}` : code
        const amount = section.countElement
            ? Number.parseFloat(value(section.countElement.id) ?? '') || 0
            : 1
        increment(counts, key, amount)
        addTo(units, key, event.orgUnit)
    }
    const signals: SignalCount[] = [...counts]
        .map(([name, count]) => ({ name, count, orgUnits: units.get(name)?.size ?? 0 }))
        .sort(byCountDesc)
    return { signals, total: signals.reduce((sum, s) => sum + s.count, 0), events: events.length }
}

export type EventSignalsSummary = ReturnType<typeof summarizeEventSignals>

export interface CompletenessRow {
    id: string
    label: string
    /** Reporting rate (%) per period, in the given period order; `null` = no data. */
    values: Array<number | null>
}

/**
 * Reporting-rate rows (org unit × data set) from an analytics response with `dx`
 * (`<dataSet>.REPORTING_RATE`), `pe` and `ou` as dimensions.
 */
export const buildCompletenessMatrix = (
    response: AnalyticsResponse | undefined,
    periodIds: readonly string[]
): CompletenessRow[] => {
    if (!response?.rows?.length) return []
    const column = (name: string) => response.headers.findIndex((h) => h.name === name)
    const [dx, pe, ou, value] = [column('dx'), column('pe'), column('ou'), column('value')]
    if (dx < 0 || pe < 0 || ou < 0 || value < 0) return []
    const nameOf = (id: string) => response.metaData?.items?.[id]?.name ?? id
    const dataItems = new Set(response.rows.map((row) => row[dx] ?? ''))
    const rows = new Map<string, CompletenessRow>()
    for (const row of response.rows) {
        const [dataItem, period, orgUnit] = [row[dx] ?? '', row[pe] ?? '', row[ou] ?? '']
        const key = `${orgUnit}|${dataItem}`
        const entry = rows.get(key) ?? {
            id: key,
            label:
                dataItems.size > 1
                    ? `${nameOf(orgUnit)} – ${nameOf(dataItem.split('.')[0] ?? dataItem)}`
                    : nameOf(orgUnit),
            values: periodIds.map(() => null),
        }
        const index = periodIds.indexOf(period)
        const rate = Number(row[value])
        if (index >= 0 && Number.isFinite(rate)) entry.values[index] = rate
        rows.set(key, entry)
    }
    return [...rows.values()].sort((a, b) => a.label.localeCompare(b.label))
}

export type CompletenessLevel = 'good' | 'fair' | 'poor' | 'none'

export const completenessLevel = (
    value: number | null,
    thresholds: { good: number; fair: number }
): CompletenessLevel => {
    if (value === null) return 'none'
    if (value >= thresholds.good) return 'good'
    if (value >= thresholds.fair) return 'fair'
    return 'poor'
}
