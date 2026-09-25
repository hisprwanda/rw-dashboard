import {
    initialOrgUnitSelection,
    orgUnitSelectionActions as actions,
    orgUnitSelectionReducer as reducer,
} from './orgUnitSelectionSlice'

describe('orgUnitSelectionSlice', () => {
    it('starts on the current user org unit', () => {
        const state = reducer(undefined, { type: '@@init' })
        expect(state.useCurrentUserOrgUnits).toBe(true)
        expect(state.userOrgUnitScope.is_USER_ORGUNIT).toBe(true)
    })

    it('stores explicit selections', () => {
        let state = reducer(undefined, actions.setSelectedOrgUnitIds(['a', 'b']))
        state = reducer(state, actions.setSelectedGroupIds(['g']))
        expect(state.selectedOrgUnitIds).toEqual(['a', 'b'])
        expect(state.selectedGroupIds).toEqual(['g'])
    })

    it('normalises a missing saved level to null', () => {
        expect(reducer(undefined, actions.setSelectedLevels(undefined)).selectedLevels).toBeNull()
    })

    it('resets everything', () => {
        const dirty = reducer(undefined, actions.setSelectedOrgUnitIds(['x']))
        expect(reducer(dirty, actions.resetOrgUnitSelection())).toEqual(initialOrgUnitSelection)
    })
})
