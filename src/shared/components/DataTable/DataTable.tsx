import i18n from '@dhis2/d2-i18n'
import {
    DataTable as UiDataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableFoot,
    DataTableHead,
    DataTableRow,
    InputField,
    Pagination,
} from '@dhis2/ui'
import { useMemo, useState, type ReactNode } from 'react'
import {
    filterRows,
    pageCountOf,
    paginateRows,
    sortRows,
    type SortState,
} from '@/shared/utils/tableData'
import { EmptyState } from '../feedback/EmptyState'
import { ErrorState } from '../feedback/ErrorState'
import { LoadingState } from '../feedback/LoadingState'

type CellValue = string | number | boolean | null | undefined

export interface DataTableColumn<T> {
    key: string
    header: string
    /** Plain value used for sorting, searching and default rendering. */
    value: (row: T) => CellValue
    /** Custom cell content (links, buttons…). Defaults to `value`. */
    render?: (row: T) => ReactNode
    sortable?: boolean
    /** Include this column's value in the search box matching (default true). */
    searchable?: boolean
    width?: string
    align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
    columns: DataTableColumn<T>[]
    rows: readonly T[] | undefined
    getRowKey: (row: T) => string
    loading?: boolean
    error?: unknown
    onRetry?: () => void
    emptyMessage?: string
    searchable?: boolean
    searchPlaceholder?: string
    initialPageSize?: number
}

const PAGE_SIZES = ['5', '10', '20', '50', '100']

/**
 * Client-side table with search, sorting and pagination on top of @dhis2/ui.
 * Replaces the legacy mantine-react-table tables.
 */
export const DataTable = <T,>({
    columns,
    rows,
    getRowKey,
    loading = false,
    error,
    onRetry,
    emptyMessage,
    searchable = true,
    searchPlaceholder,
    initialPageSize = 10,
}: DataTableProps<T>) => {
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<SortState | null>(null)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(initialPageSize)

    const visibleRows = useMemo(() => {
        const valueOf = (row: T, key: string) => columns.find((c) => c.key === key)?.value(row)
        const searchText = (row: T) =>
            columns
                .filter((c) => c.searchable !== false)
                .map((c) => String(c.value(row) ?? ''))
                .join(' ')
        return sortRows(filterRows(rows ?? [], search, searchText), sort, valueOf)
    }, [rows, columns, search, sort])

    if (loading) return <LoadingState />
    if (error) return <ErrorState error={error} onRetry={onRetry} />

    const total = visibleRows.length
    const pageCount = pageCountOf(total, pageSize)
    const currentPage = Math.min(page, pageCount)
    const pageRows = paginateRows(visibleRows, currentPage, pageSize)

    return (
        <div className="flex flex-col gap-3">
            {searchable && (
                <div className="max-w-sm">
                    <InputField
                        dense
                        type="search"
                        value={search}
                        placeholder={searchPlaceholder ?? i18n.t('Search')}
                        onChange={({ value }) => {
                            setSearch(value ?? '')
                            setPage(1)
                        }}
                    />
                </div>
            )}

            {total === 0 ? (
                <EmptyState
                    message={
                        search
                            ? i18n.t('No results match "{{search}}"', { search })
                            : (emptyMessage ?? i18n.t('Nothing to show yet'))
                    }
                />
            ) : (
                <UiDataTable>
                    <DataTableHead>
                        <DataTableRow>
                            {columns.map((column) => (
                                <DataTableColumnHeader
                                    key={column.key}
                                    name={column.key}
                                    width={column.width}
                                    align={column.align}
                                    sortDirection={
                                        column.sortable
                                            ? sort?.key === column.key
                                                ? sort.direction
                                                : 'default'
                                            : undefined
                                    }
                                    onSortIconClick={
                                        column.sortable
                                            ? ({ direction }) =>
                                                  setSort({ key: column.key, direction })
                                            : undefined
                                    }
                                >
                                    {column.header}
                                </DataTableColumnHeader>
                            ))}
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {pageRows.map((row) => (
                            <DataTableRow key={getRowKey(row)}>
                                {columns.map((column) => (
                                    <DataTableCell key={column.key} align={column.align}>
                                        {column.render
                                            ? column.render(row)
                                            : String(column.value(row) ?? '')}
                                    </DataTableCell>
                                ))}
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                    <DataTableFoot>
                        <DataTableRow>
                            <DataTableCell colSpan={String(columns.length)}>
                                <Pagination
                                    page={currentPage}
                                    pageSize={pageSize}
                                    pageCount={pageCount}
                                    total={total}
                                    pageSizes={PAGE_SIZES}
                                    onPageChange={setPage}
                                    onPageSizeChange={(size) => {
                                        setPageSize(size)
                                        setPage(1)
                                    }}
                                />
                            </DataTableCell>
                        </DataTableRow>
                    </DataTableFoot>
                </UiDataTable>
            )}
        </div>
    )
}
