import i18n from '@dhis2/d2-i18n'
import { IconChevronDown16, IconChevronUp16 } from '@dhis2/ui'
import { useState } from 'react'
import type { LegendClass } from '../types/map.types'

interface MapLegendProps {
    title: string
    classes: readonly LegendClass[]
    defaultOpen?: boolean
}

const format = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1))

/** Collapsible legend floating over the bottom-right corner of the map. */
export const MapLegend = ({ title, classes, defaultOpen = true }: MapLegendProps) => {
    const [open, setOpen] = useState(defaultOpen)
    if (!classes.length) return null
    return (
        <div className="absolute bottom-4 right-4 z-[1000] w-60 rounded bg-white shadow-lg">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-label={open ? i18n.t('Collapse legend') : i18n.t('Expand legend')}
                className="flex w-full items-center justify-between rounded-t border-b border-gray-200 bg-gray-50 p-2 text-left text-sm font-bold"
            >
                {title}
                {open ? <IconChevronDown16 /> : <IconChevronUp16 />}
            </button>
            {open && (
                <ul className="m-0 max-h-[280px] list-none overflow-y-auto p-2">
                    {classes.map((item) => (
                        <li
                            key={`${item.name}-${item.startValue}`}
                            className="mb-1 flex items-center gap-2 text-sm"
                        >
                            <span
                                className="h-4 w-4 shrink-0 border border-gray-300"
                                style={{ backgroundColor: item.color }}
                            />
                            {item.name}: {format(item.startValue)} – {format(item.endValue)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
