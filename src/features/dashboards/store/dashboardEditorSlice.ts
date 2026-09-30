import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
    DashboardDhis2Item,
    DashboardMapItem,
    DashboardVisualItem,
    GridPosition,
    SavedDashboard,
} from '../types/dashboard.types'
import { withGridLayout, type DashboardDraft } from '../utils/dashboardItems'

export type DashboardEditorState = DashboardDraft

export const DEFAULT_DASHBOARD_BACKGROUND = '#dcdcdc'

export const initialDashboardEditor: DashboardEditorState = {
    name: '',
    description: '',
    isOfficial: false,
    backgroundColor: DEFAULT_DASHBOARD_BACKGROUND,
    visuals: [],
    maps: [],
    dhis2Items: [],
}

const dashboardEditorSlice = createSlice({
    name: 'dashboardEditor',
    initialState: initialDashboardEditor,
    reducers: {
        loadDashboard: (_state, action: PayloadAction<SavedDashboard>) => {
            const d = action.payload
            return {
                name: d.dashboardName ?? '',
                description: d.dashboardDescription ?? '',
                isOfficial: !!d.isOfficialDashboard,
                backgroundColor:
                    d.dashboardSettings?.backgroundColor ?? DEFAULT_DASHBOARD_BACKGROUND,
                visuals: d.selectedVisuals ?? [],
                maps: d.selectedMaps ?? [],
                dhis2Items: d.selectedDhis2Items ?? [],
            }
        },
        setName: (state, action: PayloadAction<string>) => {
            state.name = action.payload
        },
        setDescription: (state, action: PayloadAction<string>) => {
            state.description = action.payload
        },
        setOfficial: (state, action: PayloadAction<boolean>) => {
            state.isOfficial = action.payload
        },
        setBackgroundColor: (state, action: PayloadAction<string>) => {
            state.backgroundColor = action.payload
        },
        addVisual: (state, action: PayloadAction<DashboardVisualItem>) => {
            if (!state.visuals.some((v) => v.i === action.payload.i))
                state.visuals.push(action.payload)
        },
        addMap: (state, action: PayloadAction<DashboardMapItem>) => {
            if (!state.maps.some((m) => m.i === action.payload.i)) state.maps.push(action.payload)
        },
        addDhis2Item: (state, action: PayloadAction<DashboardDhis2Item>) => {
            if (!state.dhis2Items.some((item) => item.i === action.payload.i))
                state.dhis2Items.push(action.payload)
        },
        removeItem: (state, action: PayloadAction<string>) => {
            state.visuals = state.visuals.filter((v) => v.i !== action.payload)
            state.maps = state.maps.filter((m) => m.i !== action.payload)
            state.dhis2Items = state.dhis2Items.filter((item) => item.i !== action.payload)
        },
        applyGridLayout: (state, action: PayloadAction<GridPosition[]>) => {
            state.visuals = withGridLayout(state.visuals, action.payload)
            state.maps = withGridLayout(state.maps, action.payload)
            state.dhis2Items = withGridLayout(state.dhis2Items, action.payload)
        },
        resetDashboardEditor: () => initialDashboardEditor,
    },
})

export const dashboardEditorActions = dashboardEditorSlice.actions
export const dashboardEditorReducer = dashboardEditorSlice.reducer
