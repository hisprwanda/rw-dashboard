import { findChart } from '../chartRegistry'
import type { ChartProps } from '../types/chart.types'

interface ChartRendererProps extends ChartProps {
    /** A chart type from the registry (saved visuals store it as a string). */
    type: string | undefined
}

/** Renders the chart registered for `type`, or nothing for an unknown type. */
export const ChartRenderer = ({ type, ...props }: ChartRendererProps) => {
    const Chart = findChart(type)?.component
    return Chart ? <Chart {...props} /> : null
}
