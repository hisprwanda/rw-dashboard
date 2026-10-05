import type { AnalyticsResponse } from '@/shared/types/dhis2.types'

const escapeCell = (value: string) =>
    /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

/**
 * The analytics response as CSV: one column per visible header, and the names of data
 * items, periods and org units instead of their ids (as the official app's download).
 */
export const analyticsToCsv = (response: AnalyticsResponse): string => {
    const columns = response.headers.flatMap((header, index) =>
        header.hidden ? [] : [{ header, index }]
    )
    const names = response.metaData?.items ?? {}
    const lines = [
        columns.map(({ header }) => header.column),
        ...response.rows.map((row) =>
            columns.map(({ header, index }) => {
                const cell = row[index] ?? ''
                return header.meta ? (names[cell]?.name ?? cell) : cell
            })
        ),
    ]
    return lines.map((cells) => cells.map(escapeCell).join(',')).join('\r\n')
}
