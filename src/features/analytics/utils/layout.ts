import type {
    AnalyticsLayout,
    AnalyticsParams,
    LayoutDimensionName,
} from '../types/analytics.types'

const PREFIX_BY_NAME: Record<string, string> = {
    Data: 'dx',
    Period: 'pe',
    'Organisation unit': 'ou',
}

const prefixOf = (name: LayoutDimensionName) => PREFIX_BY_NAME[name] ?? name.toLowerCase()

const byPrefix = (items: readonly string[]) =>
    Object.fromEntries(items.filter(Boolean).map((item) => [item.split(':')[0], item]))

/**
 * Re-arranges `dimension`/`filter` according to the layout: dimensions on Columns and
 * Rows become `dimension`, those on Filter become `filter`. Without a layout the params
 * are returned unchanged. Never mutates its input.
 */
export const applyLayout = (
    params: AnalyticsParams | undefined,
    layout: AnalyticsLayout | undefined
): AnalyticsParams => {
    // Params are plain JSON, so a JSON round-trip is a safe deep copy.
    const result: AnalyticsParams = JSON.parse(JSON.stringify(params ?? {}))
    if (!layout?.Filter) return result

    const filters = result.filter === undefined ? [] : [result.filter].flat()
    const available: Record<string, string> = {
        ...byPrefix(result.dimension ?? []),
        ...byPrefix(filters),
    }
    const pick = (names: readonly LayoutDimensionName[]) =>
        names.map((name) => available[prefixOf(name)]).filter((v): v is string => !!v)

    const dimension = pick([...(layout.Columns ?? []), ...(layout.Rows ?? [])])
    const filter = pick(layout.Filter)

    if (dimension.length > 0) result.dimension = dimension
    if (filter.length === 1) result.filter = filter[0]
    else if (filter.length > 1) result.filter = filter
    else delete result.filter
    return result
}

export type LayoutArea = keyof AnalyticsLayout

/** Moves a dimension from one layout area to another (appended at the end). */
export const moveDimension = (
    layout: AnalyticsLayout,
    item: LayoutDimensionName,
    from: LayoutArea,
    to: LayoutArea
): AnalyticsLayout => {
    if (from === to || !layout[from].includes(item)) return layout
    return {
        ...layout,
        [from]: layout[from].filter((name) => name !== item),
        [to]: [...layout[to], item],
    }
}
