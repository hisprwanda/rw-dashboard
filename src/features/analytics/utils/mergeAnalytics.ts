import type { AnalyticsMetaData, AnalyticsResponse } from '@/shared/types/dhis2.types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

/** Items of all lists, without duplicates, in the order they first appear. */
const union = (lists: ReadonlyArray<readonly string[] | undefined>) => [
    ...new Set(lists.flatMap((list) => list ?? [])),
]

/**
 * The metadata of several responses as one: items and hierarchies are merged (the first
 * response wins on conflicts), dimension items are combined. `dataOrder` sets the order
 * of the data items (`dx`), which otherwise follow the responses.
 */
export const mergeAnalyticsMetaData = (
    metaData: readonly AnalyticsMetaData[],
    dataOrder?: readonly string[]
): AnalyticsMetaData | undefined => {
    const [first] = metaData
    if (!first || metaData.length === 1) return first

    // Later responses first, so the earlier ones overwrite them.
    const merged: Record<string, unknown> = {}
    for (const entry of [...metaData].reverse()) {
        for (const [key, value] of Object.entries(entry)) {
            const previous = merged[key]
            merged[key] = isRecord(previous) && isRecord(value) ? { ...previous, ...value } : value
        }
    }

    const dimensionIds = union(metaData.map((entry) => Object.keys(entry.dimensions ?? {})))
    const dimensions = Object.fromEntries(
        dimensionIds.map((id) => [id, union(metaData.map((entry) => entry.dimensions?.[id]))])
    )
    if (dataOrder && dimensions.dx) {
        const present = new Set(dimensions.dx)
        dimensions.dx = union([dataOrder.filter((id) => present.has(id)), dimensions.dx])
    }
    return { ...merged, items: { ...(merged.items as AnalyticsMetaData['items']) }, dimensions }
}

/**
 * Several analytics responses (e.g. one per data source) as one response: the rows of
 * each are aligned on the first response's headers (by name) and appended.
 */
export const mergeAnalyticsResponses = (
    responses: readonly AnalyticsResponse[],
    dataOrder?: readonly string[]
): AnalyticsResponse | undefined => {
    const [first] = responses
    if (!first || responses.length === 1) return first

    const headers = first.headers
    const rows = responses.flatMap((response) => {
        const indexOf = new Map(response.headers.map(({ name }, index) => [name, index]))
        return response.rows.map((row) =>
            headers.map(({ name }) => {
                const index = indexOf.get(name)
                return index === undefined ? '' : (row[index] ?? '')
            })
        )
    })
    return {
        ...first,
        headers,
        rows,
        metaData:
            mergeAnalyticsMetaData(
                responses.map(({ metaData }) => metaData),
                dataOrder
            ) ?? first.metaData,
        width: headers.length,
        height: rows.length,
    }
}
