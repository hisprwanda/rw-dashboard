import { useMemo } from 'react'
import {
    Cell,
    Legend,
    Pie,
    PieChart as RePieChart,
    Tooltip,
    type PieLabelRenderProps,
} from 'recharts'
import { ChartTooltipContent } from '@/components/ui/chart'
import type { ChartProps } from '../types/chart.types'
import { toSlices } from '../utils/chartData'
import { ChartFrame } from './ChartFrame'
import { useChartData } from '../hooks/useChartData'

const RADIAN = Math.PI / 180
const LINE_HEIGHT = 20

export const PieChart = (props: ChartProps) => {
    const { visualSettings } = props
    const { rows, config, error } = useChartData(props)
    const slices = useMemo(
        () => toSlices(rows, visualSettings.visualColorPalette),
        [rows, visualSettings.visualColorPalette]
    )
    const total = slices.reduce((sum, slice) => sum + slice.total, 0)
    const textStyle = { fontSize: visualSettings.XAxisSettings.fontSize, fontWeight: 'bold' }

    /** Two-line outside label: name, then "value (percent%)". */
    const renderLabel = ({ cx, cy, midAngle, outerRadius, value, name }: PieLabelRenderProps) => {
        const radius = Number(outerRadius) * 1.1
        const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN)
        const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN)
        const anchor = x > Number(cx) ? 'start' : 'end'
        const percentage = total ? ((Number(value) / total) * 100).toFixed(1) : '0'
        return (
            <g>
                <text x={x} y={y - LINE_HEIGHT / 2} textAnchor={anchor} style={textStyle}>
                    {name}
                </text>
                <text x={x} y={y + LINE_HEIGHT / 2} textAnchor={anchor} style={textStyle}>
                    {`${value} (${percentage}%)`}
                </text>
            </g>
        )
    }

    return (
        <ChartFrame {...props} config={config} error={error} isEmpty={slices.length === 0}>
            <RePieChart width={400} height={400}>
                <Tooltip content={<ChartTooltipContent className="bg-white" />} />
                <Legend />
                <Pie
                    data={slices}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    label={renderLabel}
                    labelLine
                    fill={visualSettings.fillColor}
                    style={textStyle}
                >
                    {slices.map((slice) => (
                        <Cell key={slice.name} fill={config[slice.name]?.color ?? slice.fill} />
                    ))}
                </Pie>
            </RePieChart>
        </ChartFrame>
    )
}
