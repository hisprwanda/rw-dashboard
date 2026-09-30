import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { formatNumber } from '@/shared/utils/format'
import { buildPivot } from '../utils/pivotTable'

interface PivotTableProps {
    data: AnalyticsResponse
    /** Dimension ids across (`['dx', 'pe']`) and down (`['ou']`). */
    columns: readonly string[]
    rows: readonly string[]
    rowTotals?: boolean
    colTotals?: boolean
    hideEmptyRows?: boolean
}

const cell = 'border border-solid border-gray-300 px-2 py-1'
const headerCell = `${cell} bg-gray-100 font-semibold`
const format = (value: number | null) => (value === null ? '' : formatNumber(value))

/** An analytics response as a pivot table with merged headers and optional totals. */
export const PivotTable = ({
    data,
    columns,
    rows,
    rowTotals = false,
    colTotals = false,
    hideEmptyRows = false,
}: PivotTableProps) => {
    const pivot = useMemo(
        () => buildPivot(data, columns, rows, { hideEmptyRows }),
        [data, columns, rows, hideEmptyRows]
    )
    const headerDepth = Math.max(pivot.columnHeaders.length, 1)
    const cornerWidth = Math.max(pivot.rowDimensionCount, 1)

    if (!pivot.rows.length) {
        return <p className="m-0 p-3 text-sm text-gray-600">{i18n.t('No data found')}</p>
    }
    return (
        <div className="h-full w-full overflow-auto">
            <table className="border-collapse text-xs">
                <thead className="sticky top-0">
                    {(pivot.columnHeaders.length ? pivot.columnHeaders : [[]]).map(
                        (level, depth) => (
                            <tr key={depth}>
                                {depth === 0 && (
                                    <th
                                        className={headerCell}
                                        colSpan={cornerWidth}
                                        rowSpan={headerDepth}
                                    />
                                )}
                                {level.map((header, index) => (
                                    <th key={index} className={headerCell} colSpan={header.span}>
                                        {header.name}
                                    </th>
                                ))}
                                {depth === 0 && !pivot.columnHeaders.length && (
                                    <th className={headerCell}>{i18n.t('Value')}</th>
                                )}
                                {depth === 0 && rowTotals && (
                                    <th className={headerCell} rowSpan={headerDepth}>
                                        {i18n.t('Total')}
                                    </th>
                                )}
                            </tr>
                        )
                    )}
                </thead>
                <tbody>
                    {pivot.rows.map((row, index) => (
                        <tr key={index}>
                            {row.headers.map((header, level) =>
                                header ? (
                                    <th
                                        key={level}
                                        className={`${headerCell} text-left`}
                                        rowSpan={header.span}
                                    >
                                        {header.name}
                                    </th>
                                ) : null
                            )}
                            {row.values.map((value, column) => (
                                <td key={column} className={`${cell} text-right tabular-nums`}>
                                    {format(value)}
                                </td>
                            ))}
                            {rowTotals && (
                                <td
                                    className={`${cell} bg-gray-50 text-right font-semibold tabular-nums`}
                                >
                                    {format(row.total)}
                                </td>
                            )}
                        </tr>
                    ))}
                    {colTotals && (
                        <tr>
                            <th className={`${headerCell} text-left`} colSpan={cornerWidth}>
                                {i18n.t('Total')}
                            </th>
                            {pivot.columnTotals.map((value, column) => (
                                <td
                                    key={column}
                                    className={`${cell} bg-gray-50 text-right font-semibold tabular-nums`}
                                >
                                    {format(value)}
                                </td>
                            ))}
                            {rowTotals && (
                                <td
                                    className={`${cell} bg-gray-100 text-right font-semibold tabular-nums`}
                                >
                                    {format(pivot.grandTotal)}
                                </td>
                            )}
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
