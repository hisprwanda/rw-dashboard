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
        resetOrgUnitSelection: () => initialOrgUnitSelection,
    },
})

export const orgUnitSelectionActions = orgUnitSelectionSlice.actions
export const orgUnitSelectionReducer = orgUnitSelectionSlice.reducer
