import { buildOrgUnitDimension } from './orgUnitDimension'

const noScope = {
    is_USER_ORGUNIT: false,
    is_USER_ORGUNIT_CHILDREN: false,
    is_USER_ORGUNIT_GRANDCHILDREN: false,
}

describe('buildOrgUnitDimension', () => {
    it('uses the user org unit keywords', () => {
        expect(
            buildOrgUnitDimension({
                useCurrentUserOrgUnits: true,
                userOrgUnitScope: {
                    ...noScope,
                    is_USER_ORGUNIT: true,
                    is_USER_ORGUNIT_CHILDREN: true,
                },
                orgUnitIds: ['ignored'],
                levelIds: [],
                groupIds: [],
            })
        ).toBe('ou:USER_ORGUNIT;USER_ORGUNIT_CHILDREN')
    })

    it('combines units, levels and groups', () => {
        expect(
            buildOrgUnitDimension({
                useCurrentUserOrgUnits: false,
                userOrgUnitScope: noScope,
                orgUnitIds: ['a', 'b'],
                levelIds: [2, 'lvlId'],
                groupIds: ['g'],
            })
        ).toBe('ou:a;b;LEVEL-2;LEVEL-lvlId;OU_GROUP-g')
    })

    it('drops empty parts (no dangling semicolons)', () => {
        expect(
            buildOrgUnitDimension({
                useCurrentUserOrgUnits: false,
                userOrgUnitScope: noScope,
                orgUnitIds: ['a'],
                levelIds: [],
                groupIds: [],
            })
        ).toBe('ou:a')
    })
})
