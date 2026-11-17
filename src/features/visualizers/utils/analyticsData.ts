import type { AnalyticsResponse } from '@/shared/types/dhis2.types'

/**
 * The response in the form the DHIS2 chart engine reads: it finds the cells of a row by
 * `header.index`, which the raw analytics API does not send (the official app adds it by
 * wrapping the response). Without it every series comes out empty ("No data").
 */
export const withHeaderIndexes = (response: AnalyticsResponse): AnalyticsResponse => ({
    ...response,
    headers: response.headers.map((header, index) => ({ ...header, index })),
})
