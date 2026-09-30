import type { QueryParams } from './dhis2Client'
import type { InstanceClient } from './instanceClient'

/** Page metadata as returned by the old (`pager`) and new (top-level) DHIS2 APIs. */
interface PagedResponse {
    pager?: { page?: number; pageCount?: number; total?: number }
    page?: number
    pageCount?: number
    total?: number
    [list: string]: unknown
}

interface FetchAllPagesOptions {
    /** Keys that may hold the rows, in order (e.g. `['events', 'instances']`). */
    listKeys: readonly string[]
    pageSize?: number
    /** Safety net against endless loops on a misbehaving server. */
    maxPages?: number
    signal?: AbortSignal
}

const rowsOf = <T>(response: PagedResponse, listKeys: readonly string[]): T[] => {
    for (const key of listKeys) {
        const value = response[key]
        if (Array.isArray(value)) return value as T[]
    }
    return []
}

/**
 * Reads every page of a paged DHIS2 list (tracker, metadata…) on any instance.
 * Stops when the server says there are no more pages, or when a page is not full
 * (tracker 2.41+ only returns a page count when `totalPages=true`).
 */
export const fetchAllPages = async <T>(
    client: InstanceClient,
    resource: string,
    params: QueryParams,
    { listKeys, pageSize = 1000, maxPages = 100, signal }: FetchAllPagesOptions
): Promise<T[]> => {
    const rows: T[] = []
    for (let page = 1; page <= maxPages; page += 1) {
        const response = await client.get<PagedResponse>(
            resource,
            { ...params, page, pageSize, totalPages: true },
            signal
        )
        const pageRows = rowsOf<T>(response, listKeys)
        rows.push(...pageRows)
        const pageCount = response.pager?.pageCount ?? response.pageCount
        const done = pageCount !== undefined ? page >= pageCount : pageRows.length < pageSize
        if (done) break
    }
    return rows
}
