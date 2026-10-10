import i18n from '@dhis2/d2-i18n'
import { Button, Input, Modal, ModalContent, ModalTitle } from '@dhis2/ui'
import { useState } from 'react'
import { chartRegistry, chartTypeLabel, findChart, type ChartType } from '@/features/charts'
import { chartTypeDescription, OFFICIAL_CHART_ORDER } from '../utils/visTypeDescriptions'

interface ChartTypePickerProps {
    value: ChartType
    onChange: (type: ChartType) => void
}

/**
 * A button showing the chart type; opens the type picker of the official Data Visualizer:
 * every type as a card with its icon, name and description, readable at a glance.
 */
export const ChartTypePicker = ({ value, onChange }: ChartTypePickerProps) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const current = findChart(value)
    const term = search.trim().toLowerCase()
    const matching = chartRegistry.filter((chart) =>
        [chartTypeLabel(chart.type), chartTypeDescription(chart.type)].some((text) =>
            text.toLowerCase().includes(term)
        )
    )
    const official = OFFICIAL_CHART_ORDER.flatMap((type) =>
        matching.filter((chart) => chart.type === type)
    )
    const additional = matching.filter((chart) => !OFFICIAL_CHART_ORDER.includes(chart.type))

    const pick = (type: ChartType) => {
        onChange(type)
        setOpen(false)
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
                <Modal large onClose={() => setOpen(false)} position="middle">
                    <ModalTitle>{i18n.t('Visualization type')}</ModalTitle>
                    <ModalContent>
                        <Input
                            dense
                            placeholder={i18n.t('Search visualization types')}
                            value={search}
                            onChange={({ value: next }) => setSearch(next ?? '')}
                        />
                        <div className="mt-3 flex max-h-[480px] flex-col gap-3 overflow-y-auto">
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
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                            {group.charts.map((chart) => (
                                                <button
                                                    key={chart.type}
                                                    type="button"
                                                    aria-pressed={chart.type === value}
                                                    onClick={() => pick(chart.type)}
                                                    className={`flex items-start gap-3 rounded border p-3 text-left ${
                                                        chart.type === value
                                                            ? 'border-blue-400 bg-blue-50'
                                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span className="flex flex-shrink-0">
                                                        {chart.icon}
                                                    </span>
                                                    <span className="flex flex-col gap-1">
                                                        <span className="text-sm font-semibold">
                                                            {chartTypeLabel(chart.type)}
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            {chartTypeDescription(chart.type)}
                                                        </span>
                                                    </span>
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
                    </ModalContent>
                </Modal>
            )}
        </>
    )
}
