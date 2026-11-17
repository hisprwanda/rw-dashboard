import type { SavedVisual } from '../types/visual.types'
import { savedVisualToVisualization, visTypeFromChartType } from './visualization'

const visual = (overrides: Partial<SavedVisual>): SavedVisual =>
    ({
        visualType: 'Column',
        analyticsPayloadDeterminer: {
            Columns: ['Data'],
            Rows: ['Period'],
            Filter: ['Organisation unit'],
        },
        query: {
            myData: {
                resource: 'analytics',
                params: {
                    dimension: ['dx:a;b', 'pe:LAST_12_MONTHS'],
                    filter: 'ou:USER_ORGUNIT;LEVEL-2',
                },
            },
        },
        ...overrides,
    }) as SavedVisual

describe('visTypeFromChartType', () => {
    it('maps shared chart types and drops the ones without a counterpart', () => {
        expect(visTypeFromChartType('Stacked Col')).toBe('STACKED_COLUMN')
        expect(visTypeFromChartType('Table')).toBe('PIVOT_TABLE')
        expect(visTypeFromChartType('Tree Map')).toBeUndefined()
        expect(visTypeFromChartType('Radial')).toBeUndefined()
    })
})

describe('savedVisualToVisualization', () => {
    it('places the stored dimensions and filter on the layout axes', () => {
        expect(savedVisualToVisualization(visual({}))).toEqual({
            type: 'COLUMN',
            columns: [{ dimension: 'dx', items: [{ id: 'a' }, { id: 'b' }] }],
            rows: [{ dimension: 'pe', items: [{ id: 'LAST_12_MONTHS' }] }],
            filters: [{ dimension: 'ou', items: [{ id: 'USER_ORGUNIT' }, { id: 'LEVEL-2' }] }],
        })
    })

    it('follows a rearranged layout, including a dimension moved into the filter', () => {
        const result = savedVisualToVisualization(
            visual({
                analyticsPayloadDeterminer: {
                    Columns: ['Organisation unit'],
                    Rows: ['Data'],
                    Filter: ['Period'],
                },
            })
        )
        expect(result?.columns.map((d) => d.dimension)).toEqual(['ou'])
        expect(result?.rows.map((d) => d.dimension)).toEqual(['dx'])
        expect(result?.filters.map((d) => d.dimension)).toEqual(['pe'])
    })

    it('skips layout dimensions that have no stored items', () => {
        const result = savedVisualToVisualization(
            visual({ query: { myData: { resource: 'analytics', params: {} } } })
        )
        expect(result).toMatchObject({ columns: [], rows: [], filters: [] })
    })

    it('returns undefined for chart types the official app lacks', () => {
        expect(savedVisualToVisualization(visual({ visualType: 'Tree Map' }))).toBeUndefined()
    })
})
