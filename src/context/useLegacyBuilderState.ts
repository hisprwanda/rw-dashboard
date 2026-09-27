import { useAppSelector, type RootState } from '@/app/store'
import {
    selectionActions as selection,
    type AnalyticsDimensions,
    type AnalyticsLayout,
    type DataItemRef,
    type DimensionItemType,
    type SelectedDataSource,
} from '@/features/analytics'
import type { ChartType, ColorPalette, VisualSettings, VisualTitles } from '@/features/charts'
import { visualizerActions as visualizer } from '@/features/visualizers'
import { useLegacySetter } from './useLegacySetter'

/**
 * TEMPORARY bridge (Phase 6 → 8): the builder state now lives in the `selection`
 * (shared) and `visualizer` Redux slices; this exposes it with the old AuthContext
 * names and setters. Delete with AuthContext.
 */
const s = {
    dataSourceId: (st: RootState) => st.selection.dataSourceId,
    dataSource: (st: RootState) => st.selection.dataSource,
    dimensions: (st: RootState) => st.selection.dimensions,
    itemType: (st: RootState) => st.selection.dimensionItemType,
    layout: (st: RootState) => st.selection.layout,
    items: (st: RootState) => st.selection.selectedDataItems,
    chartType: (st: RootState) => st.visualizer.chartType,
    titles: (st: RootState) => st.visualizer.titles,
    settings: (st: RootState) => st.visualizer.settings,
    palette: (st: RootState) => st.visualizer.colorPalette,
}

export const useLegacyBuilderState = () => {
    const sel = useAppSelector((st) => st.selection)
    const vis = useAppSelector((st) => st.visualizer)
    return {
        selectedDataSourceOption: sel.dataSourceId,
        setSelectedDataSourceOption: useLegacySetter<string>(
            s.dataSourceId,
            selection.setDataSourceId
        ),
        selectedDataSourceDetails: sel.dataSource,
        setSelectedDataSourceDetails: useLegacySetter<SelectedDataSource>(
            s.dataSource,
            selection.setDataSource
        ),
        analyticsDimensions: sel.dimensions,
        setAnalyticsDimensions: useLegacySetter<AnalyticsDimensions>(
            s.dimensions,
            selection.setDimensions
        ),
        selectedDimensionItemType: sel.dimensionItemType,
        setSelectedDimensionItemType: useLegacySetter<DimensionItemType>(
            s.itemType,
            selection.setDimensionItemType
        ),
        analyticsPayloadDeterminer: sel.layout,
        setAnalyticsPayloadDeterminer: useLegacySetter<AnalyticsLayout>(
            s.layout,
            selection.setLayout
        ),
        backedSelectedItems: sel.selectedDataItems,
        setBackedSelectedItems: useLegacySetter<DataItemRef[]>(
            s.items,
            selection.setSelectedDataItems
        ),
        selectedChartType: vis.chartType,
        setSelectedChartType: useLegacySetter<ChartType>(s.chartType, visualizer.setChartType),
        visualTitleAndSubTitle: vis.titles,
        setSelectedVisualTitleAndSubTitle: useLegacySetter<VisualTitles>(
            s.titles,
            visualizer.setTitles
        ),
        visualSettings: vis.settings,
        setSelectedVisualSettings: useLegacySetter<VisualSettings>(
            s.settings,
            visualizer.setSettings
        ),
        selectedColorPalette: vis.colorPalette,
        setSelectedColorPalette: useLegacySetter<ColorPalette>(
            s.palette,
            visualizer.setColorPalette
        ),
    }
}
