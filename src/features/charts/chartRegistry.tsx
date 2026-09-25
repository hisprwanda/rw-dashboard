import type { ComponentType, ReactNode } from 'react'
import { FaChartArea, FaChartLine } from 'react-icons/fa'
import { FaTableCells } from 'react-icons/fa6'
import { GiRadialBalance } from 'react-icons/gi'
import { IoBarChartSharp, IoPieChart } from 'react-icons/io5'
import { PiChartScatterDuotone } from 'react-icons/pi'
import { RxValue } from 'react-icons/rx'
import { TbChartRadar } from 'react-icons/tb'
import { VscListTree } from 'react-icons/vsc'
import { CartesianChart, type CartesianVariant } from './components/CartesianChart'
import { GaugeChart } from './components/GaugeChart'
import { PieChart } from './components/PieChart'
import { RadarChart } from './components/RadarChart'
import { RadialChart } from './components/RadialChart'
import { SingleValueChart } from './components/SingleValueChart'
import { TableChart } from './components/TableChart'
import { TreeMapChart } from './components/TreeMapChart'
import type { ChartProps, ChartType } from './types/chart.types'

export interface ChartDefinition {
    type: ChartType
    icon: ReactNode
    component: ComponentType<ChartProps>
}

const cartesian = (variant: CartesianVariant): ComponentType<ChartProps> => {
    const Chart = (props: ChartProps) => <CartesianChart variant={variant} {...props} />
    Chart.displayName = `CartesianChart(${variant})`
    return Chart
}

/** Every chart type, in the order shown in the chart picker. The first one is the default. */
export const chartRegistry: readonly ChartDefinition[] = [
    { type: 'Column', icon: <IoBarChartSharp />, component: cartesian('Column') },
    { type: 'Gauge', icon: <IoBarChartSharp />, component: GaugeChart },
    { type: 'Table', icon: <FaTableCells />, component: TableChart },
    { type: 'Stacked Col', icon: <IoBarChartSharp />, component: cartesian('Stacked Col') },
    { type: 'Bar', icon: <IoBarChartSharp />, component: cartesian('Bar') },
    { type: 'Stacked Bar', icon: <IoBarChartSharp />, component: cartesian('Stacked Bar') },
    { type: 'Line', icon: <FaChartLine />, component: cartesian('Line') },
    { type: 'Area', icon: <FaChartArea />, component: cartesian('Area') },
    { type: 'Pie', icon: <IoPieChart />, component: PieChart },
    { type: 'Radial', icon: <GiRadialBalance />, component: RadialChart },
    { type: 'Tree Map', icon: <VscListTree />, component: TreeMapChart },
    { type: 'Single Value', icon: <RxValue />, component: SingleValueChart },
    { type: 'Radar', icon: <TbChartRadar />, component: RadarChart },
    { type: 'Scatter', icon: <PiChartScatterDuotone />, component: cartesian('Scatter') },
]

export const DEFAULT_CHART_TYPE: ChartType = 'Column'

export const findChart = (type: string | undefined) =>
    chartRegistry.find((chart) => chart.type === type)
