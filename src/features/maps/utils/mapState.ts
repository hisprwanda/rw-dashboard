import {
    initialSelection,
    parseAnalyticsDimensions,
    parseOrgUnitDimension,
    type SelectedDataSource,
    type SelectionState,
} from '@/features/analytics'
import { CURRENT_INSTANCE_ID } from '@/features/data-sources'
import type { OrgUnitSelectionState } from '@/features/org-units'
import { initialMapBuilder, type MapBuilderState } from '../store/mapBuilderSlice'
import type { MapLabelKind, MapSettings, SavedMap } from '../types/map.types'

export interface MapBuilderStoreState {
    selection: SelectionState
    orgUnits: OrgUnitSelectionState
    mapBuilder: MapBuilderState
}

const LABEL_KINDS: readonly MapLabelKind[] = ['area', 'data', 'period', 'value']

const labelsOf = (value: unknown): MapLabelKind[] =>
    Array.isArray(value) ? LABEL_KINDS.filter((kind) => value.includes(kind)) : []

/** Saved settings may be missing or partial (older maps): fill the gaps. */
export const normalizeMapSettings = (settings: Partial<MapSettings> | undefined): MapSettings => {
    const labels = labelsOf(settings?.appliedLabels ?? settings?.selectedLabels)
    const legend = settings?.legend
    return {
        appliedLabels: labels,
        selectedLabels: labels,
        legend: legend && Array.isArray(legend.legends) ? legend : {},
        legendType: settings?.legendType === 'dhis2' ? 'dhis2' : 'auto',
    }
}

/** The builder state that restores a saved map (selection read back from its query). */
export const mapToBuilderState = (
    saved: SavedMap,
    dataSource: SelectedDataSource
): MapBuilderStoreState => {
    const params = saved.queries?.mapAnalyticsQueryOne?.myData?.params
    const dimension = params?.dimension ?? []
    const filters = typeof params?.filter === 'string' ? [params.filter] : (params?.filter ?? [])
    const orgUnit = parseOrgUnitDimension(dimension.find((d) => d.startsWith('ou:')))
    return {
        selection: {
            ...initialSelection,
            dataSourceId: saved.dataSourceId || CURRENT_INSTANCE_ID,
            dataSource,
            dimensions: parseAnalyticsDimensions([
                ...dimension.filter((d) => !d.startsWith('ou:')),
                ...filters,
            ]),
            selectedDataItems: saved.backedSelectedItems ?? [],
        },
        orgUnits: {
            useCurrentUserOrgUnits: orgUnit.useCurrentUserOrgUnits,
            userOrgUnitScope: orgUnit.userOrgUnitScope,
            selectedOrgUnitIds: [...orgUnit.orgUnitIds],
            selectedLevelIds: [...orgUnit.levelIds],
            selectedGroupIds: [...orgUnit.groupIds],
            selectedTreePaths: saved.organizationTree ?? [],
            selectedLevels: saved.selectedOrgUnitLevel ?? null,
        },
        mapBuilder: {
            basemap: saved.BasemapType ?? initialMapBuilder.basemap,
            settings: normalizeMapSettings(saved.mapSettings),
        },
    }
}
