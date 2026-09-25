import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import { DataTable, type DataTableColumn } from '@/shared/components'
import type { ChartProps, SeriesRow } from '../types/chart.types'
import { ChartFrame } from './ChartFrame'
import { useChartData } from '../hooks/useChartData'

/** The chart rows as a searchable, sortable table (one column per series). */
export const TableChart = (props: ChartProps) => {
    const { rows, config, error } = useChartData(props)

    const columns = useMemo<DataTableColumn<SeriesRow>[]>(() => {
        const first = rows[0]
        if (!first) return []
        return Object.keys(first).map((key) => ({
            key,
            header: key === 'period' ? '' : key,
            value: (row) => row[key],
            sortable: true,
        }))
    }, [rows])

    return (
        <ChartFrame {...props} config={config} error={error} isEmpty={rows.length === 0} plain>
            <div className="max-h-[400px] overflow-auto">
                <DataTable
                    columns={columns}
                    rows={rows}
                    getRowKey={(row) => row.period}
                    searchPlaceholder={i18n.t('Search in table...')}
                    initialPageSize={20}
                />
            </div>
        </ChartFrame>
    )
}
