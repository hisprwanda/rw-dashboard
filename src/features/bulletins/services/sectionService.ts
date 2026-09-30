import { fetchAnalytics } from '@/features/analytics'
import { fetchAllPages, type InstanceClient } from '@/shared/api'
import type { AnalyticsResponse, IdentifiableObject } from '@/shared/types/dhis2.types'
import type {
    BulletinOrgUnits,
    EventSignalsSection,
    TrackerCasesSection,
} from '../types/bulletin.types'
import { completenessParams, trackerOrgUnitParams, trendParams } from '../utils/requests'
import {
    summarizeEventSignals,
    summarizeTrackerCases,
    type EnrollmentRow,
    type EventRow,
} from '../utils/summaries'

export interface DateRange {
    startDate: string
    endDate: string
}

/** Display names of org units, in chunks (a URL can only hold so many ids). */
export const fetchOrgUnitNames = async (
    client: InstanceClient,
    ids: readonly string[],
    signal?: AbortSignal
): Promise<Map<string, string>> => {
    const names = new Map<string, string>()
    const unique = [...new Set(ids)]
    for (let i = 0; i < unique.length; i += 100) {
        const chunk = unique.slice(i, i + 100)
        const response = await client.get<{ organisationUnits?: IdentifiableObject[] }>(
            'organisationUnits',
            { filter: `id:in:[${chunk.join(',')}]`, fields: 'id,displayName', paging: false },
            signal
        )
        for (const unit of response.organisationUnits ?? []) {
            names.set(unit.id, unit.displayName ?? unit.name ?? unit.id)
        }
    }
    return names
}

export const fetchTrackerCases = async (
    client: InstanceClient,
    section: TrackerCasesSection,
    orgUnits: BulletinOrgUnits,
    range: DateRange,
    signal?: AbortSignal
) => {
    if (!section.program || !section.groupBy) throw new Error('missing-configuration')
    const rows = await fetchAllPages<EnrollmentRow>(
        client,
        'tracker/trackedEntities',
        {
            program: section.program.id,
            enrollmentEnrolledAfter: range.startDate,
            enrollmentEnrolledBefore: range.endDate,
            fields: 'orgUnit,attributes[attribute,value]',
            ...trackerOrgUnitParams(orgUnits),
        },
        { listKeys: ['trackedEntities', 'instances'], signal }
    )
    const names = await fetchOrgUnitNames(
        client,
        rows.map((row) => row.orgUnit),
        signal
    )
    return summarizeTrackerCases(rows, section, (id) => names.get(id) ?? id)
}

export const fetchEventSignals = async (
    client: InstanceClient,
    section: EventSignalsSection,
    orgUnits: BulletinOrgUnits,
    range: DateRange,
    signal?: AbortSignal
) => {
    if (!section.program || !section.codeElement) throw new Error('missing-configuration')
    // Events are filtered on their own date (the old bulletin used enrollment dates).
    const rows = await fetchAllPages<EventRow>(
        client,
        'tracker/events',
        {
            program: section.program.id,
            occurredAfter: range.startDate,
            occurredBefore: range.endDate,
            fields: 'orgUnit,dataValues[dataElement,value]',
            ...trackerOrgUnitParams(orgUnits),
        },
        { listKeys: ['events', 'instances'], signal }
    )
    return summarizeEventSignals(rows, section)
}

export const fetchTrends = (
    client: InstanceClient,
    dataItemIds: readonly string[],
    periodIds: readonly string[],
    orgUnits: BulletinOrgUnits,
    displayProperty: 'NAME' | 'SHORTNAME',
    signal?: AbortSignal
): Promise<AnalyticsResponse> =>
    fetchAnalytics(client, trendParams(dataItemIds, periodIds, orgUnits, displayProperty), signal)

export const fetchCompleteness = (
    client: InstanceClient,
    dataSetIds: readonly string[],
    periodIds: readonly string[],
    orgUnits: BulletinOrgUnits,
    level: number,
    displayProperty: 'NAME' | 'SHORTNAME',
    signal?: AbortSignal
): Promise<AnalyticsResponse> =>
    fetchAnalytics(
        client,
        completenessParams(dataSetIds, periodIds, orgUnits, level, displayProperty),
        signal
    )
