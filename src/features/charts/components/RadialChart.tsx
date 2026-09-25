import { useMemo } from 'react'
import { LabelList, Legend, RadialBar, RadialBarChart, Tooltip } from 'recharts'
import { ChartTooltipContent } from '@/components/ui/chart'
import type { ChartProps } from '../types/chart.types'
import { toSlices } from '../utils/chartData'
import { ChartFrame } from './ChartFrame'
import { useChartData } from '../hooks/useChartData'

export const RadialChart = (props: ChartProps) => {
    const { visualSettings } = props
    const { rows, config, error } = useChartData(props)
    const slices = useMemo(
        () => toSlices(rows, visualSettings.visualColorPalette),
        [rows, visualSettings.visualColorPalette]
    )
    return (
        <ChartFrame {...props} config={config} error={error} isEmpty={slices.length === 0}>
            <RadialBarChart
                data={slices}
                startAngle={-130}
                endAngle={380}
                innerRadius={30}
                outerRadius={110}
            >
                <Tooltip
                    content={<ChartTooltipContent hideLabel nameKey="name" className="bg-white" />}
                />
                <Legend />
                <RadialBar dataKey="total" background>
                    <LabelList
                        position="insideStart"
                        dataKey="name"
                        className="capitalize"
                        fontSize={visualSettings.XAxisSettings.fontSize}
                        fill={visualSettings.fillColor}
                    />
                </RadialBar>
            </RadialBarChart>
        </ChartFrame>
    )
}
