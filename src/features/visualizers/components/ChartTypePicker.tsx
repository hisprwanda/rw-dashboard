import i18n from '@dhis2/d2-i18n'
import { Button, Input, Modal, ModalContent, ModalTitle } from '@dhis2/ui'
import { useState } from 'react'
import {
    chartRegistry,
    chartTypeLabel,
    findChart,
    type ChartDefinition,
    type ChartType,
} from '@/features/charts'
import { chartTypeDescription, OFFICIAL_CHART_ORDER } from '../utils/visTypeDescriptions'

interface ChartTypePickerProps {
    value: ChartType
    onChange: (type: ChartType) => void
}

/** A large version of a 24px chart icon, for the description panel. */
const LargeIcon = ({ chart }: { chart: ChartDefinition }) => (
    <span className="flex h-12 w-12 items-center justify-center [&_svg]:h-12 [&_svg]:w-12">
        {chart.icon}
    </span>
)

/**
 * A button showing the chart type; opens the type picker of the official Data Visualizer:
 * a grid of every type, with the description of the hovered (or focused) one beside it.
 */
export const ChartTypePicker = ({ value, onChange }: ChartTypePickerProps) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [highlighted, setHighlighted] = useState<ChartType | null>(null)
    const current = findChart(value)
    const term = search.trim().toLowerCase()
    const matching = chartRegistry.filter((chart) =>
        chartTypeLabel(chart.type).toLowerCase().includes(term)
    )
    const official = OFFICIAL_CHART_ORDER.flatMap((type) =>
        matching.filter((chart) => chart.type === type)
    )
    const additional = matching.filter((chart) => !OFFICIAL_CHART_ORDER.includes(chart.type))
    const described = findChart(highlighted ?? value)

    const close = () => {
        setOpen(false)
        setHighlighted(null)
    }
    const pick = (type: ChartType) => {
        onChange(type)
        close()
    }

    return (
        <>
            <Button
                small
                icon={current ? <span className="flex">{current.icon}</span> : undefined}
                onClick={() => setOpen(true)}
            >
                {current ? chartTypeLabel(current.type) : i18n.t('Chart type')}
            </Button>
            {open && (
                <Modal large onClose={close} position="middle">
                    <ModalTitle>{i18n.t('Visualization type')}</ModalTitle>
                    <ModalContent>
                        <Input
                            dense
                            placeholder={i18n.t('Search visualization types')}
                            value={search}
                            onChange={({ value: next }) => setSearch(next ?? '')}
                        />
                        <div className="mt-3 flex gap-4">
                            <div className="flex max-h-[440px] flex-grow flex-col gap-3 overflow-y-auto">
                                {[
                                    { title: i18n.t('All types'), charts: official },
                                    { title: i18n.t('Additional types'), charts: additional },
                                ]
                                    .filter((group) => group.charts.length > 0)
                                    .map((group) => (
                                        <section key={group.title}>
                                            <h4 className="m-0 mb-2 text-sm font-semibold text-gray-700">
                                                {group.title}
                                            </h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                {group.charts.map((chart) => (
                                                    <button
                                                        key={chart.type}
                                                        type="button"
                                                        aria-pressed={chart.type === value}
                                                        onClick={() => pick(chart.type)}
                                                        onMouseEnter={() =>
                                                            setHighlighted(chart.type)
                                                        }
                                                        onFocus={() => setHighlighted(chart.type)}
                                                        onMouseLeave={() => setHighlighted(null)}
                                                        onBlur={() => setHighlighted(null)}
                                                        className={`flex flex-col items-center gap-2 rounded border p-3 text-center text-sm ${
                                                            chart.type === value
                                                                ? 'border-blue-400 bg-blue-50'
                                                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <span className="flex">{chart.icon}</span>
                                                        <span>{chartTypeLabel(chart.type)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                {official.length + additional.length === 0 && (
                                    <p className="text-sm text-gray-500">
                                        {i18n.t('No visualization types found')}
                                    </p>
                                )}
                            </div>
                            {described && (
                                <aside
                                    aria-live="polite"
                                    className="flex w-[240px] flex-shrink-0 flex-col gap-3 rounded bg-gray-50 p-4"
                                >
                                    <LargeIcon chart={described} />
                                    <h3 className="m-0 text-base font-semibold">
                                        {chartTypeLabel(described.type)}
                                    </h3>
                                    <p className="m-0 text-sm text-gray-700">
                                        {chartTypeDescription(described.type)}
                                    </p>
                                </aside>
                            )}
                        </div>
                    </ModalContent>
                </Modal>
            )}
        </>
    )
}
