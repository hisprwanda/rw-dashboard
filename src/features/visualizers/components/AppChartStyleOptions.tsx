import i18n from '@dhis2/d2-i18n'
import { InputField } from '@dhis2/ui'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { chartTypeLabel, type AxisSettings } from '@/features/charts'
import { ColorField } from '@/shared/components'
import { visualizerActions as actions } from '../store/visualizerSlice'
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

/**
 * The options of the chart types the app draws itself (Radial, Tree map): series colors,
 * labels and background. DHIS2 chart types have the Data Visualizer options instead.
 */
export const AppChartStyleOptions = () => {
    const dispatch = useAppDispatch()
    const chartType = useAppSelector((state) => state.visualizer.chartType)
    const settings = useAppSelector((state) => state.visualizer.settings)
    const palette = useAppSelector((state) => state.visualizer.colorPalette)

    const labels = settings.XAxisSettings
    const updateLabels = (patch: Partial<AxisSettings>) =>
        dispatch(actions.updateSettings({ XAxisSettings: { ...labels, ...patch } }))

    return (
        <div className="flex flex-col gap-3">
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
