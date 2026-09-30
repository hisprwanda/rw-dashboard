import type { SupportedCalendar } from '@dhis2/multi-calendar-dates/build/types/types'
import type { DataItemRef } from '@/features/analytics'
import type { ChartType } from '@/features/charts'
import type { InstanceConnection } from '@/shared/api'
import type { Shareable, UserRef } from '@/shared/types/common.types'
import type { DataStoreEntry } from '@/shared/types/dhis2.types'

/** Text written by the bulletin author, per locale (`{ en: '…', fr: '…' }`). */
export type LocalizedText = Record<string, string>

/** A DHIS2 object picked in the editor: the id is used, the name is only for display. */
export interface MetadataRef {
    id: string
    name: string
}

/** Org-unit dimension of a bulletin (same keywords as the analytics `ou:` dimension). */
export interface BulletinOrgUnits {
    useCurrentUserOrgUnits: boolean
    userOrgUnitScope: {
        is_USER_ORGUNIT: boolean
        is_USER_ORGUNIT_CHILDREN: boolean
        is_USER_ORGUNIT_GRANDCHILDREN: boolean
    }
    orgUnits: MetadataRef[]
    levelIds: string[]
    groupIds: string[]
}

interface SectionBase {
    id: string
    title: LocalizedText
    description?: LocalizedText
}

export interface CoverSection extends SectionBase {
    type: 'cover'
    /** Uploaded images as data URLs (kept small: see MAX_LOGO_BYTES). */
    logos: string[]
    subtitle: LocalizedText
}

export interface TextSection extends SectionBase {
    type: 'text'
    body: LocalizedText
}

/** One chart per data item over the selected period and the ones before it. */
export interface IndicatorTrendsSection extends SectionBase {
    type: 'indicatorTrends'
    dataItems: DataItemRef[]
    /** Number of periods shown before the selected one. */
    lookback: number
    chartType: ChartType
}

export type CaseCategory = 'case' | 'death' | 'publicEvent'

/** Maps a value of the grouping field to a category (case-insensitive "contains"). */
export interface CategoryRule {
    match: string
    category: CaseCategory
}

/** Enrollments of a tracker program, grouped by an attribute (e.g. the disease). */
export interface TrackerCasesSection extends SectionBase {
    type: 'trackerCases'
    program: MetadataRef | null
    /** Tracked entity attribute holding the disease / event type. */
    groupBy: MetadataRef | null
    /** Values not matched by a rule count as cases. */
    rules: CategoryRule[]
}

/** Events of a program, counted by a code (and optionally a location and a count). */
export interface EventSignalsSection extends SectionBase {
    type: 'eventSignals'
    program: MetadataRef | null
    codeElement: MetadataRef | null
    locationElement: MetadataRef | null
    /** When set, its value is summed instead of counting events. */
    countElement: MetadataRef | null
}

/** Reporting rates of data sets by org unit over recent periods. */
export interface CompletenessSection extends SectionBase {
    type: 'completeness'
    dataSets: MetadataRef[]
    /** Org unit level of the rows (1 = root). */
    orgUnitLevel: number
    lookback: number
    /** Rates at or above `good` are green, at or above `fair` orange, below red. */
    thresholds: { good: number; fair: number }
}

/** A table the author fills in for each issue. */
export interface OutbreaksSection extends SectionBase {
    type: 'outbreaks'
    columns: Array<{ id: string; label: LocalizedText }>
}

/** Free text the author writes for each issue. */
export interface NotesSection extends SectionBase {
    type: 'notes'
}

export type BulletinSection =
    | CoverSection
    | TextSection
    | IndicatorTrendsSection
    | TrackerCasesSection
    | EventSignalsSection
    | CompletenessSection
    | OutbreaksSection
    | NotesSection

export type BulletinSectionType = BulletinSection['type']

/** A bulletin definition, stored in the bulletin templates dataStore namespace. */
export type BulletinTemplate = Shareable & {
    id: string
    name: string
    description: string
    /** Saved data source key, or the current instance id. */
    dataSourceId: string
    periodType: string
    orgUnits: BulletinOrgUnits
    /** Content languages; the first one is the fallback. */
    languages: string[]
    sections: BulletinSection[]
    createdBy: UserRef
    updatedBy: UserRef
    createdAt: number
    updatedAt: number
}

export type BulletinTemplateEntry = DataStoreEntry<BulletinTemplate>

export type OutbreakRow = Record<string, string>

/** One period of a bulletin: what the author adds to the computed sections. */
export type BulletinIssue = {
    templateId: string
    periodId: string
    status: 'draft' | 'published'
    notes: Record<string, LocalizedText>
    outbreaks: Record<string, OutbreakRow[]>
    updatedBy: UserRef
    updatedAt: number
    publishedAt?: number
}

/** Everything a section needs to fetch and render for one issue. */
export interface BulletinContext {
    templateId: string
    instance: InstanceConnection
    periodId: string
    /** Start and end dates of the period (ISO). */
    range: { startDate: string; endDate: string }
    /** Display name of the period, in the user's language. */
    periodName: string
    calendar: SupportedCalendar
    /** Content language picked in the issue view. */
    language: string
    languages: string[]
    orgUnits: BulletinOrgUnits
}
