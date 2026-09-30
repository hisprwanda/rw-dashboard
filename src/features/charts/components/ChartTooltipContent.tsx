import type { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { SeriesConfig } from '../types/chart.types'

interface ChartTooltipContentProps extends TooltipProps<ValueType, NameType> {
    /** Labels and colors of the series (passed explicitly: no React Context). */
    config: SeriesConfig
    hideLabel?: boolean
    /** Field of the data row that names the item (e.g. `name` for pie slices). */
    nameKey?: string
}

const readField = (row: unknown, field: string): unknown =>
    typeof row === 'object' && row !== null && field in row
        ? (row as Record<string, unknown>)[field]
        : undefined

/** Tooltip body for recharts: category label, then one colored line per series. */
export const ChartTooltipContent = ({
    active,
    payload,
    label,
    config,
    hideLabel = false,
    nameKey,
}: ChartTooltipContentProps) => {
    if (!active || !payload?.length) return null
    return (
        <div className="grid min-w-[8rem] gap-1.5 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow-lg">
            {!hideLabel && label !== undefined && label !== '' && (
                <div className="font-medium">{String(label)}</div>
            )}
            {payload.map((item, index) => {
                const named = nameKey ? readField(item.payload, nameKey) : undefined
                const key = String(named ?? item.name ?? item.dataKey ?? 'value')
                const fill = readField(item.payload, 'fill')
                const color =
                    (typeof fill === 'string' ? fill : undefined) ??
                    item.color ??
                    config[key]?.color
                return (
                    <div key={`${key}-${index}`} className="flex items-center gap-2">
                        <span
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{ backgroundColor: color }}
                        />
                        <span className="flex-1 text-gray-600">{config[key]?.label ?? key}</span>
                        {item.value !== undefined && item.value !== null && (
                            <span className="font-mono font-medium tabular-nums text-gray-900">
                                {typeof item.value === 'number'
                                    ? item.value.toLocaleString()
                                    : String(item.value)}
                            </span>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
