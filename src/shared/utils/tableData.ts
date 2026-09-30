export type SortDirection = 'asc' | 'desc' | 'default'

export interface SortState {
    key: string
    direction: SortDirection
}

const isEmpty = (value: unknown) => value === null || value === undefined || value === ''

const compareValues = (a: unknown, b: unknown): number => {
    if (typeof a === 'number' && typeof b === 'number') return a - b
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * Stable sort by an accessor; `default` direction keeps the original order.
 * Empty values always go last, whatever the direction.
 */
export const sortRows = <T>(
    rows: readonly T[],
    sort: SortState | null,
    getValue: (row: T, key: string) => unknown
): T[] => {
    if (!sort || sort.direction === 'default') return [...rows]
    const factor = sort.direction === 'asc' ? 1 : -1
    const compareRows = (x: T, y: T): number => {
        const a = getValue(x, sort.key)
        const b = getValue(y, sort.key)
        if (isEmpty(a) || isEmpty(b)) return Number(isEmpty(a)) - Number(isEmpty(b))
        return factor * compareValues(a, b)
    }
    return rows
        .map((row, index) => ({ row, index }))
        .sort((x, y) => compareRows(x.row, y.row) || x.index - y.index)
        .map(({ row }) => row)
}

/** Case-insensitive "contains" search across the given text of each row. */
export const filterRows = <T>(
    rows: readonly T[],
    search: string,
    getSearchText: (row: T) => string
): T[] => {
    const needle = search.trim().toLowerCase()
    if (!needle) return [...rows]
    return rows.filter((row) => getSearchText(row).toLowerCase().includes(needle))
}

export const paginateRows = <T>(rows: readonly T[], page: number, pageSize: number): T[] =>
    rows.slice((page - 1) * pageSize, page * pageSize)

export const pageCountOf = (total: number, pageSize: number): number =>
    Math.max(1, Math.ceil(total / pageSize))
