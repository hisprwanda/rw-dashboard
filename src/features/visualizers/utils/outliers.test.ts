import { initialSelection } from '@/features/analytics'
import { initialOrgUnitSelection } from '@/features/org-units'
import {
    buildOutlierParams,
    DEFAULT_OUTLIER_OPTIONS,
    orderByOptions,
    withAlgorithm,
} from './outliers'

const orgUnits = {
    ...initialOrgUnitSelection,
    useCurrentUserOrgUnits: false,
    selectedOrgUnitIds: ['ou1'],
    selectedLevelIds: ['3'],
}

describe('buildOutlierParams', () => {
    it('reads the data elements, periods and org units of the selection', () => {
        expect(
            buildOutlierParams(
                { dimensions: { dx: ['a', 'b'], pe: ['LAST_12_MONTHS'] } },
                orgUnits,
                { ...DEFAULT_OUTLIER_OPTIONS, maxResults: 9000, threshold: 0 }
            )
        ).toEqual({
            dx: 'a;b',
            pe: 'LAST_12_MONTHS',
            ou: 'ou1;LEVEL-3',
            algorithm: 'MODIFIED_Z_SCORE',
            threshold: 3,
            maxResults: 500,
            orderBy: 'absdev',
            sortOrder: 'DESC',
            displayProperty: 'NAME',
        })
    })

    it('is null without data elements', () => {
        expect(buildOutlierParams(initialSelection, orgUnits)).toBeNull()
    })
})

describe('withAlgorithm', () => {
    it('keeps a sort column both methods have and resets the others', () => {
        const zScore = withAlgorithm({ ...DEFAULT_OUTLIER_OPTIONS, orderBy: 'median' }, 'Z_SCORE')
        expect(zScore.orderBy).toBe('absdev')
        expect(
            withAlgorithm({ ...DEFAULT_OUTLIER_OPTIONS, orderBy: 'lowerbound' }, 'Z_SCORE').orderBy
        ).toBe('lowerbound')
        expect(orderByOptions('MODIFIED_Z_SCORE')).toContain('modifiedzscore')
    })
})
