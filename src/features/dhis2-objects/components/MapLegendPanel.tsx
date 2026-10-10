import i18n from '@dhis2/d2-i18n'
import { IconChevronDown16, IconChevronUp16 } from '@dhis2/ui'
import { useState } from 'react'
import { formatNumber } from '@/shared/utils/format'
import type { MapLegend, MapLegendEntry } from '../utils/mapLegend'

const Swatch = ({ entry, kind }: { entry: MapLegendEntry; kind: LegendKind }) => {
    if (entry.image) return <img src={entry.image} alt="" className="h-4 w-4" />
    if (kind === 'orgUnit') {
        return (
            <span
                className="inline-block w-4"
                style={{ borderTop: `${Math.max(1, entry.weight ?? 1)}px solid ${entry.color}` }}
            />
        )
    }
    if (kind === 'facility') {
        return (
            <span
                className="inline-block h-3 w-3 rounded-full border border-gray-700"
                style={{ background: entry.color }}
            />
        )
    }
    return (
        <span
            className="inline-block h-3 w-4 rounded-sm border border-black/10"
            style={{ background: entry.color }}
        />
    )
}

type LegendKind = 'thematic' | 'orgUnit' | 'facility'

interface MapLegendPanelProps {
    legends: ReadonlyArray<{ id: string; kind: LegendKind; legend: MapLegend }>
}

/** The layers' legends, over the map, as in DHIS2 Maps (collapsible on small tiles). */
export const MapLegendPanel = ({ legends }: MapLegendPanelProps) => {
    const [open, setOpen] = useState(true)
    if (!legends.length) return null
    return (
        <div className="absolute right-2 top-2 z-10 max-h-[calc(100%-1rem)] max-w-[220px] overflow-y-auto rounded bg-white/95 text-xs text-gray-800 shadow">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 px-2 py-1 font-semibold"
            >
                {i18n.t('Legend')}
                {open ? <IconChevronUp16 /> : <IconChevronDown16 />}
            </button>
            {open &&
                legends.map(({ id, kind, legend }) => (
                    <section key={id} className="border-t border-gray-200 px-2 py-1.5">
                        <h4 className="m-0 text-xs font-semibold">{legend.title}</h4>
                        {(legend.period || legend.unit) && (
                            <p className="m-0 text-gray-600">{legend.period ?? legend.unit}</p>
                        )}
                        {legend.filters?.map((filter) => (
                            <p key={filter} className="m-0 text-gray-600">
                                {filter}
                            </p>
                        ))}
                        <ul className="m-0 mt-1 flex list-none flex-col gap-0.5 p-0">
                            {legend.entries.map((entry, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <Swatch entry={entry} kind={kind} />
                                    <span className="min-w-0 flex-grow truncate">
                                        {[entry.name, entry.range].filter(Boolean).join(' ')}
                                    </span>
                                    {entry.count !== undefined && (
                                        <span className="tabular-nums text-gray-500">
                                            {entry.count}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {legend.bubbles && (
                            <p className="m-0 mt-1 text-gray-600">
                                {i18n.t('Bubble size from {{min}} to {{max}}', {
                                    min: formatNumber(legend.bubbles.minValue),
                                    max: formatNumber(legend.bubbles.maxValue),
                                    interpolation: { escapeValue: false },
                                })}
                            </p>
                        )}
                    </section>
                ))}
        </div>
    )
}
