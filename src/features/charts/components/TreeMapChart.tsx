import { useMemo } from 'react'
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts'
import type { ChartProps } from '../types/chart.types'
import { toTreeNodes } from '../utils/chartData'
import { ChartFrame } from './ChartFrame'
import { useChartData } from '../hooks/useChartData'

interface TreeCellProps {
    x?: number
    y?: number
    width?: number
    height?: number
    index?: number
    depth?: number
    name?: string
    root?: { children?: unknown[] }
    colors: string[]
    fontSize: number
}

/** A rectangle of the tree map: series at depth 1 (colored), categories at depth 2. */
const TreeCell = ({
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    index = 0,
    depth = 0,
    name,
    root,
    colors,
    fontSize,
}: TreeCellProps) => {
    const siblings = root?.children?.length || 1
    const fill = depth < 2 ? colors[Math.floor((index / siblings) * colors.length)] : '#ffffff00'
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fill}
                stroke="#fff"
                strokeWidth={2 / (depth + 1e-10)}
                strokeOpacity={1 / (depth + 1e-10)}
            />
            {depth === 1 && (
                <>
                    <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill="#6c0505"
                        fontSize={12}
                    >
                        {name}
                    </text>
                    <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
                        {index + 1}
                    </text>
                </>
            )}
            {depth === 2 && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize={fontSize}
                >
                    {name}
                </text>
            )}
        </g>
    )
}

interface TreeTooltipProps {
    active?: boolean
    payload?: Array<{ payload?: { name?: string; size?: number; root?: { name?: string } } }>
}

const TreeTooltip = ({ active, payload }: TreeTooltipProps) => {
    const item = payload?.[0]?.payload
    if (!active || !item) return null
    return (
        <div className="rounded-md border border-gray-300 bg-white p-2 shadow-md">
            <p className="font-semibold">{`${item.root?.name || 'Category'} - ${item.name || 'Item'}`}</p>
            <p>{`size: ${item.size || 0}`}</p>
        </div>
    )
}

export const TreeMapChart = (props: ChartProps) => {
    const { visualSettings } = props
    const { rows, config, error } = useChartData(props)
    const nodes = useMemo(() => toTreeNodes(rows), [rows])
    return (
        <ChartFrame {...props} error={error} isEmpty={nodes.length === 0}>
            <ResponsiveContainer width="100%" height={400}>
                <Treemap
                    data={nodes}
                    dataKey="size"
                    stroke={visualSettings.fillColor}
                    content={
                        <TreeCell
                            fontSize={visualSettings.XAxisSettings.fontSize}
                            colors={visualSettings.visualColorPalette.itemsBackgroundColors}
                        />
                    }
                >
                    <Tooltip content={<TreeTooltip />} />
                </Treemap>
            </ResponsiveContainer>
        </ChartFrame>
    )
}
