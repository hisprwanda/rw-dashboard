import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import {
    Cell,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'
import { formatNumber } from '@/shared/utils/format'
import type { ChartProps } from '../types/chart.types'
import { colorByEntity, type ColoredValue } from '../utils/categorical'
import { toSlices } from '../utils/chartData'
import { useChartData } from '../hooks/useChartData'
import { ChartFrame } from './ChartFrame'

/** The unfilled part of each ring: one step off the surface. */
const TRACK_COLOR = '#efefec'

const share = (value: number, total: number) =>
    total > 0 ? formatNumber(value / total, { style: 'percent', maximumFractionDigits: 1 }) : ''

interface RadialTooltipProps {
    active?: boolean
    payload?: Array<{ payload?: ColoredValue }>
    total: number
}

const RadialTooltip = ({ active, payload, total }: RadialTooltipProps) => {
    const item = payload?.[0]?.payload
    if (!active || !item) return null
    return (
        <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm shadow-md">
            <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
                <span className="font-semibold text-gray-900">{item.name}</span>
            </div>
            <div className="mt-1 flex gap-3 text-gray-700">
                <span className="tabular-nums">{formatNumber(item.value)}</span>
                <span className="text-gray-500">
                    {i18n.t('{{share}} of total', { share: share(item.value, total) })}
                </span>
            </div>
        </div>
    )
}

/**
 * One ring per data item, the largest outside, each filled in proportion to the largest
 * value (a full ring is 270°). A list beside the rings gives every value and its share.
 */
export const RadialChart = (props: ChartProps) => {
    const { visualSettings } = props
    const { rows, error } = useChartData(props)
    const labels = visualSettings.XAxisSettings

    const items = useMemo(
        () =>
            colorByEntity(
                toSlices(rows).map(({ name, total }) => ({ name, value: total })),
                visualSettings.visualColorPalette,
                i18n.t('Other')
            ),
        [rows, visualSettings.visualColorPalette]
    )
    const total = items.reduce((sum, { value }) => sum + Math.max(value, 0), 0)
    const max = Math.max(0, ...items.map(({ value }) => value))
    // Largest first in the list; recharts draws the first ring innermost, so reverse.
    const ranked = [...items].sort((a, b) => b.value - a.value)
    const rings = [...ranked].reverse().map((item) => ({ ...item, ring: Math.max(item.value, 0) }))

    return (
        <ChartFrame {...props} plain error={error} isEmpty={items.length === 0 || max <= 0}>
            <div className="flex flex-col items-center gap-6 p-4 md:flex-row md:justify-center">
                <div className="aspect-square w-full max-w-[340px]">
                    <ResponsiveContainer>
                        <RadialBarChart
                            data={rings}
                            innerRadius="22%"
                            outerRadius="100%"
                            startAngle={90}
                            endAngle={-180}
                            barCategoryGap="22%"
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, max]}
                                tick={false}
                                axisLine={false}
                            />
                            <RadialBar
                                dataKey="ring"
                                background={{ fill: TRACK_COLOR }}
                                cornerRadius={4}
                                isAnimationActive={false}
                            >
                                {rings.map((ring) => (
                                    <Cell key={ring.name} fill={ring.color} />
                                ))}
                            </RadialBar>
                            <Tooltip cursor={false} content={<RadialTooltip total={total} />} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
                <table
                    className="w-full max-w-[320px] border-collapse"
                    style={{ color: labels.color, fontSize: labels.fontSize }}
                >
                    <caption className="sr-only">{i18n.t('Values')}</caption>
                    <tbody>
                        {ranked.map((item) => (
                            <tr key={item.name} className="border-b border-gray-100 last:border-0">
                                <td className="py-1.5 pr-2">
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                                            style={{ background: item.color }}
                                        />
                                        <span>{item.name}</span>
                                    </span>
                                </td>
                                <td className="py-1.5 text-right font-semibold tabular-nums">
                                    {formatNumber(item.value)}
                                </td>
                                <td className="py-1.5 pl-3 text-right tabular-nums opacity-70">
                                    {share(Math.max(item.value, 0), total)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ChartFrame>
    )
}
