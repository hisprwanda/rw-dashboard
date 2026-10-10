import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts'
import { formatNumber } from '@/shared/utils/format'
import type { ChartProps } from '../types/chart.types'
import { colorByEntity, textColorOn } from '../utils/categorical'
import { toTreeNodes } from '../utils/chartData'
import { useChartData } from '../hooks/useChartData'
import { ChartFrame } from './ChartFrame'

/** A category of one series, as a rectangle; the series gives its color. */
interface Leaf {
    name: string
    size: number
    series: string
    color: string
    /** Share of the series and of the whole chart, 0–1. */
    seriesShare: number
    totalShare: number
}

/** Approximate width of a label, to place it only where it fits. */
const textWidth = (text: string, fontSize: number) => text.length * fontSize * 0.56

interface TreeCellProps {
    x?: number
    y?: number
    width?: number
    height?: number
    depth?: number
    name?: string
    size?: number
    color?: string
    background: string
    fontSize: number
}

/**
 * A rectangle of the tree map. Series (depth 1) only frame their categories; categories
 * (depth 2) are filled with the series color, separated by a 2px gap in the background
 * color, and labelled only when the label fits.
 */
const TreeCell = ({
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    depth = 0,
    name = '',
    size = 0,
    color,
    background,
    fontSize,
}: TreeCellProps) => {
    if (depth !== 2 || !color) return null
    const padding = 8
    const value = formatNumber(size)
    const fitsName =
        width - 2 * padding >= textWidth(name, fontSize) && height >= fontSize + 2 * padding
    const fitsValue = fitsName && height >= 2 * fontSize + 2 * padding + 4
    const ink = textColorOn(color)
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={4}
                fill={color}
                stroke={background}
                strokeWidth={2}
            />
            {fitsName && (
                <text x={x + padding} y={y + padding + fontSize} fill={ink} fontSize={fontSize}>
                    {name}
                </text>
            )}
            {fitsValue && (
                <text
                    x={x + padding}
                    y={y + padding + 2 * fontSize + 4}
                    fill={ink}
                    fontSize={fontSize}
                    fontWeight={600}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {value}
                </text>
            )}
        </g>
    )
}

interface TreeTooltipProps {
    active?: boolean
    payload?: Array<{ payload?: Partial<Leaf> }>
    multiSeries: boolean
}

const percent = (share = 0) => formatNumber(share, { style: 'percent', maximumFractionDigits: 1 })

const TreeTooltip = ({ active, payload, multiSeries }: TreeTooltipProps) => {
    const leaf = payload?.[0]?.payload
    if (!active || !leaf?.series) return null
    return (
        <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm shadow-md">
            <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: leaf.color }} />
                <span className="font-semibold text-gray-900">
                    {multiSeries ? `${leaf.series} · ${leaf.name}` : leaf.name}
                </span>
            </div>
            <div className="mt-1 font-semibold tabular-nums text-gray-900">
                {formatNumber(leaf.size ?? 0)}
            </div>
            <div className="text-gray-600">
                {multiSeries
                    ? i18n.t('{{series}} of {{name}}, {{total}} of total', {
                          series: percent(leaf.seriesShare),
                          name: leaf.series,
                          total: percent(leaf.totalShare),
                          interpolation: { escapeValue: false },
                      })
                    : i18n.t('{{total}} of total', { total: percent(leaf.totalShare) })}
            </div>
        </div>
    )
}

/**
 * Parts of a whole as rectangles sized by value: one color per data item, its
 * categories (periods, org units…) inside it.
 */
export const TreeMapChart = (props: ChartProps) => {
    const { visualSettings } = props
    const { rows, error } = useChartData(props)
    const labels = visualSettings.XAxisSettings
    const background = visualSettings.backgroundColor || '#ffffff'

    const { nodes, legend } = useMemo(() => {
        const series = toTreeNodes(rows)
        const totals = series.map(({ name, children }) => ({
            name,
            value: children.reduce((sum, child) => sum + child.size, 0),
        }))
        const colored = colorByEntity(totals, visualSettings.visualColorPalette, i18n.t('Other'))
        const grand = totals.reduce((sum, { value }) => sum + value, 0)
        const colorOf = (index: number) =>
            colored[Math.min(index, colored.length - 1)]?.color ?? '#9a9a96'
        const tree = series.map(({ name, children }, index) => {
            const seriesTotal = totals[index]?.value ?? 0
            return {
                name,
                children: children.map(
                    (child): Leaf => ({
                        name: child.name,
                        size: child.size,
                        series: name,
                        color: colorOf(index),
                        seriesShare: seriesTotal ? child.size / seriesTotal : 0,
                        totalShare: grand ? child.size / grand : 0,
                    })
                ),
            }
        })
        return { nodes: tree, legend: colored }
    }, [rows, visualSettings.visualColorPalette])

    const multiSeries = nodes.length > 1

    return (
        <ChartFrame {...props} plain error={error} isEmpty={nodes.length === 0}>
            <div className="flex flex-col gap-3 p-4">
                {multiSeries && (
                    <ul
                        className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0"
                        style={{ color: labels.color, fontSize: labels.fontSize }}
                    >
                        {legend.map((item) => (
                            <li key={item.name} className="flex items-center gap-2">
                                <span
                                    className="h-2.5 w-2.5 rounded-sm"
                                    style={{ background: item.color }}
                                />
                                {item.name}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="h-[400px] w-full">
                    <ResponsiveContainer>
                        <Treemap
                            data={nodes}
                            dataKey="size"
                            isAnimationActive={false}
                            content={
                                <TreeCell background={background} fontSize={labels.fontSize} />
                            }
                        >
                            <Tooltip content={<TreeTooltip multiSeries={multiSeries} />} />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            </div>
        </ChartFrame>
    )
}
