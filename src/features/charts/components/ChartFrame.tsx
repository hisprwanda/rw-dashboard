import i18n from '@dhis2/d2-i18n'
import type { ReactElement } from 'react'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { ChartProps } from '../types/chart.types'
import { ChartHeading } from './ChartHeading'

interface ChartFrameProps
    extends Pick<
        ChartProps,
        'visualSettings' | 'visualTitleAndSubTitle' | 'analyticsPayloadDeterminer'
    > {
    config: ChartConfig
    /** Set when the data could not be charted; replaces the chart with a message. */
    error?: string | null
    isEmpty?: boolean
    /** Hide the title/subtitle (single value, gauge). */
    hideHeading?: boolean
    /** Render the content as-is (tables) instead of inside the recharts container. */
    plain?: boolean
    /**
     * Exactly one element: recharts' ResponsiveContainer sizes its direct child, so a
     * wrapper (fragment/div) around the chart would leave it without dimensions.
     */
    children: ReactElement
}

export const ChartEmpty = ({ message }: { message?: string | null }) => (
    <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
        <p className="text-lg text-gray-500">{message || i18n.t('No data available')}</p>
    </div>
)

/** Shared shell of every chart: colors (CSS vars + tooltips), background, heading, empty state. */
export const ChartFrame = ({
    config,
    error,
    isEmpty,
    hideHeading,
    plain,
    visualSettings,
    visualTitleAndSubTitle,
    analyticsPayloadDeterminer,
    children,
}: ChartFrameProps) => {
    if (error || isEmpty) return <ChartEmpty message={error} />
    return (
        <div className="h-full w-full" style={{ backgroundColor: visualSettings.backgroundColor }}>
            {!hideHeading && (
                <ChartHeading titles={visualTitleAndSubTitle} layout={analyticsPayloadDeterminer} />
            )}
            {plain ? (
                children
            ) : (
                <ChartContainer config={config} style={{ width: '100%', height: '100%' }}>
                    {children}
                </ChartContainer>
            )}
        </div>
    )
}
