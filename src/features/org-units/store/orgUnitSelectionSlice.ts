import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserOrgUnitScope } from '../types/orgUnit.types'

/** The org-unit dimension currently being built (visualizer, map, report). */
export interface OrgUnitSelectionState {
    /** Explicitly picked org-unit ids. */
    selectedOrgUnitIds: string[]
    /** Paths of the nodes checked in the tree (drives the tree UI). */
    selectedTreePaths: string[]
    /** Level ids (or level numbers for maps) used as `LEVEL-x` in analytics. */
    selectedLevelIds: Array<string | number>
    /** Level numbers selected in the levels picker. */
    selectedLevels: number[] | null
    selectedGroupIds: string[]
    /** Use the user's org units (USER_ORGUNIT…) instead of an explicit selection. */
    useCurrentUserOrgUnits: boolean
    userOrgUnitScope: UserOrgUnitScope
}

export const initialOrgUnitSelection: OrgUnitSelectionState = {
    selectedOrgUnitIds: [],
    selectedTreePaths: [],
    selectedLevelIds: [],
    selectedLevels: null,
    selectedGroupIds: [],
    useCurrentUserOrgUnits: true,
    userOrgUnitScope: {
        is_USER_ORGUNIT: true,
        is_USER_ORGUNIT_CHILDREN: false,
        is_USER_ORGUNIT_GRANDCHILDREN: false,
    },
}

const clearExplicit = (state: OrgUnitSelectionState) => {
    state.selectedOrgUnitIds = []
    state.selectedTreePaths = []
    state.selectedLevelIds = []
    state.selectedLevels = null
    state.selectedGroupIds = []
}

const orgUnitSelectionSlice = createSlice({
    name: 'orgUnitSelection',
    initialState: initialOrgUnitSelection,
    reducers: {
        setSelectedOrgUnitIds: (state, action: PayloadAction<string[]>) => {
            state.selectedOrgUnitIds = action.payload
        },
        setSelectedTreePaths: (state, action: PayloadAction<string[]>) => {
            state.selectedTreePaths = action.payload
        },
        setSelectedLevelIds: (state, action: PayloadAction<Array<string | number>>) => {
            state.selectedLevelIds = action.payload
        },
        setSelectedLevels: (state, action: PayloadAction<number[] | null | undefined>) => {
            state.selectedLevels = action.payload ?? null
        },
        setSelectedGroupIds: (state, action: PayloadAction<string[]>) => {
            state.selectedGroupIds = action.payload
        },
        setUseCurrentUserOrgUnits: (state, action: PayloadAction<boolean>) => {
            state.useCurrentUserOrgUnits = action.payload
        },
        setUserOrgUnitScope: (state, action: PayloadAction<UserOrgUnitScope>) => {
            state.userOrgUnitScope = action.payload
        },
        /** Checks or unchecks one unit of the tree (id for analytics, path for the tree UI). */
        toggleOrgUnit: (state, action: PayloadAction<{ id: string; path?: string }>) => {
            const { id, path } = action.payload
            const checked = state.selectedOrgUnitIds.includes(id)
            state.selectedOrgUnitIds = checked
                ? state.selectedOrgUnitIds.filter((selected) => selected !== id)
                : [...state.selectedOrgUnitIds, id]
            if (path) {
                state.selectedTreePaths = checked
                    ? state.selectedTreePaths.filter((selected) => selected !== path)
                    : [...state.selectedTreePaths, path]
            }
        },
        /**
         * Toggles one "user org unit" keyword. The user's units are used as soon as one
         * keyword is on, and switching mode clears the explicit selection.
         */
        toggleUserOrgUnitScope: (
            state,
            action: PayloadAction<{ key: keyof UserOrgUnitScope; checked: boolean }>
        ) => {
            state.userOrgUnitScope[action.payload.key] = action.payload.checked
            state.useCurrentUserOrgUnits = Object.values(state.userOrgUnitScope).some(Boolean)
            clearExplicit(state)
        },
        /** Levels picked in the levels select: numbers for the UI, ids (or numbers) for analytics. */
        setLevels: (
            state,
            action: PayloadAction<{ levels: number[]; levelIds: Array<string | number> }>
        ) => {
            state.selectedLevels = action.payload.levels
            state.selectedLevelIds = action.payload.levelIds
        },
        clearExplicitSelection: (state) => {
            clearExplicit(state)
        },
        /** Replaces the whole selection (e.g. when a saved visual is opened). */
        setOrgUnitSelection: (_state, action: PayloadAction<OrgUnitSelectionState>) =>
            action.payload,
        resetOrgUnitSelection: () => initialOrgUnitSelection,
    },
})

export const orgUnitSelectionActions = orgUnitSelectionSlice.actions
export const orgUnitSelectionReducer = orgUnitSelectionSlice.reducer
