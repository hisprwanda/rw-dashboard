import { configureStore } from '@reduxjs/toolkit'
import { orgUnitSelectionReducer } from '@/features/org-units'

/** Client (UI) state only. Server data lives in TanStack Query, never here. */
export const store = configureStore({
    reducer: {
        orgUnitSelection: orgUnitSelectionReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
