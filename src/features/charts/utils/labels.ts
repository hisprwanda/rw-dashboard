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

/** Display name of a built-in color palette (the stored name stays in English). */
export const paletteLabel = (name: string): string => {
    const labels: Record<string, string> = {
        'Nature Essence': i18n.t('Nature Essence'),
        'Tranquil Hues': i18n.t('Tranquil Hues'),
        'Tropical Vibes': i18n.t('Tropical Vibes'),
        'Retro Vibes': i18n.t('Retro Vibes'),
        'Cyberpunk Neon': i18n.t('Cyberpunk Neon'),
        'Berry Bliss': i18n.t('Berry Bliss'),
        'Ocean Breeze': i18n.t('Ocean Breeze'),
        'Sunset Glow': i18n.t('Sunset Glow'),
        'Forest Harmony': i18n.t('Forest Harmony'),
        'Elegant Neutrals': i18n.t('Elegant Neutrals'),
        'Pastel Dreams': i18n.t('Pastel Dreams'),
        'Autumn Serenity': i18n.t('Autumn Serenity'),
        Default: i18n.t('Default'),
    }
    return labels[name] ?? name
}
