import { createVisualization } from '@dhis2/analytics'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'

const header = (name: string) => ({
    name,
    column: name,
    valueType: name === 'value' ? 'NUMBER' : 'TEXT',
    type: 'java.lang.String',
    hidden: false,
    meta: name !== 'value',
})

// A Data Visualizer favorite as the API returns it (trimmed): drawn without translation.
const favorite = {
    id: 'v1',
    type: 'STACKED_COLUMN',
    colorSet: 'DEFAULT',
    columns: [{ dimension: 'dx', items: [{ id: 'a' }, { id: 'b' }] }],
    rows: [{ dimension: 'ou', items: [{ id: 'k' }, { id: 'n' }] }],
    filters: [{ dimension: 'pe', items: [{ id: 'THIS_YEAR' }] }],
}

const response: AnalyticsResponse = {
    headers: ['dx', 'ou', 'value'].map(header),
    rows: [
        ['a', 'k', '10'],
        ['a', 'n', '20'],
        ['b', 'k', '5'],
        ['b', 'n', '7'],
    ],
    width: 3,
    height: 4,
    metaData: {
        items: {
            a: { name: 'ANC 1' },
            b: { name: 'ANC 4' },
            k: { name: 'Kigali' },
            n: { name: 'Northern' },
            THIS_YEAR: { name: 'This year' },
        },
        dimensions: { dx: ['a', 'b'], ou: ['k', 'n'], pe: ['2026'] },
    },
}

type Chart = { series: Array<{ name: string; options: { data: number[] } }> }

describe('a Data Visualizer favorite drawn by the DHIS2 chart engine', () => {
    it('draws its series from the favorite object as the API returns it', () => {
        const element = document.createElement('div')
        document.body.appendChild(element)
        const { visualization } = createVisualization(
            // The engine finds cells by header index, as the app's DhisChart provides.
            { ...response, headers: response.headers.map((h, index) => ({ ...h, index })) },
            favorite,
            element,
            { dashboard: true }
        )
        const { series } = visualization as unknown as Chart
        expect(series.map(({ name }) => name)).toEqual(['ANC 1', 'ANC 4'])
        expect(series.map(({ options }) => options.data)).toEqual([
            [10, 20],
            [5, 7],
        ])
    })
})
