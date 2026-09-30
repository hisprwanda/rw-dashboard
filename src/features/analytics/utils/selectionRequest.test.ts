import { initialOrgUnitSelection } from '@/features/org-units'
import { initialSelection } from '../store/selectionSlice'
import { buildSelectionRequest } from './selectionRequest'

describe('buildSelectionRequest', () => {
    it('is null until data items are picked', () => {
        expect(buildSelectionRequest(initialSelection, initialOrgUnitSelection)).toBeNull()
    })

    it('builds the request from the selection and the org units', () => {
        const request = buildSelectionRequest(
            { ...initialSelection, dimensions: { dx: ['abc'], pe: ['LAST_12_MONTHS'] } },
            {
                ...initialOrgUnitSelection,
                useCurrentUserOrgUnits: false,
                selectedOrgUnitIds: ['ou1'],
                selectedLevelIds: ['lvl'],
            }
        )
        expect(request?.storedQuery.myData.params).toMatchObject({
            dimension: ['dx:abc', 'pe:LAST_12_MONTHS'],
            filter: 'ou:ou1;LEVEL-lvl',
        })
    })
})
