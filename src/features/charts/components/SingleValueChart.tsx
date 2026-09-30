import { useMemo } from 'react'
import type { ChartProps } from '../types/chart.types'
import { toSlices } from '../utils/chartData'
import { ChartFrame } from './ChartFrame'
import { useChartData } from '../hooks/useChartData'
import { formatNumber } from '@/shared/utils/format'

/** The total of the first series as one big number. */
export const SingleValueChart = (props: ChartProps) => {
    const { visualSettings } = props
    const { rows, error } = useChartData(props)
    const first = useMemo(() => toSlices(rows)[0], [rows])
    return (
        <ChartFrame {...props} error={error} isEmpty={!first} hideHeading>
            <div className="flex h-full w-full items-center justify-center">
                <article
                    style={{ backgroundColor: visualSettings.backgroundColor }}
                    className="flex h-full w-full flex-col items-center justify-center rounded-lg p-6 shadow-md"
                >
                    <p
                        style={{
                            color: visualSettings.fillColor,
                            fontSize: visualSettings.XAxisSettings.fontSize,
                            fontWeight: 'bold',
                        }}
                    >
                        {first ? formatNumber(first.total) : null}
                    </p>
                </article>
            </div>
        </ChartFrame>
    )
}
