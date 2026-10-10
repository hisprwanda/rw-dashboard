import { createVisualization } from '@dhis2/analytics'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { withHeaderIndexes } from './analyticsData'
import { buildVisualization } from './visualization'
import { yearOverYearExtraOptions, yearOverYearLayout } from './yearOverYear'

const header = (name: string) => ({
    name,
    column: name,
    valueType: name === 'value' ? 'NUMBER' : 'TEXT',
    type: 'java.lang.String',
    hidden: false,
    meta: name !== 'value',
})

const year = (y: number, values: number[]): AnalyticsResponse => {
    const periods = values.map((_, index) => `${y}0${index + 1}`)
    return {
        headers: ['pe', 'value'].map(header),
        rows: periods.map((pe, index) => [pe, String(values[index])]),
        width: 2,
        height: periods.length,
        metaData: {
            items: {
                ...Object.fromEntries(
                    periods.map((pe, index) => [
                        pe,
                        { name: `${['January', 'February'][index]} ${y}` },
                    ])
                ),
                a: { name: 'ANC' },
                ou1: { name: 'Rwanda' },
            },
            dimensions: { pe: periods, dx: ['a'], ou: ['ou1'] },
        },
    }
}

type Chart = { series: Array<{ name: string; options: { data: number[] } }> }

describe('year-over-year chart', () => {
    it('draws one series per year on year-less categories', () => {
        const responses = [year(2026, [5, 6]), year(2025, [3, 4])]
        const visualization = buildVisualization(
            'YEAR_OVER_YEAR_LINE',
            yearOverYearLayout({
                Columns: ['Data'],
                Rows: ['Period'],
                Filter: ['Organisation unit'],
            }),
            { dimension: ['dx:a', 'pe:MONTHS_THIS_YEAR'], filter: 'ou:ou1' }
        )
        const element = document.createElement('div')
        document.body.appendChild(element)
        const { visualization: chart } = createVisualization(
            responses.map(withHeaderIndexes),
            visualization,
            element,
            { dashboard: false, ...yearOverYearExtraOptions(responses, [2026, 2025]) }
        )
        const { series } = chart as unknown as Chart
        expect(series.map(({ name }) => name)).toEqual(['2026', '2025'])
        expect(series.map(({ options }) => options.data)).toEqual([
            [5, 6],
            [3, 4],
        ])
    })
})
