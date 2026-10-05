import i18n from '@dhis2/d2-i18n'
import { Button, Input, Modal, ModalContent, ModalTitle } from '@dhis2/ui'
import { useState } from 'react'
import { chartRegistry, chartTypeLabel, findChart, type ChartType } from '@/features/charts'

/** The official Data Visualizer's order; the chart types it lacks come after, separately. */
const OFFICIAL_ORDER: readonly ChartType[] = [
    'Column',
    'Stacked Col',
    'Bar',
    'Stacked Bar',
    'Line',
    'Area',
    'Stacked Area',
    'Pie',
    'Radar',
    'Gauge',
    'Single Value',
    'Scatter',
    'Table',
]

interface ChartTypePickerProps {
    value: ChartType
    onChange: (type: ChartType) => void
}

/** A button showing the chart type; opens a searchable grid of every chart type. */
export const ChartTypePicker = ({ value, onChange }: ChartTypePickerProps) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const current = findChart(value)
    const matching = chartRegistry.filter((chart) =>
        chartTypeLabel(chart.type).toLowerCase().includes(search.trim().toLowerCase())
    )
    const official = OFFICIAL_ORDER.flatMap((type) => matching.filter((c) => c.type === type))
    const additional = matching.filter((chart) => !OFFICIAL_ORDER.includes(chart.type))

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
                <Modal onClose={() => setOpen(false)} position="middle">
                    <ModalTitle>{i18n.t('Select chart type')}</ModalTitle>
                    <ModalContent>
                        <Input
                            dense
                            placeholder={i18n.t('Search chart types')}
                            value={search}
                            onChange={({ value: next }) => setSearch(next ?? '')}
                        />
                        <div className="mt-3 flex max-h-[400px] flex-col gap-3 overflow-y-auto">
                            {[
                                { title: i18n.t('Chart types'), charts: official },
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
                                                    onClick={() => pick(chart.type)}
                                                    className={`flex items-center gap-2 rounded border p-3 text-left ${
                                                        chart.type === value
                                                            ? 'border-blue-400 bg-blue-50'
                                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span className="text-xl">{chart.icon}</span>
                                                    <span>{chartTypeLabel(chart.type)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                ))}
                        </div>
                    </ModalContent>
                </Modal>
            )}
        </>
    )
}
