import { useMemo } from 'react'
import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { ChartTooltipContent } from './ChartTooltipContent'
import type { ChartProps } from '../types/chart.types'
import { toSlices } from '../utils/chartData'
import { ChartFrame } from './ChartFrame'
import { useChartData } from '../hooks/useChartData'

const EMPTY_COLOR = '#e5e7eb'

/** Half-donut showing the first series' total as a percentage (clamped to 0–100). */
export const GaugeChart = (props: ChartProps) => {
    const { visualSettings } = props
    const { rows, config, error } = useChartData(props)
    const first = useMemo(() => toSlices(rows)[0], [rows])
    const percentage = Math.min(100, Math.max(0, first?.total ?? 0))
    const gauge = [
        { name: 'value', value: percentage },
        { name: 'empty', value: 100 - percentage },
    ]
    const colors = [visualSettings.backgroundColor || '#8bc34a', EMPTY_COLOR]
    const fontSize = Number(visualSettings.XAxisSettings.fontSize) || 16
    const size = Math.max(300, fontSize * 15)

    return (
        <ChartFrame {...props} error={error} isEmpty={!first} hideHeading>
            <div className="flex h-full w-full flex-col items-center justify-center">
                <PieChart width={size} height={size / 1.5}>
                    <Pie
                        data={gauge}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={size * 0.35}
                        outerRadius={size * 0.45}
                        paddingAngle={0}
                        label={false}
                    >
                        {gauge.map((entry, index) => (
                            <Cell key={entry.name} fill={colors[index]} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={<ChartTooltipContent config={config} hideLabel nameKey="name" />}
                    />
                    <text
                        x="50%"
                        y="85%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="font-bold"
                        style={{ fill: visualSettings.fillColor || '#1f2937', fontSize }}
                    >
                        {percentage.toFixed(1)}
                    </text>
                </PieChart>
            </div>
        </ChartFrame>
    )
}
