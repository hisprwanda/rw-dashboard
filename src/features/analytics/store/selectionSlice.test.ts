import { initialSelection, selectionActions, selectionReducer } from './selectionSlice'

describe('setDimensionItems', () => {
    it('stores the items and places a new dimension in the filter', () => {
        const state = selectionReducer(
            initialSelection,
            selectionActions.setDimensionItems({ dimension: 'cat1', items: ['a', 'b'] })
        )
        expect(state.dimensions.cat1).toEqual(['a', 'b'])
        expect(state.layout.Filter).toEqual(['Organisation unit', 'cat1'])
    })

    it('takes the dimension out of the layout when its items are cleared', () => {
        const withItems = selectionReducer(
            initialSelection,
            selectionActions.setDimensionItems({ dimension: 'cat1', items: ['a'] })
        )
        const cleared = selectionReducer(
            withItems,
            selectionActions.setDimensionItems({ dimension: 'cat1', items: [] })
        )
        expect(cleared.layout).toEqual(initialSelection.layout)
    })
})
