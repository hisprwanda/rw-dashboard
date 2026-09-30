import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_BASEMAP } from '../constants/basemaps'
import type {
    BasemapType,
    LegendType,
    MapLabelKind,
    MapLegendSet,
    MapSettings,
} from '../types/map.types'

/** Appearance of the map being built (the data selection lives in `selection`). */
export interface MapBuilderState {
    basemap: BasemapType
    settings: MapSettings
}

export const initialMapBuilder: MapBuilderState = {
    basemap: DEFAULT_BASEMAP,
    settings: { appliedLabels: [], selectedLabels: [], legend: {}, legendType: 'auto' },
}

const mapBuilderSlice = createSlice({
    name: 'mapBuilder',
    initialState: initialMapBuilder,
    reducers: {
        setBasemap: (state, action: PayloadAction<BasemapType>) => {
            state.basemap = action.payload
        },
        setLabels: (state, action: PayloadAction<MapLabelKind[]>) => {
            state.settings.appliedLabels = action.payload
            state.settings.selectedLabels = action.payload
        },
        setLegendType: (state, action: PayloadAction<LegendType>) => {
            state.settings.legendType = action.payload
        },
        setLegendSet: (state, action: PayloadAction<MapLegendSet>) => {
            state.settings.legend = action.payload
        },
        setMapBuilder: (_state, action: PayloadAction<MapBuilderState>) => action.payload,
        resetMapBuilder: () => initialMapBuilder,
    },
})

export const mapBuilderActions = mapBuilderSlice.actions
export const mapBuilderReducer = mapBuilderSlice.reducer
