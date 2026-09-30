import type { ComponentType, ReactNode } from 'react'
import {
    IconVisualizationArea24,
    IconVisualizationBar24,
    IconVisualizationBarStacked24,
    IconVisualizationColumn24,
    IconVisualizationColumnStacked24,
    IconVisualizationGauge24,
    IconVisualizationLine24,
    IconVisualizationPie24,
    IconVisualizationPivotTable24,
    IconVisualizationRadar24,
    IconVisualizationScatter24,
    IconVisualizationSingleValue24,
} from '@dhis2/ui'
// lucide is the single fallback set, for the chart types @dhis2/ui has no icon for.
import { LayoutGrid, Target } from 'lucide-react'
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
    { type: 'Column', icon: <IconVisualizationColumn24 />, component: cartesian('Column') },
    { type: 'Gauge', icon: <IconVisualizationGauge24 />, component: GaugeChart },
    { type: 'Table', icon: <IconVisualizationPivotTable24 />, component: TableChart },
    {
        type: 'Stacked Col',
        icon: <IconVisualizationColumnStacked24 />,
        component: cartesian('Stacked Col'),
    },
    { type: 'Bar', icon: <IconVisualizationBar24 />, component: cartesian('Bar') },
    {
        type: 'Stacked Bar',
        icon: <IconVisualizationBarStacked24 />,
        component: cartesian('Stacked Bar'),
    },
    { type: 'Line', icon: <IconVisualizationLine24 />, component: cartesian('Line') },
    { type: 'Area', icon: <IconVisualizationArea24 />, component: cartesian('Area') },
    { type: 'Pie', icon: <IconVisualizationPie24 />, component: PieChart },
    { type: 'Radial', icon: <Target size={24} />, component: RadialChart },
    { type: 'Tree Map', icon: <LayoutGrid size={24} />, component: TreeMapChart },
    { type: 'Single Value', icon: <IconVisualizationSingleValue24 />, component: SingleValueChart },
    { type: 'Radar', icon: <IconVisualizationRadar24 />, component: RadarChart },
    { type: 'Scatter', icon: <IconVisualizationScatter24 />, component: cartesian('Scatter') },
]

export const findChart = (type: string | undefined) =>
    chartRegistry.find((chart) => chart.type === type)
