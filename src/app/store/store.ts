import { configureStore } from '@reduxjs/toolkit'
// Slices are imported directly, not through the feature barrels: a barrel also re-exports
// the feature's components, which would pull recharts, leaflet… into the main bundle.
import { selectionReducer } from '@/features/analytics/store/selectionSlice'
import { dashboardEditorReducer } from '@/features/dashboards/store/dashboardEditorSlice'
import { mapBuilderReducer } from '@/features/maps/store/mapBuilderSlice'
import { orgUnitSelectionReducer } from '@/features/org-units/store/orgUnitSelectionSlice'
import { visualizerReducer } from '@/features/visualizers/store/visualizerSlice'

/** Client (UI) state only. Server data lives in TanStack Query, never here. */
export const makeStore = () =>
    configureStore({
        reducer: {
            dashboardEditor: dashboardEditorReducer,
            mapBuilder: mapBuilderReducer,
            orgUnitSelection: orgUnitSelectionReducer,
            selection: selectionReducer,
            visualizer: visualizerReducer,
        },
    })

/** The app's store (tests create their own with `makeStore`). */
export const store = makeStore()

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = typeof store.dispatch
