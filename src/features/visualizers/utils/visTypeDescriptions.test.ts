import { CHART_TYPES } from '@/features/charts'
import { visTypeFromChartType } from './visualization'
import { chartTypeDescription, OFFICIAL_CHART_ORDER } from './visTypeDescriptions'

describe('chart type descriptions', () => {
    it('describes every chart type', () => {
        for (const type of CHART_TYPES) expect(chartTypeDescription(type)).toBeTruthy()
    })

    it('lists every official type, each mapped to its DHIS2 type', () => {
        expect(OFFICIAL_CHART_ORDER.map(visTypeFromChartType)).toEqual([
            'PIVOT_TABLE',
            'COLUMN',
            'STACKED_COLUMN',
            'BAR',
            'STACKED_BAR',
            'LINE',
            'AREA',
            'STACKED_AREA',
            'PIE',
            'RADAR',
            'GAUGE',
            'YEAR_OVER_YEAR_LINE',
            'YEAR_OVER_YEAR_COLUMN',
            'SINGLE_VALUE',
            'SCATTER',
            'OUTLIER_TABLE',
        ])
    })
})
