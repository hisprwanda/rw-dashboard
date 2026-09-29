import type { QueryParams } from './dhis2Client'

/**
 * Serialises params exactly like the DHIS2 data engine does, so a query means the
 * same thing on the current and on an external instance: `filter` arrays are
 * repeated (`filter=a&filter=b`), every other array is comma-joined.
 */
export const serializeParams = (params: QueryParams = {}): string =>
    Object.entries(params)
        .flatMap(([key, value]) => {
            if (value === null || value === undefined) return []
            if (key === 'filter' && Array.isArray(value)) {
                return value.map((item): [string, string] => [key, String(item)])
            }
            return [
                [key, Array.isArray(value) ? value.join(',') : String(value)] as [string, string],
            ]
        })
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
