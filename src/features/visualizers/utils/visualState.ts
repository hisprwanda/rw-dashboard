import {
    initialSelection,
    parseAnalyticsDimensions,
    parseOrgUnitDimension,
    type AdditionalSource,
    type SelectedDataSource,
    type SelectionState,
} from '@/features/analytics'
import { CURRENT_INSTANCE_ID } from '@/features/data-sources'
import type { OrgUnitSelectionState } from '@/features/org-units'
import { initialVisualizer, type VisualizerState } from '../store/visualizerSlice'
import type { SavedVisual } from '../types/visual.types'

export interface BuilderState {
    selection: SelectionState
    orgUnits: OrgUnitSelectionState
    visualizer: VisualizerState
}

/**
 * The builder state (Redux slices) that restores a saved visual. The org-unit selection
 * is read back from the saved `ou:` filter; the tree paths and levels from their copies.
 * The saved query holds the data items of every source: those of `additionalSources`
 * (resolved by the caller) are left out of the main source's items.
 */
export const visualToBuilderState = (
    visual: SavedVisual,
    dataSource: SelectedDataSource,
    additionalSources: AdditionalSource[] = []
): BuilderState => {
    const params = visual.query?.myData?.params
    const orgUnit = parseOrgUnitDimension(params?.filter)
    const dimensions = parseAnalyticsDimensions(params?.dimension)
    const additionalIds = new Set(
        additionalSources.flatMap(({ items }) => items.map(({ id }) => id))
    )
    if (dimensions.dx) dimensions.dx = dimensions.dx.filter((id) => !additionalIds.has(id))
    return {
        selection: {
            ...initialSelection,
            dataSourceId: visual.dataSourceId || CURRENT_INSTANCE_ID,
            dataSource,
            dimensions,
            layout: visual.analyticsPayloadDeterminer ?? initialSelection.layout,
            selectedDataItems: visual.backedSelectedItems ?? [],
            additionalSources,
        },
        orgUnits: {
            useCurrentUserOrgUnits: orgUnit.useCurrentUserOrgUnits,
            userOrgUnitScope: orgUnit.userOrgUnitScope,
            selectedOrgUnitIds: [...orgUnit.orgUnitIds],
            selectedLevelIds: [...orgUnit.levelIds],
            selectedGroupIds: [...orgUnit.groupIds],
            selectedTreePaths: visual.organizationTree ?? [],
            selectedLevels: visual.selectedOrgUnitLevel ?? null,
        },
        visualizer: {
            chartType: visual.visualType ?? initialVisualizer.chartType,
            titles: visual.visualTitleAndSubTitle ?? initialVisualizer.titles,
            settings: visual.visualSettings ?? initialVisualizer.settings,
            colorPalette:
                visual.visualSettings?.visualColorPalette ?? initialVisualizer.colorPalette,
            options: { ...initialVisualizer.options, ...visual.visualOptions },
            yearOverYear: visual.yearOverYear ?? initialVisualizer.yearOverYear,
        },
    }
}
