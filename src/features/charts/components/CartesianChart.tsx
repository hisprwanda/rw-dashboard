import type { ReactElement } from 'react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Text,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { ChartTooltipContent } from './ChartTooltipContent'
import type { ChartProps } from '../types/chart.types'
import { ChartFrame } from './ChartFrame'
import { useChartData } from '../hooks/useChartData'

export type CartesianVariant =
    | 'Column'
    | 'Stacked Col'
    | 'Bar'
    | 'Stacked Bar'
    | 'Line'
    | 'Area'
    | 'Scatter'

interface CartesianSpec {
    series: 'bar' | 'line' | 'area' | 'scatter'
    /** Categories on the Y axis (horizontal bars). */
    horizontal?: boolean
    stacked?: boolean
    labelPosition?: 'top' | 'center'
    /** Extra room below rotated labels, or a fixed margin. */
    margin?: (rotated: boolean) => { top: number; right: number; left: number; bottom: number }
}

const WIDE_MARGIN = (bottomRotated: number, bottom: number) => (rotated: boolean) => ({
    top: 20,
    right: 30,
    left: 20,
    bottom: rotated ? bottomRotated : bottom,
})

/** The only differences between the axis-based charts. */
const SPECS: Record<CartesianVariant, CartesianSpec> = {
    Column: { series: 'bar', labelPosition: 'top' },
    'Stacked Col': {
        series: 'bar',
        stacked: true,
        labelPosition: 'center',
        margin: WIDE_MARGIN(50, 5),
    },
    Bar: {
        series: 'bar',
        horizontal: true,
        labelPosition: 'center',
        margin: () => ({ top: 20, right: 30, left: 20, bottom: 20 }),
    },
    'Stacked Bar': { series: 'bar', horizontal: true, stacked: true, labelPosition: 'center' },
    Line: { series: 'line', margin: WIDE_MARGIN(80, 20) },
    Area: { series: 'area', stacked: true, labelPosition: 'center', margin: WIDE_MARGIN(80, 20) },
    Scatter: { series: 'scatter' },
}

interface CategoryTickProps {
    x?: number
    y?: number
    payload?: { value: string }
    rotated: boolean
    fill: string
    fontSize: number
}

/** Category label on the Y axis of horizontal bars, tilted when there are many. */
const CategoryTick = ({ x = 0, y = 0, payload, rotated, fill, fontSize }: CategoryTickProps) => (
    <Text
        x={x}
        y={y}
        dy={rotated ? 0 : 3}
        angle={rotated ? -35 : 0}
        textAnchor="end"
        fill={fill}
        fontSize={fontSize}
        fontWeight="bold"
    >
        {payload?.value ?? ''}
    </Text>
)

const CHART_BY_SERIES = { bar: BarChart, line: LineChart, area: AreaChart, scatter: ScatterChart }

/** Rotate category labels once there are more than this many categories. */
const ROTATE_AFTER = 5

interface CartesianChartProps extends ChartProps {
    variant: CartesianVariant
}

export const CartesianChart = ({ variant, ...props }: CartesianChartProps) => {
    const spec = SPECS[variant]
    const { visualSettings } = props
    const { rows, config, error } = useChartData(props)
    const rotated = rows.length > ROTATE_AFTER
    const labelStyle = { fontSize: '12px', fontWeight: 'bold' }
    const xTick = {
        fill: visualSettings.XAxisSettings.color,
        fontSize: visualSettings.XAxisSettings.fontSize,
        fontWeight: 'bold',
    }
    const yTick = {
        fill: visualSettings.YAxisSettings.color,
        fontSize: visualSettings.YAxisSettings.fontSize,
        fontWeight: 'bold',
    }
    const longestLabel = Math.max(0, ...rows.map((row) => row.period.length))
    const categoryAxisWidth = Math.max(120, rotated ? 100 : longestLabel * 8)

    const renderSeries = (key: string): ReactElement => {
        const { label, color } = config[key] ?? { label: key, color: '' }
        const valueLabels = spec.labelPosition && (
            <LabelList
                dataKey={key}
                position={spec.labelPosition}
                fill={visualSettings.fillColor}
                style={labelStyle}
            />
        )
        const stackId = spec.stacked ? 'a' : undefined
        switch (spec.series) {
            case 'line':
                return (
                    <Line
                        key={key}
                        dataKey={key}
                        name={label}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        label={{
                            position: 'top',
                            fill: visualSettings.fillColor,
                            ...labelStyle,
                            dy: -2,
                        }}
                    />
                )
            case 'area':
                return (
                    <Area
                        key={key}
                        dataKey={key}
                        name={label}
                        type="natural"
                        fill={color}
                        stroke={color}
                        stackId={stackId}
                    >
                        {valueLabels}
                    </Area>
                )
            case 'scatter':
                return <Scatter key={key} dataKey={key} name={label} fill={color} shape="diamond" />
            default:
                return (
                    <Bar key={key} dataKey={key} name={label} fill={color} stackId={stackId}>
                        {valueLabels}
                    </Bar>
                )
        }
    }

    const Chart = CHART_BY_SERIES[spec.series]

    return (
        <ChartFrame {...props} error={error} isEmpty={rows.length === 0}>
            <ResponsiveContainer
                width="100%"
                height={spec.horizontal ? rows.length * 50 + 100 : '100%'}
            >
                <Chart
                    data={rows}
                    layout={spec.horizontal ? 'vertical' : 'horizontal'}
                    margin={spec.margin?.(rotated)}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={!spec.horizontal} />
                    {spec.horizontal ? (
                        <>
                            <XAxis type="number" tick={xTick} />
                            <YAxis
                                dataKey="period"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                width={categoryAxisWidth}
                                tick={
                                    <CategoryTick
                                        rotated={rotated}
                                        fill={yTick.fill}
                                        fontSize={yTick.fontSize}
                                    />
                                }
                            />
                        </>
                    ) : (
                        <>
                            <XAxis
                                dataKey="period"
                                tickLine={false}
                                tickMargin={rotated ? 15 : 10}
                                axisLine
                                tick={xTick}
                                angle={rotated ? -45 : 0}
                                textAnchor={rotated ? 'end' : 'middle'}
                                height={rotated ? 100 : 60}
                            />
                            <YAxis tick={yTick} />
                        </>
                    )}
                    <Tooltip content={<ChartTooltipContent config={config} />} />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    {Object.keys(config).map(renderSeries)}
                </Chart>
            </ResponsiveContainer>
        </ChartFrame>
    )
}
