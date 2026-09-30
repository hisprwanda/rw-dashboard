import { initialOrgUnitSelection } from '@/features/org-units'
import { orgUnitDimension, trackerOrgUnitParams } from './requests'
import { defaultBulletinOrgUnits, fromOrgUnitSelection, toOrgUnitSelection } from './orgUnits'

describe('bulletin org units', () => {
    const picked = fromOrgUnitSelection({
        ...initialOrgUnitSelection,
        useCurrentUserOrgUnits: false,
        userOrgUnitScope: {
            is_USER_ORGUNIT: false,
            is_USER_ORGUNIT_CHILDREN: false,
            is_USER_ORGUNIT_GRANDCHILDREN: false,
        },
        selectedOrgUnitIds: ['root'],
        selectedTreePaths: ['/root'],
        selectedLevelIds: ['lvl2'],
        selectedLevels: [2],
    })

    it('round-trips with the picker state', () => {
        expect(fromOrgUnitSelection(toOrgUnitSelection(picked))).toEqual(picked)
    })

    it('builds the analytics and tracker org-unit parameters', () => {
        expect(orgUnitDimension(picked)).toBe('ou:root;LEVEL-lvl2')
        expect(orgUnitDimension(picked, 3)).toBe('ou:root;LEVEL-3')
        expect(trackerOrgUnitParams(picked)).toEqual({ orgUnit: 'root', ouMode: 'DESCENDANTS' })
        expect(trackerOrgUnitParams(defaultBulletinOrgUnits())).toEqual({ ouMode: 'CAPTURE' })
        expect(orgUnitDimension(defaultBulletinOrgUnits())).toBe('ou:USER_ORGUNIT')
        // Levels also apply under the user's org units (completeness rows).
        expect(orgUnitDimension(defaultBulletinOrgUnits(), 2)).toBe('ou:USER_ORGUNIT;LEVEL-2')
    })
})
