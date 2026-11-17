import i18n from '@dhis2/d2-i18n'
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableRow,
    NoticeBox,
} from '@dhis2/ui'
import { ErrorState } from '@/shared/components'
import { ApiError, isNotFound } from '@/shared/api'
import type { OutlierResponse } from '../hooks/useOutlierRun'

/** Raw ids: the table shows the names instead. */
const ID_COLUMNS = ['dx', 'pe', 'ou', 'coc', 'aoc']

const NUMBER = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })

const formatCell = (value: string, numeric: boolean) => {
    if (!numeric || value === '') return value
    const number = Number(value)
    return Number.isFinite(number) ? NUMBER.format(number) : value
}

/** The outliers found by the analytics outlier detection, as a table. */
export const OutlierTable = ({ data }: { data: OutlierResponse }) => {
    const columns = data.headers
        .map((header, index) => ({ header, index }))
        .filter(({ header }) => !header.hidden && !ID_COLUMNS.includes(header.name))

    if (data.rows.length === 0) {
        return (
            <NoticeBox title={i18n.t('No outliers found')}>
                {i18n.t('No value is an outlier with the current method and threshold.')}
            </NoticeBox>
        )
    }
    return (
        <div className="max-h-[480px] overflow-auto">
            <DataTable>
                <DataTableHead>
                    <DataTableRow>
                        {columns.map(({ header }) => (
                            <DataTableColumnHeader key={header.name}>
                                {header.column}
                            </DataTableColumnHeader>
                        ))}
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                    {data.rows.map((row, rowIndex) => (
                        <DataTableRow key={rowIndex}>
                            {columns.map(({ header, index }) => {
                                const numeric = header.valueType === 'NUMBER'
                                return (
                                    <DataTableCell
                                        key={header.name}
                                        align={numeric ? 'right' : 'left'}
                                    >
                                        {formatCell(row[index] ?? '', numeric)}
                                    </DataTableCell>
                                )
                            })}
                        </DataTableRow>
                    ))}
                </DataTableBody>
            </DataTable>
        </div>
    )
}

/** Outlier detection errors; an older server has no outlier endpoint. */
export const OutlierError = ({ error }: { error: Error }) =>
    isNotFound(error) || (error instanceof ApiError && error.status === 404) ? (
        <NoticeBox warning title={i18n.t('Outlier table not available')}>
            {i18n.t('The outlier table needs DHIS2 2.41 or newer.')}
        </NoticeBox>
    ) : (
        <ErrorState error={error} />
    )
