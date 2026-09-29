import i18n from '@dhis2/d2-i18n'
import { Button, InputField } from '@dhis2/ui'
import { useAppDispatch, useAppSelector } from '@/app/store'
import type { AxisSettings } from '@/features/charts'
import { visualizerActions as actions } from '../store/visualizerSlice'
import { ColorField } from '@/shared/components'
import { ColorPalettePicker } from './ColorPalettePicker'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="flex flex-col gap-2 border-b border-gray-200 pb-3">
        <h4 className="m-0 text-sm font-semibold text-gray-700">{title}</h4>
        {children}
    </section>
)

interface SettingsPanelProps {
    onEditTitles: () => void
}

/** Appearance of the visual: titles, colors, palette and axes. */
export const SettingsPanel = ({ onEditTitles }: SettingsPanelProps) => {
    const dispatch = useAppDispatch()
    const settings = useAppSelector((state) => state.visualizer.settings)
    const palette = useAppSelector((state) => state.visualizer.colorPalette)

    const axisFields = (key: 'XAxisSettings' | 'YAxisSettings') => {
        const axis = settings[key]
        const update = (patch: Partial<AxisSettings>) =>
            dispatch(actions.updateSettings({ [key]: { ...axis, ...patch } }))
        return (
            <div className="flex items-end gap-3">
                <ColorField
                    label={i18n.t('Color')}
                    value={axis.color}
                    onChange={(color) => update({ color })}
                />
                <InputField
                    dense
                    type="number"
                    min="6"
                    max="48"
                    inputWidth="80px"
                    label={i18n.t('Font size')}
                    value={String(axis.fontSize)}
                    onChange={({ value }) => update({ fontSize: Number(value) || axis.fontSize })}
                />
            </div>
        )
    }

    return (
        <div className="flex max-h-[640px] flex-col gap-3 overflow-y-auto">
            <Section title={i18n.t('Titles')}>
                <div>
                    <Button small onClick={onEditTitles}>
                        {i18n.t('Edit title and subtitle')}
                    </Button>
                </div>
            </Section>
            <Section title={i18n.t('Colors')}>
                <div className="flex gap-4">
                    <ColorField
                        label={i18n.t('Background')}
                        value={settings.backgroundColor}
                        onChange={(backgroundColor) =>
                            dispatch(actions.updateSettings({ backgroundColor }))
                        }
                    />
                    <ColorField
                        label={i18n.t('Fill')}
                        value={settings.fillColor}
                        onChange={(fillColor) => dispatch(actions.updateSettings({ fillColor }))}
                    />
                </div>
            </Section>
            <Section title={i18n.t('Color palette')}>
                <ColorPalettePicker
                    value={palette}
                    onChange={(next) => dispatch(actions.setColorPalette(next))}
                />
            </Section>
            <Section title={i18n.t('X axis')}>{axisFields('XAxisSettings')}</Section>
            <Section title={i18n.t('Y axis')}>{axisFields('YAxisSettings')}</Section>
        </div>
    )
}
