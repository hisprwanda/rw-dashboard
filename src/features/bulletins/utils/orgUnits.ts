import { initialOrgUnitSelection, type OrgUnitSelectionState } from '@/features/org-units'
import type { BulletinOrgUnits } from '../types/bulletin.types'

/** A new bulletin reports on the user's org unit. */
export const defaultBulletinOrgUnits = (): BulletinOrgUnits =>
    fromOrgUnitSelection(initialOrgUnitSelection)

/** Picker state -> what a template stores. */
export const fromOrgUnitSelection = (state: OrgUnitSelectionState): BulletinOrgUnits => ({
    useCurrentUserOrgUnits: state.useCurrentUserOrgUnits,
    userOrgUnitScope: { ...state.userOrgUnitScope },
    orgUnitIds: [...state.selectedOrgUnitIds],
    treePaths: [...state.selectedTreePaths],
    levelIds: state.selectedLevelIds.map(String),
    levels: [...(state.selectedLevels ?? [])],
    groupIds: [...state.selectedGroupIds],
})

/** What a template stores -> picker state. */
export const toOrgUnitSelection = (orgUnits: BulletinOrgUnits): OrgUnitSelectionState => ({
    useCurrentUserOrgUnits: orgUnits.useCurrentUserOrgUnits,
    userOrgUnitScope: { ...orgUnits.userOrgUnitScope },
    selectedOrgUnitIds: [...orgUnits.orgUnitIds],
    selectedTreePaths: [...orgUnits.treePaths],
    selectedLevelIds: [...orgUnits.levelIds],
    selectedLevels: orgUnits.levels.length ? [...orgUnits.levels] : null,
    selectedGroupIds: [...orgUnits.groupIds],
})
