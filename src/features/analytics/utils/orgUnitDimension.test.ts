import { buildOrgUnitDimension, parseOrgUnitDimension } from './orgUnitDimension'

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

describe('parseOrgUnitDimension', () => {
    it('round-trips explicit units, levels and groups', () => {
        const input = {
            useCurrentUserOrgUnits: false,
            userOrgUnitScope: noScope,
            orgUnitIds: ['a', 'b'],
            levelIds: ['2'],
            groupIds: ['g'],
        }
        expect(parseOrgUnitDimension(buildOrgUnitDimension(input))).toEqual(input)
    })

    it('restores a level or group that comes first (no leading explicit unit)', () => {
        expect(parseOrgUnitDimension('ou:LEVEL-2;OU_GROUP-g')).toMatchObject({
            orgUnitIds: [],
            levelIds: ['2'],
            groupIds: ['g'],
        })
    })

    it('reads legacy filters with empty parts', () => {
        expect(parseOrgUnitDimension('ou:abc;;').orgUnitIds).toEqual(['abc'])
        expect(parseOrgUnitDimension('ou:;LEVEL-3;').levelIds).toEqual(['3'])
    })

    it('restores the user org unit scope', () => {
        const parsed = parseOrgUnitDimension('ou:USER_ORGUNIT;USER_ORGUNIT_CHILDREN')
        expect(parsed.useCurrentUserOrgUnits).toBe(true)
        expect(parsed.userOrgUnitScope).toEqual({
            ...noScope,
            is_USER_ORGUNIT: true,
            is_USER_ORGUNIT_CHILDREN: true,
        })
        expect(parsed.orgUnitIds).toEqual([])
    })

    it('handles missing input', () => {
        expect(parseOrgUnitDimension(undefined).orgUnitIds).toEqual([])
    })
})
