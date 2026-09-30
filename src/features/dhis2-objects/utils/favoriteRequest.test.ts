import type { Dhis2Map, Dhis2Visualization } from '../types/dhis2Object.types'
import {
    dhis2ChartType,
    isPivotTable,
    mapToThematic,
    visualizationToRequest,
} from './favoriteRequest'

// Definitions of the play.dhis2.org demo (2.43), trimmed to the fields read here.
const stackedColumn: Dhis2Visualization = {
    id: 'IvXcdp2cFHa',
    name: 'ANC: 1-4 visits by districts this year (stacked)',
    type: 'STACKED_COLUMN',
    columns: [
        {
            dimension: 'dx',
            items: [{ id: 'cYeuwXTCPkU' }, { id: 'Jtf34kNZhzP' }, { id: 'hfdmMSPBgLG' }],
        },
    ],
    rows: [{ dimension: 'ou', items: [{ id: 'USER_ORGUNIT_CHILDREN' }] }],
    filters: [{ dimension: 'pe', items: [{ id: 'THIS_YEAR' }] }],
}

const pivotTable: Dhis2Visualization = {
    id: 'qfMh2IjOxvw',
    name: 'ANC: ANC 1st and 2nd visits at facilities with hierarchy',
    type: 'PIVOT_TABLE',
    rowTotals: true,
    colTotals: true,
    columns: [
        { dimension: 'dx', items: [{ id: 'fbfJHSPpUQD' }, { id: 'cYeuwXTCPkU' }] },
        { dimension: 'pe', items: [{ id: 'THIS_YEAR' }, { id: 'LAST_YEAR' }] },
    ],
    rows: [{ dimension: 'ou', items: [{ id: 'ImspTQPwCqd' }, { id: 'LEVEL-4' }] }],
    filters: [],
}

const thematicMap: Dhis2Map = {
    id: 'zDP78aJU8nX',
    name: 'ANC: 1st visit coverage (%) by district last year',
    mapViews: [
        {
            layer: 'thematic1',
            columns: [{ dimension: 'dx', items: [{ id: 'Uvn6LCg7dVU' }] }],
            rows: [{ dimension: 'ou', items: [{ id: 'ImspTQPwCqd' }, { id: 'LEVEL-2' }] }],
            filters: [{ dimension: 'pe', items: [{ id: 'THIS_YEAR' }] }],
            legendSet: {
                id: 'fqs276KXCXi',
                name: 'ANC Coverage',
                legends: [
                    { name: 'Great', startValue: 90, endValue: 120, color: '#FFFFB2' },
                    { name: 'High Plus', startValue: 80, endValue: 90, color: '#FED976' },
                ],
            },
        },
    ],
}

describe('visualizationToRequest', () => {
    it('sends columns and rows as dimensions and filters as filter', () => {
        expect(visualizationToRequest(stackedColumn)).toEqual({
            params: {
                dimension: ['dx:cYeuwXTCPkU;Jtf34kNZhzP;hfdmMSPBgLG', 'ou:USER_ORGUNIT_CHILDREN'],
                filter: 'pe:THIS_YEAR',
                displayProperty: 'NAME',
            },
            layout: { Columns: ['Data'], Rows: ['Organisation unit'], Filter: ['Period'] },
        })
    })

    it('keeps several column dimensions, drops an empty filter, uses short names', () => {
        const { params, layout } = visualizationToRequest(pivotTable, 'SHORTNAME')
        expect(params).toEqual({
            dimension: [
                'dx:fbfJHSPpUQD;cYeuwXTCPkU',
                'pe:THIS_YEAR;LAST_YEAR',
                'ou:ImspTQPwCqd;LEVEL-4',
            ],
            displayProperty: 'SHORTNAME',
        })
        expect(layout.Columns).toEqual(['Data', 'Period'])
    })

    it('asks for every item of a dimension without items (e.g. a category)', () => {
        const { params } = visualizationToRequest({
            columns: [{ dimension: 'Cow9nZikDgD', items: [] }],
            rows: [],
            filters: [{ dimension: 'pe', items: [{ id: 'LAST_YEAR' }] }, { dimension: 'x' }],
        })
        expect(params.dimension).toEqual(['Cow9nZikDgD'])
        expect(params.filter).toEqual(['pe:LAST_YEAR', 'x'])
    })
})

describe('dhis2ChartType', () => {
    it('maps Data Visualizer types onto this app', () => {
        expect(dhis2ChartType('STACKED_COLUMN')).toBe('Stacked Col')
        expect(dhis2ChartType('STACKED_AREA')).toBe('Area')
        expect(dhis2ChartType('YEAR_OVER_YEAR_LINE')).toBeNull()
        expect(dhis2ChartType('PIVOT_TABLE')).toBeNull()
        expect(isPivotTable('PIVOT_TABLE')).toBe(true)
    })
})

describe('mapToThematic', () => {
    it("builds this app's thematic map with the favorite's legend set", () => {
        const result = mapToThematic(thematicMap)
        expect(result?.analyticsQuery.myData.params).toEqual({
            dimension: ['dx:Uvn6LCg7dVU', 'ou:ImspTQPwCqd;LEVEL-2'],
            filter: 'pe:THIS_YEAR',
            displayProperty: 'NAME',
        })
        expect(result?.geoFeaturesQuery.result.params).toEqual({
            ou: 'ou:ImspTQPwCqd;LEVEL-2',
            displayProperty: 'NAME',
        })
        expect(result?.settings.legendType).toBe('dhis2')
        expect(result?.settings.legend.legends?.map((l) => l.name)).toEqual(['High Plus', 'Great'])
    })

    it('ignores boundary layers and falls back to auto legends', () => {
        const [view] = thematicMap.mapViews
        if (!view) throw new Error('fixture')
        const result = mapToThematic({
            mapViews: [{ layer: 'boundary' }, { ...view, legendSet: undefined }],
        })
        expect(result?.settings.legendType).toBe('auto')
    })

    it('refuses what the native map cannot draw', () => {
        expect(mapToThematic({ mapViews: [{ layer: 'event', rows: [] }] })).toBeNull()
        const [view] = thematicMap.mapViews
        if (!view) throw new Error('fixture')
        expect(mapToThematic({ mapViews: [view, { ...view, layer: 'thematic2' }] })).toBeNull()
        expect(mapToThematic({ mapViews: [{ ...view, filters: [] }] })).toBeNull()
    })
})
