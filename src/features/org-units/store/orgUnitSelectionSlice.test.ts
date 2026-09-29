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

    it('toggles a tree unit by id and path', () => {
        const unit = { id: 'a', path: '/root/a' }
        let state = reducer(undefined, actions.toggleOrgUnit(unit))
        expect(state.selectedOrgUnitIds).toEqual(['a'])
        expect(state.selectedTreePaths).toEqual(['/root/a'])
        state = reducer(state, actions.toggleOrgUnit(unit))
        expect(state.selectedOrgUnitIds).toEqual([])
        expect(state.selectedTreePaths).toEqual([])
    })

    it('switches between user org units and an explicit selection', () => {
        let state = reducer(undefined, actions.toggleOrgUnit({ id: 'a' }))
        state = reducer(
            state,
            actions.toggleUserOrgUnitScope({ key: 'is_USER_ORGUNIT', checked: false })
        )
        expect(state.useCurrentUserOrgUnits).toBe(false)
        expect(state.selectedOrgUnitIds).toEqual([])
        state = reducer(
            state,
            actions.toggleUserOrgUnitScope({ key: 'is_USER_ORGUNIT_CHILDREN', checked: true })
        )
        expect(state.useCurrentUserOrgUnits).toBe(true)
        expect(state.userOrgUnitScope.is_USER_ORGUNIT_CHILDREN).toBe(true)
    })

    it('stores levels for the UI and for analytics together', () => {
        const state = reducer(undefined, actions.setLevels({ levels: [2], levelIds: ['lvl2'] }))
        expect(state.selectedLevels).toEqual([2])
        expect(state.selectedLevelIds).toEqual(['lvl2'])
    })
})
