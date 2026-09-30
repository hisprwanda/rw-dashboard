import i18n from '@dhis2/d2-i18n'

/** Display name of a chart type (the stored value stays in English). */
export const chartTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        Column: i18n.t('Column'),
        'Stacked Col': i18n.t('Stacked column'),
        Bar: i18n.t('Bar'),
        'Stacked Bar': i18n.t('Stacked bar'),
        Line: i18n.t('Line'),
        Area: i18n.t('Area'),
        Scatter: i18n.t('Scatter'),
        Radar: i18n.t('Radar'),
        Pie: i18n.t('Pie'),
        Radial: i18n.t('Radial'),
        Gauge: i18n.t('Gauge'),
        'Single Value': i18n.t('Single value'),
        'Tree Map': i18n.t('Tree map'),
        Table: i18n.t('Table'),
    }
    return labels[type] ?? type
}
