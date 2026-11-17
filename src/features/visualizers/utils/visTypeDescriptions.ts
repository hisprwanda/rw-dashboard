import i18n from '@dhis2/d2-i18n'
import type { ChartType } from '@/features/charts'

/** The chart types in the order of the official Data Visualizer's type picker. */
export const OFFICIAL_CHART_ORDER: readonly ChartType[] = [
    'Table',
    'Column',
    'Stacked Col',
    'Bar',
    'Stacked Bar',
    'Line',
    'Area',
    'Stacked Area',
    'Pie',
    'Radar',
    'Gauge',
    'Year Over Year Line',
    'Year Over Year Column',
    'Single Value',
    'Scatter',
    'Outlier Table',
]

/** What each chart type is for, as described in the official Data Visualizer. */
export const chartTypeDescription = (type: ChartType): string => {
    const yearOverYear = i18n.t('Compare changes over time between multiple time periods.')
    const descriptions: Record<ChartType, string> = {
        Table: i18n.t('View data and indicators in a manipulatable table.'),
        Column: i18n.t('Compare sizes of related elements vertically. Recommend period as filter.'),
        'Stacked Col': i18n.t(
            'Compare parts of a whole against related elements vertically. Recommend data or organisation unit as series.'
        ),
        Bar: i18n.t('Same as column chart, only with horizontal bars.'),
        'Stacked Bar': i18n.t('Same as stacked column chart, only with horizontal bars.'),
        Line: i18n.t('Track or compare changes over time. Recommend period as category.'),
        Area: i18n.t('Track or compare changes over time. Recommend period as category.'),
        'Stacked Area': i18n.t(
            'Track or compare changes over time of parts of a whole. Recommend period as category.'
        ),
        Pie: i18n.t(
            'Compare parts of a whole at a single point in time. Recommend period as filter.'
        ),
        Radar: i18n.t('Compare several items against multiple variables.'),
        Gauge: i18n.t(
            'Compare a percentage indicator against a 100% scale. Recommend period as filter.'
        ),
        'Year Over Year Line': yearOverYear,
        'Year Over Year Column': yearOverYear,
        'Single Value': i18n.t(
            'Display a single value. Recommend relative period to show latest data.'
        ),
        Scatter: i18n.t(
            'View the relationship between two data items at a place or time. Recommend organisation unit as point.'
        ),
        'Outlier Table': i18n.t('View outlier values of data elements in a table.'),
        Radial: i18n.t('Compare values as bars around a circle.'),
        'Tree Map': i18n.t('Show parts of a whole as nested rectangles.'),
    }
    return descriptions[type]
}
