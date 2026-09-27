import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
    AnalyticsDimensions,
    AnalyticsLayout,
    DataItemRef,
    DimensionItemType,
    SelectedDataSource,
} from '../types/analytics.types'

/** What a builder (visualizer, map, report) is analysing. Shared by all builders. */
export interface SelectionState {
    /** Saved data source id, or "1" for the current instance. */
    dataSourceId: string
    dataSource: SelectedDataSource
    dimensions: AnalyticsDimensions
    dimensionItemType: DimensionItemType
    layout: AnalyticsLayout
    selectedDataItems: DataItemRef[]
}

export const initialSelection: SelectionState = {
    dataSourceId: '1',
    dataSource: { isCurrentInstance: true, instanceName: '' },
    dimensions: { dx: [], pe: ['LAST_12_MONTHS'] },
    dimensionItemType: { label: 'All Types', value: 'dataItems' },
    layout: { Columns: ['Data'], Rows: ['Period'], Filter: ['Organisation unit'] },
    selectedDataItems: [],
}

const selectionSlice = createSlice({
    name: 'selection',
    initialState: initialSelection,
    reducers: {
        setDataSourceId: (state, action: PayloadAction<string>) => {
            state.dataSourceId = action.payload
        },
        setDataSource: (state, action: PayloadAction<SelectedDataSource>) => {
            state.dataSource = action.payload
        },
        setDimensions: (state, action: PayloadAction<AnalyticsDimensions>) => {
            state.dimensions = action.payload
        },
        setDimensionItemType: (state, action: PayloadAction<DimensionItemType>) => {
            state.dimensionItemType = action.payload
        },
        setLayout: (state, action: PayloadAction<AnalyticsLayout>) => {
            state.layout = action.payload
        },
        setSelectedDataItems: (state, action: PayloadAction<DataItemRef[] | undefined>) => {
            state.selectedDataItems = action.payload ?? []
        },
        resetSelection: () => initialSelection,
    },
})

export const selectionActions = selectionSlice.actions
export const selectionReducer = selectionSlice.reducer
