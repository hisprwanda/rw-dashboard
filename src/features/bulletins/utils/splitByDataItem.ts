import type { AnalyticsResponse } from '@/shared/types/dhis2.types'

/** One response per data item (same headers and metadata, only that item's rows). */
export const splitByDataItem = (
    response: AnalyticsResponse | undefined,
    dataItemIds: readonly string[]
): Array<{ id: string; response: AnalyticsResponse }> => {
    if (!response) return []
    const dx = response.headers.findIndex((h) => h.name === 'dx')
    if (dx < 0) return []
    return dataItemIds.map((id) => ({
        id,
        response: {
            ...response,
            rows: response.rows.filter((row) => row[dx] === id),
            metaData: {
                ...response.metaData,
                dimensions: { ...response.metaData?.dimensions, dx: [id] },
            },
        },
    }))
}
