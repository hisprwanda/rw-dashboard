import { createVisualization } from '@dhis2/analytics'
import { useEffect, useRef, useState } from 'react'
import { ErrorState } from '@/shared/components'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import { withHeaderIndexes } from '../utils/analyticsData'
import type { Visualization } from '../types/visualization.types'

interface DhisChartProps {
    /** The analytics response, with its metadata (one per year for year-over-year charts). */
    data: AnalyticsResponse | AnalyticsResponse[]
    visualization: Visualization
    /** Legend sets the chart colors values with (the one the visualization names). */
    legendSets?: unknown[]
    /** Extra engine options, e.g. the year-over-year series and categories. */
    extraOptions?: Record<string, unknown>
}

/** A chart drawn by the official DHIS2 chart engine (Highcharts, DHIS2 palettes and styling). */
export const DhisChart = ({ data, visualization, legendSets, extraOptions }: DhisChartProps) => {
    const elementRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const element = elementRef.current
        if (!element) return
        try {
            const { visualization: chart } = createVisualization(
                Array.isArray(data) ? data.map(withHeaderIndexes) : withHeaderIndexes(data),
                visualization,
                element,
                { dashboard: false, legendSets, ...extraOptions },
                (message) => {
                    throw new Error(message)
                }
            )
            setError(null)
            return () => chart.destroy()
        } catch (cause) {
            setError(cause instanceof Error ? cause : new Error(String(cause)))
        }
    }, [data, visualization, legendSets, extraOptions])

    return (
        <>
            {error && <ErrorState error={error} />}
            <div ref={elementRef} className="h-[480px] w-full" hidden={!!error} />
        </>
    )
}
