import type { AnalyticsLayout, DataItemRef, StoredAnalyticsQuery } from '@/features/analytics'
import type { ChartType, VisualSettings, VisualTitles } from '@/features/charts'
import type { Shareable, UserRef } from '@/shared/types/common.types'
import type { DataStoreEntry } from '@/shared/types/dhis2.types'

/** A data item picked in the Data modal (kept to restore the modal's selection). */
export type BackedSelectedItem = DataItemRef

/** A visualization as stored in the visuals dataStore namespace. */
export type SavedVisual = Shareable & {
    id: string
    visualName: string
    description: string
    visualType: ChartType
    visualTitleAndSubTitle: VisualTitles
    visualSettings: VisualSettings
    query: StoredAnalyticsQuery
    analyticsPayloadDeterminer: AnalyticsLayout
    dataSourceId: string
    createdBy: UserRef
    updatedBy: UserRef
    createdAt: number
    updatedAt: number
    organizationTree?: string[]
    selectedOrgUnitLevel?: number[]
    backedSelectedItems: BackedSelectedItem[]
}

export type SavedVisualEntry = DataStoreEntry<SavedVisual>
