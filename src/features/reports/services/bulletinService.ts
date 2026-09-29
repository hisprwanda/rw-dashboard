import type { QueryClient } from '@tanstack/react-query'
import { orgUnitNameQueryOptions } from '@/features/org-units'
import { fetchResource, type DataEngine } from '@/shared/api'
import { env } from '@/shared/constants/env'
import { BULLETIN_PROGRAMS, BULLETIN_ROOT_ORG_UNIT } from '../constants/bulletin'
import type {
    BulletinTemplate,
    BulletinTrackerSummary,
    TrackedEntityRow,
    TrackerEventRow,
} from '../types/bulletin.types'
import { summarizeCommunityEvents, summarizeEnrollments } from '../utils/summarize'

export interface DateRange {
    startDate: string
    endDate: string
}

export const fetchBulletinTemplate = (engine: DataEngine, signal?: AbortSignal) =>
    fetchResource<BulletinTemplate>(
        engine,
        `dataStore/${env.bulletinStore}/${env.bulletinTemplateKey}`,
        undefined,
        signal
    )

// The tracker API answers `{ trackedEntities | events: [...] }` (2.41+) or `{ instances }`.
type ListResponse<K extends string, T> = Partial<Record<K | 'instances', T[]>> & {
    total?: number
    pager?: { total?: number }
}

const fetchEnrollments = async (engine: DataEngine, range: DateRange, signal?: AbortSignal) => {
    const response = await fetchResource<ListResponse<'trackedEntities', TrackedEntityRow>>(
        engine,
        'tracker/trackedEntities',
        {
            enrollmentEnrolledAfter: range.startDate,
            enrollmentEnrolledBefore: range.endDate,
            orgUnit: BULLETIN_ROOT_ORG_UNIT,
            program: BULLETIN_PROGRAMS.immediateReportable,
            fields: 'orgUnit,attributes[attribute,displayName,value]',
            totalPages: true,
            ouMode: 'DESCENDANTS',
            skipPaging: true,
        },
        signal
    )
    return response.trackedEntities ?? response.instances ?? []
}

const fetchEvents = async (
    engine: DataEngine,
    program: string,
    range: DateRange,
    signal?: AbortSignal
) => {
    const response = await fetchResource<ListResponse<'events', TrackerEventRow>>(
        engine,
        'tracker/events',
        {
            orgUnit: BULLETIN_ROOT_ORG_UNIT,
            program,
            fields: 'orgUnit,dataValues[dataElement,value]',
            totalPages: true,
            ouMode: 'DESCENDANTS',
            enrollmentEnrolledAfter: range.startDate,
            enrollmentEnrolledBefore: range.endDate,
        },
        signal
    )
    const rows = response.events ?? response.instances ?? []
    return { rows, total: response.total ?? response.pager?.total ?? rows.length }
}

/** Everything the bulletin reads from the tracker programs for one week. */
export const fetchBulletinTracker = async (
    engine: DataEngine,
    queryClient: QueryClient,
    range: DateRange,
    signal?: AbortSignal
): Promise<BulletinTrackerSummary> => {
    const [enrollments, community, malaria] = await Promise.all([
        fetchEnrollments(engine, range, signal),
        fetchEvents(engine, BULLETIN_PROGRAMS.community, range, signal),
        fetchEvents(engine, BULLETIN_PROGRAMS.malaria, range, signal),
    ])

    // Names of the facilities that reported deaths, fetched in parallel and cached.
    const names = new Map<string, string>()
    await Promise.all(
        [...new Set(enrollments.map((row) => row.orgUnit))].map(async (id) => {
            const name = await queryClient
                .fetchQuery(orgUnitNameQueryOptions(engine, undefined, id))
                .catch(() => id)
            names.set(id, name)
        })
    )

    const enrollmentSummary = summarizeEnrollments(enrollments, (id) => names.get(id) ?? id)
    const communitySummary = summarizeCommunityEvents([...malaria.rows, ...community.rows])
    return {
        ...enrollmentSummary,
        communityMessages: communitySummary.messages,
        communityAlerts: communitySummary.alerts,
        totalCommunityEvents: malaria.total + community.total,
    }
}
