import type { AnalyticsResponse } from '@/shared/types/dhis2.types'

/** One header cell of a pivot table axis. */
export interface PivotHeaderCell {
    id: string
    name: string
    /** How many leaf columns (or rows) the cell covers. */
    span: number
}

export interface Pivot {
    /** Column header rows, outermost dimension first. */
    columnHeaders: PivotHeaderCell[][]
    /** Number of row dimensions (width of the row header block). */
    rowDimensionCount: number
    rows: Array<{
        /** One name per row dimension; `null` where an outer cell spans this row. */
        headers: Array<PivotHeaderCell | null>
        values: Array<number | null>
        total: number | null
    }>
    columnTotals: Array<number | null>
    grandTotal: number | null
}

type Combination = string[]

const combinations = (lists: readonly string[][]): Combination[] =>
    lists.reduce<Combination[]>(
        (result, items) => result.flatMap((prefix) => items.map((item) => [...prefix, item])),
        [[]]
    )

const sum = (values: ReadonlyArray<number | null>): number | null =>
    values.some((value) => value !== null)
        ? values.reduce<number>((total, value) => total + (value ?? 0), 0)
        : null

/**
 * Arranges an analytics response as a pivot table: the `columns` dimensions across, the
 * `rows` dimensions down, in the order of the response metadata. Dimensions missing from
 * the response (e.g. on the filter) are ignored.
 */
export const buildPivot = (
    data: AnalyticsResponse,
    columns: readonly string[],
    rows: readonly string[],
    { hideEmptyRows = false }: { hideEmptyRows?: boolean } = {}
): Pivot => {
    const { headers, metaData } = data
    const indexOf = (name: string) => headers.findIndex((header) => header.name === name)
    const nameOf = (id: string) => metaData.items[id]?.name ?? id
    const present = (dimension: string) => indexOf(dimension) >= 0
    const columnDims = columns.filter(present)
    const rowDims = rows.filter(present)
    const itemsOf = (dimension: string) =>
        metaData.dimensions[dimension] ?? [
            ...new Set(data.rows.map((row) => row[indexOf(dimension)] ?? '')),
        ]

    const valueIndex = indexOf('value')
    const keyOf = (ids: readonly string[]) => ids.join('\u0001')
    const values = new Map<string, number>()
    for (const row of data.rows) {
        const raw = row[valueIndex]
        if (raw === undefined || raw === '') continue
        const key = keyOf([...columnDims, ...rowDims].map((dim) => row[indexOf(dim)] ?? ''))
        values.set(key, Number(raw))
    }

    const columnLists = columnDims.map(itemsOf)
    const rowLists = rowDims.map(itemsOf)
    const columnCombos = combinations(columnLists)
    const rowCombos = combinations(rowLists)

    // Column header cell of level `level`: repeated for each item of the outer levels,
    // spanning the product of the inner levels' sizes.
    const product = (lists: readonly string[][]) =>
        lists.reduce((total, list) => total * list.length, 1)
    const columnHeaders = columnLists.map((items, level) => {
        const span = product(columnLists.slice(level + 1))
        const repeat = product(columnLists.slice(0, level))
        return Array.from({ length: repeat }, () =>
            items.map((id) => ({ id, name: nameOf(id), span }))
        ).flat()
    })

    const kept = rowCombos
        .map((rowIds) => {
            const cells = columnCombos.map(
                (columnIds) => values.get(keyOf([...columnIds, ...rowIds])) ?? null
            )
            return { rowIds, values: cells, total: sum(cells) }
        })
        .filter((row) => !hideEmptyRows || row.values.some((value) => value !== null))

    // A row header cell starts where its prefix (itself and the outer levels) changes and
    // spans the following rows sharing that prefix (computed after hiding empty rows).
    const prefixKey = (ids: readonly string[], level: number) => keyOf(ids.slice(0, level + 1))
    const bodyRows = kept.map((row, index) => ({
        values: row.values,
        total: row.total,
        headers: row.rowIds.map((id, level) => {
            const key = prefixKey(row.rowIds, level)
            const previous = kept[index - 1]
            if (previous && prefixKey(previous.rowIds, level) === key) return null
            let span = 1
            while (kept[index + span] && prefixKey(kept[index + span]?.rowIds ?? [], level) === key)
                span += 1
            return { id, name: nameOf(id), span }
        }),
    }))

    const columnTotals = columnCombos.map((_, column) =>
        sum(bodyRows.map((row) => row.values[column] ?? null))
    )
    return {
        columnHeaders,
        rowDimensionCount: rowDims.length,
        rows: bodyRows,
        columnTotals,
        grandTotal: sum(columnTotals),
    }
}
