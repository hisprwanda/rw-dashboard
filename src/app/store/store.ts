import { configureStore } from '@reduxjs/toolkit'
import { selectionReducer } from '@/features/analytics'
import { dashboardEditorReducer } from '@/features/dashboards'
import { mapBuilderReducer } from '@/features/maps'
import { orgUnitSelectionReducer } from '@/features/org-units'
import { visualizerReducer } from '@/features/visualizers'

/** Client (UI) state only. Server data lives in TanStack Query, never here. */
export const store = configureStore({
    reducer: {
        dashboardEditor: dashboardEditorReducer,
        mapBuilder: mapBuilderReducer,
        orgUnitSelection: orgUnitSelectionReducer,
        selection: selectionReducer,
        visualizer: visualizerReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
