import React, { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, LabelList } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../../components/ui/chart'
import { ChartHeading, type VisualSettings, type VisualTitles } from '@/features/charts'
import { generateBulletinChartConfig } from './BulletinAreaChartFormat'

/** Rows already shaped for the chart by ReportTemplate (not a raw analytics response). */
type BulletinRow = Record<string, string | number | null>

interface BulletinAreaChartProps {
    data: BulletinRow[] | null | undefined
    visualSettings: VisualSettings
    visualTitleAndSubTitle: VisualTitles
}

export const BulletinAreaChart: React.FC<BulletinAreaChartProps> = ({
    data,
    visualSettings,
    visualTitleAndSubTitle,
}) => {
    const { chartData, chartConfig, error } = useMemo(() => {
        try {
            const transformedData = data ?? []
            const config = generateBulletinChartConfig(data, visualSettings.visualColorPalette)
            return { chartData: transformedData, chartConfig: config, error: null }
        } catch (err) {
            return { chartData: [], chartConfig: {}, error: (err as Error).message }
        }
    }, [data, visualSettings])

    if (error || chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-gray-500 text-lg">{error || 'No data available'}</p>
            </div>
        )
    }

    return (
        <ChartContainer
            config={chartConfig}
            style={{ backgroundColor: visualSettings.backgroundColor }}
        >
            {/* DefaultSubTitle is an object, not a list: the old .map() here crashed. */}
            <ChartHeading titles={visualTitleAndSubTitle} />

            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                    tick={{
                        fill: visualSettings.XAxisSettings.color,
                        fontSize: visualSettings.XAxisSettings.fontSize,
                        fontWeight: 'bold',
                    }}
                />
                <YAxis
                    tick={{
                        fill: visualSettings.YAxisSettings.color,
                        fontSize: visualSettings.YAxisSettings.fontSize,
                        fontWeight: 'bold',
                    }}
                />
                <Tooltip content={<ChartTooltipContent className="bg-white" />} />
                <Legend />
                {Object.keys(chartConfig).map((key) => (
                    <Area
                        key={key}
                        dataKey={key}
                        fill={chartConfig[key].color}
                        stroke={chartConfig[key].color}
                        name={chartConfig[key].label}
                        type="natural"
                        stackId="a"
                    >
                        <LabelList
                            dataKey={key}
                            position="center"
                            fill={visualSettings.fillColor}
                            style={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                    </Area>
                ))}
            </AreaChart>
        </ChartContainer>
    )
}
