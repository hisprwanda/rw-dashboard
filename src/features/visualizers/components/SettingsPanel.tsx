import i18n from '@dhis2/d2-i18n'
import { Button, IconInfo16, InputField } from '@dhis2/ui'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { chartTypeLabel, type AxisSettings, type ChartType } from '@/features/charts'
import { ColorField } from '@/shared/components'
import { visualizerActions as actions } from '../store/visualizerSlice'
import { visTypeFromChartType } from '../utils/visualization'
import { ColorPalettePicker } from './ColorPalettePicker'

const Section = ({
    title,
    hint,
    children,
}: {
    title: string
    hint?: string
    children: React.ReactNode
}) => (
    <section className="flex flex-col gap-2 border-b border-gray-200 pb-3">
        <div>
            <h4 className="m-0 text-sm font-semibold text-gray-800">{title}</h4>
            {hint && <p className="m-0 mt-0.5 text-xs text-gray-600">{hint}</p>}
        </div>
        {children}
    </section>
)

/** Whether the app draws a chart type itself (the others are drawn by the DHIS2 engine). */
export const isAppChartType = (type: ChartType) => !visTypeFromChartType(type)

interface SettingsPanelProps {
    /** Opens the Options dialog of the DHIS2 chart types. */
    onOpenOptions: () => void
}

/**
 * The Style tab. Its settings only reach the chart types the app draws itself (Radial,
 * Tree map); for DHIS2 chart types it points to the Options dialog instead.
 */
export const SettingsPanel = ({ onOpenOptions }: SettingsPanelProps) => {
    const dispatch = useAppDispatch()
    const chartType = useAppSelector((state) => state.visualizer.chartType)
    const settings = useAppSelector((state) => state.visualizer.settings)
    const palette = useAppSelector((state) => state.visualizer.colorPalette)

    if (!isAppChartType(chartType)) {
        return (
            <div className="flex flex-col gap-3 rounded border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex text-gray-600">
                        <IconInfo16 />
                    </span>
                    <div className="flex flex-col gap-2 text-sm text-gray-800">
                        <p className="m-0 font-semibold">
                            {i18n.t('{{type}} is drawn by DHIS2', {
                                type: chartTypeLabel(chartType),
                                interpolation: { escapeValue: false },
                            })}
                        </p>
                        <p className="m-0">
                            {i18n.t(
                                'Its colors, values, axes and legend are set in Options, above the chart. It looks the same here, on dashboards and in DHIS2.'
                            )}
                        </p>
                        <p className="m-0 text-gray-600">
                            {i18n.t(
                                'The Style tab is for Radial and Tree map, the chart types this app draws itself.'
                            )}
                        </p>
                    </div>
                </div>
                <div>
                    <Button small onClick={onOpenOptions}>
                        {i18n.t('Open options')}
                    </Button>
                </div>
            </div>
        )
    }

    const labels = settings.XAxisSettings
    const updateLabels = (patch: Partial<AxisSettings>) =>
        dispatch(actions.updateSettings({ XAxisSettings: { ...labels, ...patch } }))

    return (
        <div className="flex max-h-[640px] flex-col gap-3 overflow-y-auto">
            <p className="m-0 text-xs text-gray-600">
                {i18n.t('Style of the {{type}} chart.', {
                    type: chartTypeLabel(chartType),
                    interpolation: { escapeValue: false },
                })}
            </p>
            <Section
                title={i18n.t('Series colors')}
                hint={i18n.t('Each data item keeps its color, in the order of the palette.')}
            >
                <ColorPalettePicker
                    value={palette}
                    onChange={(next) => dispatch(actions.setColorPalette(next))}
                />
            </Section>
            <Section title={i18n.t('Labels')}>
                <div className="flex items-end gap-3">
                    <ColorField
                        label={i18n.t('Color')}
                        value={labels.color}
                        onChange={(color) => updateLabels({ color })}
                    />
                    <InputField
                        dense
                        type="number"
                        min="8"
                        max="24"
                        inputWidth="80px"
                        label={i18n.t('Size')}
                        value={String(labels.fontSize)}
                        onChange={({ value }) =>
                            updateLabels({ fontSize: Number(value) || labels.fontSize })
                        }
                    />
                </div>
            </Section>
            <Section title={i18n.t('Background')}>
                <ColorField
                    label={i18n.t('Background color')}
                    value={settings.backgroundColor}
                    onChange={(backgroundColor) =>
                        dispatch(actions.updateSettings({ backgroundColor }))
                    }
                />
            </Section>
        </div>
    )
}
