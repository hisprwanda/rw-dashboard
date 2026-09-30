import type { AnalyticsDimensions } from '../types/analytics.types'

/**
 * `{ dx: ['a', 'b'], pe: ['2024'] }` -> `['dx:a;b', 'pe:2024']`.
 * Maps put periods in the filter, so `pe` is left out for them.
 */
export const formatAnalyticsDimensions = (
    dimensions: AnalyticsDimensions,
    isMap = false
): string[] => {
    const result: string[] = []
    if (dimensions.dx?.length) result.push(`dx:${dimensions.dx.join(';')}`)
    if (!isMap && dimensions.pe?.length) result.push(`pe:${dimensions.pe.join(';')}`)
    return result
}

/**
 * The reverse of `formatAnalyticsDimensions`: `['dx:a;b']` -> `{ dx: ['a', 'b'] }`.
 * Any malformed entry makes the whole input invalid (`{}`), as saved queries are all-or-nothing.
 */
export const parseAnalyticsDimensions = (input: unknown): AnalyticsDimensions => {
    if (!Array.isArray(input)) return {}
    const result: AnalyticsDimensions = {}
    for (const item of input) {
        if (typeof item !== 'string') return {}
        const parts = item.split(':')
        if (parts.length !== 2 || !parts[0] || !parts[1]) return {}
        result[parts[0]] = parts[1].split(';')
    }
    return result
}
