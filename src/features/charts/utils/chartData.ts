import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import type { ColorPalette, SeriesConfig, SeriesRow, Slice, TreeNode } from '../types/chart.types'

export const isAnalyticsResponse = (data: unknown): data is AnalyticsResponse =>
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as AnalyticsResponse).headers) &&
    !!(data as AnalyticsResponse).metaData &&
    Array.isArray((data as AnalyticsResponse).rows)

const fallbackColor = (index: number) => `hsl(var(--chart-${index + 1}))`
const paletteColor = (palette: ColorPalette | undefined, index: number) => {
    const colors = palette?.itemsBackgroundColors ?? []
    return colors[index % colors.length] || fallbackColor(index)
}
const toNumber = (raw: string | undefined): number | null =>
    raw === undefined || raw === '' ? null : Number(raw)

/**
 * Pivots an analytics response into chart rows: one row per category (period, org
 * unit…) with one column per series (data item, or org unit when there is no `dx`).
 */
export const toSeriesRows = (data: AnalyticsResponse): SeriesRow[] => {
    const { headers, rows, metaData } = data
    const indexOf = (name: string) => headers.findIndex((h) => h.name === name)
    const nameOf = (id: string) => metaData.items[id]?.name ?? id
    const valueIndex = indexOf('value')
    const dxIndex = indexOf('dx')

    // Series come from `dx`; without it, each org unit is a series and periods are categories.
    const categoryHeader =
        dxIndex >= 0
            ? headers.find((h) => h.meta && h.name !== 'dx')
            : (headers.find((h) => h.name === 'pe') ?? headers.find((h) => h.meta))
    if (!categoryHeader || valueIndex < 0) {
        throw new Error('Required headers (value and a category) are missing')
    }
    const categoryIndex = indexOf(categoryHeader.name)
    const seriesIndex = dxIndex >= 0 ? dxIndex : indexOf('ou')
    const seriesDimension = dxIndex >= 0 ? 'dx' : 'ou'

    const categoryIds = metaData.dimensions[categoryHeader.name] ?? [
        ...new Set(rows.map((row) => row[categoryIndex] ?? '')),
    ]
    const seriesIds =
        metaData.dimensions[seriesDimension] ??
        (seriesIndex >= 0 ? [...new Set(rows.map((row) => row[seriesIndex] ?? ''))] : [])
    const seriesNames = seriesIds.map(nameOf)

    const byCategory = new Map<string, SeriesRow>()
    for (const id of categoryIds) {
        const name = nameOf(id)
        if (byCategory.has(name)) continue // same display name: merge into one row
        const row: SeriesRow = { period: name }
        for (const series of seriesNames) row[series] = null
        byCategory.set(name, row)
    }

    for (const row of rows) {
        const target = byCategory.get(nameOf(row[categoryIndex] ?? ''))
        if (!target) continue
        const seriesId =
            seriesIndex >= 0 ? row[seriesIndex] : seriesIds.length === 1 ? seriesIds[0] : undefined
        if (seriesId === undefined) continue
        target[nameOf(seriesId)] = toNumber(row[valueIndex])
    }
    return [...byCategory.values()]
}

/** Series name -> label + color from the palette (falls back to the theme's chart colors). */
export const toSeriesConfig = (data: AnalyticsResponse, palette?: ColorPalette): SeriesConfig => {
    const { dimensions, items } = data.metaData
    const ids = dimensions.dx?.length ? dimensions.dx : (dimensions.ou ?? [])
    if (ids.length === 0) return { Value: { label: 'Value', color: paletteColor(palette, 0) } }
    return Object.fromEntries(
        ids.map((id, index) => {
            const name = items[id]?.name ?? id
            return [name, { label: name, color: paletteColor(palette, index) }]
        })
    )
}

/** Sums each series over all categories (pie, radial, gauge, single value). */
export const toSlices = (rows: SeriesRow[], palette?: ColorPalette): Slice[] => {
    const totals = new Map<string, number>()
    for (const row of rows) {
        for (const [key, value] of Object.entries(row)) {
            if (key === 'period') continue
            const number = Number(value)
            totals.set(key, (totals.get(key) ?? 0) + (Number.isNaN(number) ? 0 : number))
        }
    }
    return [...totals].map(([name, total], index) => ({
        name,
        total,
        fill: paletteColor(palette, index),
    }))
}

/** One node per series, with its positive values per category as children. */
export const toTreeNodes = (rows: SeriesRow[]): TreeNode[] => {
    const first = rows[0]
    if (!first) return []
    return Object.keys(first)
        .filter((key) => key !== 'period')
        .map((series) => ({
            name: series,
            children: rows
                .map((row) => ({ name: row.period, size: Number(row[series]) || 0 }))
                .filter((child) => child.size > 0),
        }))
        .filter((node) => node.children.length > 0)
}
