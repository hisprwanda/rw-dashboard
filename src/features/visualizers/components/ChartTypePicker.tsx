import i18n from '@dhis2/d2-i18n'
import { Button, Input, Modal, ModalContent, ModalTitle } from '@dhis2/ui'
import { useState } from 'react'
import { chartRegistry, findChart, type ChartType } from '@/features/charts'

interface ChartTypePickerProps {
    value: ChartType
    onChange: (type: ChartType) => void
}

/** A button showing the chart type; opens a searchable grid of every chart type. */
export const ChartTypePicker = ({ value, onChange }: ChartTypePickerProps) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const current = findChart(value)
    const charts = chartRegistry.filter((chart) =>
        chart.type.toLowerCase().includes(search.trim().toLowerCase())
    )

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
                {current?.type ?? i18n.t('Chart type')}
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
                        <div className="mt-3 grid max-h-[400px] grid-cols-3 gap-2 overflow-y-auto">
                            {charts.map((chart) => (
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
                                    <span>{chart.type}</span>
                                </button>
                            ))}
                        </div>
                    </ModalContent>
                </Modal>
            )}
        </>
    )
}
