import type {
    ReferenceLine,
    Visualization,
    VisualizationEngineOptions,
    VisualizerOptions,
} from '../types/visualization.types'

export const DEFAULT_VISUALIZER_OPTIONS: VisualizerOptions = {
    colorSet: 'DEFAULT',
    showData: false,
    hideEmptyRowItems: 'NONE',
    hideLegend: false,
    cumulativeValues: false,
    percentStackedValues: false,
    noSpaceBetweenColumns: false,
    regressionType: 'NONE',
    sortOrder: 0,
    baseLine: { enabled: false },
    targetLine: { enabled: false },
}

const toEngineLine = ({ enabled, value, title }: ReferenceLine) => ({
    enabled: enabled && value !== undefined,
    value,
    title: title ? { text: title } : undefined,
})

/** The options in the shape the chart engine reads from a visualization object. */
export const toEngineOptions = (options: VisualizerOptions): VisualizationEngineOptions => ({
    colorSet: options.colorSet,
    showData: options.showData,
    hideEmptyRowItems: options.hideEmptyRowItems,
    seriesKey: { hidden: options.hideLegend },
    cumulativeValues: options.cumulativeValues,
    percentStackedValues: options.percentStackedValues,
    noSpaceBetweenColumns: options.noSpaceBetweenColumns,
    regressionType: options.regressionType,
    sortOrder: options.sortOrder,
    axes: [
        {
            type: 'RANGE',
            index: 0,
            minValue: options.rangeAxisMin,
            maxValue: options.rangeAxisMax,
            steps: options.rangeAxisSteps,
            title: options.rangeAxisTitle
                ? { text: options.rangeAxisTitle, textMode: 'CUSTOM' }
                : undefined,
            baseLine: toEngineLine(options.baseLine),
            targetLine: toEngineLine(options.targetLine),
        },
    ],
})

/** The visualization with the user's options applied. */
export const withOptions = (
    visualization: Visualization,
    options: VisualizerOptions
): Visualization => ({ ...visualization, ...toEngineOptions(options) })
