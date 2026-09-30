import { buildAnalyticsRequest } from './buildAnalyticsRequest'

const orgUnit = {
    useCurrentUserOrgUnits: true,
    userOrgUnitScope: {
        is_USER_ORGUNIT: true,
        is_USER_ORGUNIT_CHILDREN: false,
        is_USER_ORGUNIT_GRANDCHILDREN: false,
    },
    orgUnitIds: [],
    levelIds: [],
    groupIds: [],
}
const layout = { Columns: ['Data'], Rows: ['Period'], Filter: ['Organisation unit'] }

describe('buildAnalyticsRequest (charts)', () => {
    const request = buildAnalyticsRequest({ dimension: ['dx:a', 'pe:2024'], layout, orgUnit })

    it('stores the original query (before layout) with its metadata query', () => {
        expect(request?.storedQuery).toEqual({
            myData: {
                resource: 'analytics',
                params: {
                    dimension: ['dx:a', 'pe:2024'],
                    filter: 'ou:USER_ORGUNIT',
                    displayProperty: 'NAME',
                    includeNumDen: true,
                },
            },
            MetaDataLabels: {
                resource: 'analytics',
                params: {
                    dimension: ['dx:a', 'pe:2024'],
                    filter: 'ou:USER_ORGUNIT',
                    displayProperty: 'NAME',
                    includeNumDen: true,
                    skipMeta: false,
                    skipData: true,
                    includeMetadataDetails: true,
                },
            },
        })
        expect(request?.storedMapQuery).toBeUndefined()
    })

    it('applies the layout to the data params only', () => {
        expect(request?.dataParams.dimension).toEqual(['dx:a', 'pe:2024'])
        expect(request?.dataParams.filter).toBe('ou:USER_ORGUNIT')
        expect(request?.metadataParams.skipData).toBe(true)
    })

    it('rejects incomplete selections', () => {
        expect(buildAnalyticsRequest({ dimension: ['pe:2024'], orgUnit })).toBeNull()
        expect(buildAnalyticsRequest({ dimension: ['dx:a'], orgUnit })).toBeNull()
        expect(
            buildAnalyticsRequest({
                dimension: ['dx:a', 'pe:2024'],
                orgUnit: { ...orgUnit, useCurrentUserOrgUnits: false },
            })
        ).toBeNull()
        expect(buildAnalyticsRequest({ dimension: undefined, orgUnit })).toBeNull()
    })

    it("uses the user's display property (short names) in every query", () => {
        const short = buildAnalyticsRequest({
            dimension: ['dx:a', 'pe:2024'],
            layout,
            orgUnit,
            displayProperty: 'SHORTNAME',
        })
        expect(short?.dataParams.displayProperty).toBe('SHORTNAME')
        expect(short?.metadataParams.displayProperty).toBe('SHORTNAME')
        expect(short?.storedQuery.myData.params.displayProperty).toBe('SHORTNAME')
    })
})

describe('buildAnalyticsRequest (maps)', () => {
    const request = buildAnalyticsRequest({
        dimension: ['dx:a'],
        map: { periodFilter: 'pe:LAST_12_MONTHS', orgUnitDimension: 'ou:LEVEL-2' },
    })

    it('puts periods in the filter and org units in the dimension', () => {
        expect(request?.dataParams).toEqual({
            dimension: ['dx:a', 'ou:LEVEL-2'],
            filter: 'pe:LAST_12_MONTHS',
            displayProperty: 'NAME',
            skipData: false,
            skipMeta: true,
        })
        expect(request?.storedMapQuery?.myData.params.dimension).toEqual(['dx:a', 'ou:LEVEL-2'])
    })

    it('needs a period', () => {
        expect(
            buildAnalyticsRequest({
                dimension: ['dx:a'],
                map: { periodFilter: 'pe:', orgUnitDimension: 'ou:x' },
            })
        ).toBeNull()
    })
})
