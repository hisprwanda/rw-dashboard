import type { AnalyticsResponse } from '@/shared/types/dhis2.types'

export interface SeriesPoint {
    period: string
    value: number
}

/** Values of one data item over the periods of an analytics response, in period order. */
export const diseaseSeries = (
    response: AnalyticsResponse | undefined,
    dataItemId: string
): SeriesPoint[] => {
    if (!response?.rows?.length) return []
    const column = (name: string) => response.headers.findIndex((h) => h.name === name)
    const [dx, pe, value] = [column('dx'), column('pe'), column('value')]
    if (dx < 0 || pe < 0 || value < 0) return []
    return response.rows
        .filter((row) => row[dx] === dataItemId)
        .map((row) => ({ id: row[pe] ?? '', value: Number(row[value]) }))
        .filter((point) => Number.isFinite(point.value))
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(({ id, value: v }) => ({
            period: response.metaData?.items?.[id]?.name ?? id,
            value: v,
        }))
}
