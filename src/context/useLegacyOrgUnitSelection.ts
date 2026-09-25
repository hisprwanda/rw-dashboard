import type { SetStateAction } from 'react'
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector, useAppStore, type RootState } from '@/app/store'
import { orgUnitSelectionActions as actions, type UserOrgUnitScope } from '@/features/org-units'

/**
 * TEMPORARY bridge (Phase 3 → 8): exposes the Redux org-unit selection with the old
 * AuthContext names and `useState`-style setters (value or updater function), so the
 * legacy components keep working while they are migrated. Delete with AuthContext.
 */
const useLegacySetter = <T>(
    select: (state: RootState) => T,
    toAction: (value: T) => Parameters<ReturnType<typeof useAppDispatch>>[0]
) => {
    const dispatch = useAppDispatch()
    const store = useAppStore()
    return useCallback(
        (next: SetStateAction<T>) => {
            const value =
                typeof next === 'function'
                    ? (next as (previous: T) => T)(select(store.getState()))
                    : next
            dispatch(toAction(value))
        },
        [dispatch, store, select, toAction]
    )
}

const selectIds = (s: RootState) => s.orgUnitSelection.selectedOrgUnitIds
const selectLevelIds = (s: RootState) => s.orgUnitSelection.selectedLevelIds
const selectGroupIds = (s: RootState) => s.orgUnitSelection.selectedGroupIds
const selectUseUser = (s: RootState) => s.orgUnitSelection.useCurrentUserOrgUnits
const selectScope = (s: RootState) => s.orgUnitSelection.userOrgUnitScope
const selectLevels = (s: RootState) => s.orgUnitSelection.selectedLevels
const selectPaths = (s: RootState) => s.orgUnitSelection.selectedTreePaths

export const useLegacyOrgUnitSelection = () => {
    const selection = useAppSelector((s) => s.orgUnitSelection)

    return {
        selectedOrganizationUnits: selection.selectedOrgUnitIds,
        setSelectedOrganizationUnits: useLegacySetter<string[]>(
            selectIds,
            actions.setSelectedOrgUnitIds
        ),
        selectedOrganizationUnitsLevels: selection.selectedLevelIds,
        setSelectedOrganizationUnitsLevels: useLegacySetter<Array<string | number>>(
            selectLevelIds,
            actions.setSelectedLevelIds
        ),
        selectedOrgUnitGroups: selection.selectedGroupIds,
        setSelectedOrgUnitGroups: useLegacySetter<string[]>(
            selectGroupIds,
            actions.setSelectedGroupIds
        ),
        isUseCurrentUserOrgUnits: selection.useCurrentUserOrgUnits,
        setIsUseCurrentUserOrgUnits: useLegacySetter<boolean>(
            selectUseUser,
            actions.setUseCurrentUserOrgUnits
        ),
        isSetPredifinedUserOrgUnits: selection.userOrgUnitScope,
        setIsSetPredifinedUserOrgUnits: useLegacySetter<UserOrgUnitScope>(
            selectScope,
            actions.setUserOrgUnitScope
        ),
        selectedLevel: selection.selectedLevels,
        setSelectedLevel: useLegacySetter<number[] | null>(selectLevels, actions.setSelectedLevels),
        selectedOrgUnits: selection.selectedTreePaths,
        setSelectedOrgUnits: useLegacySetter<string[]>(selectPaths, actions.setSelectedTreePaths),
    }
}
