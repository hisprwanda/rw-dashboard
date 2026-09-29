import { PolarAngleAxis, PolarGrid, Radar, RadarChart as ReRadarChart, Tooltip } from 'recharts'
import { ChartTooltipContent } from './ChartTooltipContent'
import type { ChartProps } from '../types/chart.types'
import { ChartFrame } from './ChartFrame'
import { useChartData } from '../hooks/useChartData'

export const RadarChart = (props: ChartProps) => {
    const { visualSettings } = props
    const { rows, config, error } = useChartData(props)
    return (
        <ChartFrame {...props} error={error} isEmpty={rows.length === 0}>
            <ReRadarChart data={rows} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <Tooltip cursor={false} content={<ChartTooltipContent config={config} />} />
                <PolarAngleAxis
                    dataKey="period"
                    tick={{
                        fill: visualSettings.fillColor,
                        fontSize: visualSettings.XAxisSettings.fontSize,
                        fontWeight: 'bold',
                    }}
                />
                <PolarGrid />
                {Object.entries(config).map(([key, series]) => (
                    <Radar key={key} dataKey={key} fill={series.color} fillOpacity={0.6} />
                ))}
            </ReRadarChart>
        </ChartFrame>
    )
}
