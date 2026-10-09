import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { placeDimension } from '../utils/layout'
import type {
    AdditionalSource,
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
    /** Data items from other data sources, combined with the main one's in one visual. */
    additionalSources: AdditionalSource[]
}

export const initialSelection: SelectionState = {
    dataSourceId: '1',
    dataSource: { isCurrentInstance: true, instanceName: '' },
    dimensions: { dx: [], pe: ['LAST_12_MONTHS'] },
    dimensionItemType: { label: 'All Types', value: 'dataItems' },
    layout: { Columns: ['Data'], Rows: ['Period'], Filter: ['Organisation unit'] },
    selectedDataItems: [],
    additionalSources: [],
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
        /** Sets the items of one dimension; the layout follows (see `placeDimension`). */
        setDimensionItems: (
            state,
            action: PayloadAction<{ dimension: string; items: string[] }>
        ) => {
            const { dimension, items } = action.payload
            state.dimensions[dimension] = items
            state.layout = placeDimension(state.layout, dimension, items.length > 0)
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
        addSource: (
            state,
            action: PayloadAction<{ id: string; dataSource: SelectedDataSource }>
        ) => {
            const { id, dataSource } = action.payload
            if (state.additionalSources.some((source) => source.dataSourceId === id)) return
            state.additionalSources.push({ dataSourceId: id, dataSource, items: [] })
        },
        setSourceItems: (state, action: PayloadAction<{ id: string; items: DataItemRef[] }>) => {
            const source = state.additionalSources.find(
                ({ dataSourceId }) => dataSourceId === action.payload.id
            )
            if (source) source.items = action.payload.items
        },
        removeSource: (state, action: PayloadAction<string>) => {
            state.additionalSources = state.additionalSources.filter(
                ({ dataSourceId }) => dataSourceId !== action.payload
            )
        },
        /** A new data source invalidates every other choice (items differ per instance). */
        changeDataSource: (
            _state,
            action: PayloadAction<{ id: string; dataSource: SelectedDataSource }>
        ) => ({
            ...initialSelection,
            dataSourceId: action.payload.id,
            dataSource: action.payload.dataSource,
        }),
        /** Replaces the whole selection (e.g. when a saved visual is opened). */
        setSelection: (_state, action: PayloadAction<SelectionState>) => action.payload,
        resetSelection: () => initialSelection,
    },
})

export const selectionActions = selectionSlice.actions
export const selectionReducer = selectionSlice.reducer
