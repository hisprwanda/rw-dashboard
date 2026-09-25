import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import type { ChartProps, SeriesConfig, SeriesRow } from '../types/chart.types'
import { isAnalyticsResponse, toSeriesConfig, toSeriesRows } from '../utils/chartData'

interface ChartData {
    rows: SeriesRow[]
    config: SeriesConfig
    error: string | null
}

/** Rows + series colors for a chart, or a user-facing error when the data can't be charted. */
export const useChartData = ({
    data,
    visualSettings,
}: Pick<ChartProps, 'data' | 'visualSettings'>): ChartData => {
    const palette = visualSettings.visualColorPalette
    return useMemo(() => {
        if (!isAnalyticsResponse(data)) {
            return { rows: [], config: {}, error: i18n.t('No data found') }
        }
        try {
            return { rows: toSeriesRows(data), config: toSeriesConfig(data, palette), error: null }
        } catch (error) {
            return {
                rows: [],
                config: {},
                error: error instanceof Error ? error.message : String(error),
            }
        }
    }, [data, palette])
}
