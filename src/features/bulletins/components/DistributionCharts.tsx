import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, Treemap } from 'recharts'
import { DEFAULT_COLOR_PALETTE } from '@/features/charts'
import type { NameValue } from '../utils/summaries'

const PIE_COLORS = ['#3b82f6', '#ef4444', '#9ca3af']
const colorAt = (index: number) =>
    DEFAULT_COLOR_PALETTE.itemsBackgroundColors[
        index % DEFAULT_COLOR_PALETTE.itemsBackgroundColors.length
    ] ?? '#3b82f6'

interface TreemapCellProps {
    x?: number
    y?: number
    width?: number
    height?: number
    index?: number
    name?: string
    value?: number
}

const TreemapCell = ({
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    index = 0,
    name,
    value,
}: TreemapCellProps) => (
    <g>
        <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={colorAt(index)}
            stroke="#fff"
            strokeWidth={2}
        />
        {width > 60 && height > 30 && (
            <>
                <text
                    x={x + width / 2}
                    y={y + height / 2 - 7}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={14}
                >
                    {value}
                </text>
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 9}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                >
                    {name}
                </text>
            </>
        )}
    </g>
)

export const DistributionPie = ({ data }: { data: NameValue[] }) => (
    <ResponsiveContainer width="100%" height={300}>
        <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} label>
                {data.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" layout="horizontal" />
        </PieChart>
    </ResponsiveContainer>
)

export const DistributionTreemap = ({ data }: { data: NameValue[] }) => (
    <ResponsiveContainer width="100%" height={400}>
        <Treemap
            data={data}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="#fff"
            content={<TreemapCell />}
        />
    </ResponsiveContainer>
)
