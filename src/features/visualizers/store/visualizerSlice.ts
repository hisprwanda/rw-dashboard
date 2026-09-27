import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
    DEFAULT_CHART_TYPE,
    DEFAULT_COLOR_PALETTE,
    type ChartType,
    type ColorPalette,
    type VisualSettings,
    type VisualTitles,
} from '@/features/charts'

/** Appearance of the visualization being built. */
export interface VisualizerState {
    chartType: ChartType
    titles: VisualTitles
    settings: VisualSettings
    colorPalette: ColorPalette
}

export const initialVisualizer: VisualizerState = {
    chartType: DEFAULT_CHART_TYPE,
    titles: {
        visualTitle: '',
        customSubTitle: '',
        DefaultSubTitle: { periods: [], orgUnits: [], dataElements: [] },
    },
    settings: {
        backgroundColor: '#ffffff',
        visualColorPalette: DEFAULT_COLOR_PALETTE,
        fillColor: '#000000',
        XAxisSettings: { color: '#000000', fontSize: 12 },
        YAxisSettings: { color: '#000000', fontSize: 12 },
    },
    colorPalette: DEFAULT_COLOR_PALETTE,
}

const visualizerSlice = createSlice({
    name: 'visualizer',
    initialState: initialVisualizer,
    reducers: {
        setChartType: (state, action: PayloadAction<ChartType>) => {
            state.chartType = action.payload
        },
        setTitles: (state, action: PayloadAction<VisualTitles>) => {
            state.titles = action.payload
        },
        setSettings: (state, action: PayloadAction<VisualSettings>) => {
            state.settings = action.payload
        },
        setColorPalette: (state, action: PayloadAction<ColorPalette>) => {
            state.colorPalette = action.payload
        },
        resetVisualizer: () => initialVisualizer,
    },
})

export const visualizerActions = visualizerSlice.actions
export const visualizerReducer = visualizerSlice.reducer
