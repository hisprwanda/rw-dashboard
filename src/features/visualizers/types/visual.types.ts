import type { AnalyticsLayout, DataItemRef, StoredAnalyticsQuery } from '@/features/analytics'
import type { ChartType, VisualSettings, VisualTitles } from '@/features/charts'
import type { Shareable, UserRef } from '@/shared/types/common.types'
import type { VisualizerOptions } from './visualization.types'
import type { DataStoreEntry } from '@/shared/types/dhis2.types'

/** A data item picked in the Data modal (kept to restore the modal's selection). */
export type BackedSelectedItem = DataItemRef

/** Data items of a visual that come from another data source than its main one. */
export interface SavedAdditionalSource {
    dataSourceId: string
    dataItems: DataItemRef[]
}

/** A visualization as stored in the visuals dataStore namespace. */
export type SavedVisual = Shareable & {
    id: string
    visualName: string
    description: string
    visualType: ChartType
    visualTitleAndSubTitle: VisualTitles
    visualSettings: VisualSettings
    /** Options of the DHIS2 chart engine; absent in visuals saved before they existed. */
    visualOptions?: VisualizerOptions
    query: StoredAnalyticsQuery
    analyticsPayloadDeterminer: AnalyticsLayout
    dataSourceId: string
    /** Data items read from other data sources; absent in single-source visuals. */
    additionalSources?: SavedAdditionalSource[]
    createdBy: UserRef
    updatedBy: UserRef
    createdAt: number
    updatedAt: number
    organizationTree?: string[]
    selectedOrgUnitLevel?: number[]
    backedSelectedItems: BackedSelectedItem[]
}

export type SavedVisualEntry = DataStoreEntry<SavedVisual>
