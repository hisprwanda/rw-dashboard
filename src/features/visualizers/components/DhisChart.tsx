import { createVisualization } from '@dhis2/analytics'
import { useEffect, useRef, useState } from 'react'
import { ErrorState } from '@/shared/components'
import type { Visualization } from '../types/visualization.types'

interface DhisChartProps {
    /** The analytics response, with its metadata. */
    data: unknown
    visualization: Visualization
}

/** A chart drawn by the official DHIS2 chart engine (Highcharts, DHIS2 palettes and styling). */
export const DhisChart = ({ data, visualization }: DhisChartProps) => {
    const elementRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const element = elementRef.current
        if (!element) return
        try {
            const { visualization: chart } = createVisualization(
                data,
                visualization,
                element,
                { dashboard: false },
                (message) => {
                    throw new Error(message)
                }
            )
            setError(null)
            return () => chart.destroy()
        } catch (cause) {
            setError(cause instanceof Error ? cause : new Error(String(cause)))
        }
    }, [data, visualization])

    return (
        <>
            {error && <ErrorState error={error} />}
            <div ref={elementRef} className="h-[480px] w-full" hidden={!!error} />
        </>
    )
}
