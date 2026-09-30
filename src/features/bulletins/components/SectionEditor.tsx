import i18n from '@dhis2/d2-i18n'
import {
    Button,
    InputField,
    MultiSelectField,
    MultiSelectOption,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useState, type ChangeEvent } from 'react'
import type { SelectedDataSource } from '@/features/analytics'
import { chartRegistry, chartTypeLabel, type ChartType } from '@/features/charts'
import { useOrgUnitMetadata } from '@/features/org-units'
import type { InstanceConnection } from '@/shared/api'
import { generateUid } from '@/shared/utils/uid'
import { useDataSets, usePrograms, useProgramFields } from '../hooks/useBulletinMetadata'
import type {
    BulletinSection,
    CaseCategory,
    CompletenessSection,
    CoverSection,
    EventSignalsSection,
    IndicatorTrendsSection,
    OutbreaksSection,
    TrackerCasesSection,
} from '../types/bulletin.types'
import { BulletinDataItemsModal } from './BulletinDataItemsModal'
import { LocalizedTextField } from './LocalizedTextField'
import { RefSelect } from './RefSelect'

/** Logos are stored inside the template: keep them small. */
export const MAX_LOGO_BYTES = 200 * 1024

interface FormProps<T extends BulletinSection> {
    section: T
    onChange: (section: T) => void
    languages: string[]
    instance: InstanceConnection
    dataSourceId: string
    dataSource: SelectedDataSource
}

const NumberField = ({
    label,
    value,
    min,
    max,
    onChange,
    helpText,
}: {
    label: string
    value: number
    min: number
    max: number
    onChange: (value: number) => void
    helpText?: string
}) => (
    <InputField
        dense
        type="number"
        inputWidth="120px"
        min={String(min)}
        max={String(max)}
        label={label}
        helpText={helpText}
        value={String(value)}
        onChange={({ value: next }) => {
            const number = Number(next)
            if (Number.isFinite(number)) onChange(Math.min(Math.max(Math.round(number), min), max))
        }}
    />
)

const CoverForm = ({ section, onChange, languages }: FormProps<CoverSection>) => {
    const [error, setError] = useState<string | null>(null)
    const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        if (file.size > MAX_LOGO_BYTES) {
            setError(i18n.t('Logos must be smaller than 200 KB.'))
            return
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(file)
        })
        setError(null)
        onChange({ ...section, logos: [...section.logos, dataUrl] })
    }
    return (
        <>
            <LocalizedTextField
                label={i18n.t('Subtitle')}
                languages={languages}
                value={section.subtitle}
                onChange={(subtitle) => onChange({ ...section, subtitle })}
            />
            <div>
                <p className="mb-1 mt-0 text-sm">{i18n.t('Logos')}</p>
                <div className="flex flex-wrap items-center gap-3">
                    {section.logos.map((logo, index) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                            <img src={logo} alt="" className="max-h-16 max-w-[160px] border" />
                            <Button
                                small
                                secondary
                                destructive
                                onClick={() =>
                                    onChange({
                                        ...section,
                                        logos: section.logos.filter((_, i) => i !== index),
                                    })
                                }
                            >
                                {i18n.t('Remove')}
                            </Button>
                        </div>
                    ))}
                    <label className="cursor-pointer rounded border border-dashed border-gray-400 px-3 py-2 text-sm">
                        {i18n.t('Add logo')}
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml"
                            className="hidden"
                            onChange={(event) => void onFile(event)}
                        />
                    </label>
                </div>
                {error && <p className="text-sm text-red-700">{error}</p>}
            </div>
        </>
    )
}

const TrendsForm = ({
    section,
    onChange,
    dataSourceId,
    dataSource,
}: FormProps<IndicatorTrendsSection>) => {
    const [picking, setPicking] = useState(false)
    return (
        <>
            <div>
                <p className="mb-1 mt-0 text-sm">{i18n.t('Data items (one chart each)')}</p>
                <ul className="m-0 mb-2 list-disc pl-6 text-sm">
                    {section.dataItems.map((item) => (
                        <li key={item.id}>{item.label}</li>
                    ))}
                </ul>
                <Button small onClick={() => setPicking(true)}>
                    {section.dataItems.length
                        ? i18n.t('Change data items')
                        : i18n.t('Choose data items')}
                </Button>
            </div>
            <NumberField
                label={i18n.t('Previous periods shown')}
                helpText={i18n.t(
                    'The chart shows the bulletin period and this many periods before it.'
                )}
                value={section.lookback}
                min={0}
                max={104}
                onChange={(lookback) => onChange({ ...section, lookback })}
            />
            <SingleSelectField
                dense
                label={i18n.t('Chart type')}
                selected={section.chartType}
                onChange={({ selected }) =>
                    onChange({ ...section, chartType: selected as ChartType })
                }
            >
                {chartRegistry.map((chart) => (
                    <SingleSelectOption
                        key={chart.type}
                        value={chart.type}
                        label={chartTypeLabel(chart.type)}
                    />
                ))}
            </SingleSelectField>
            {picking && (
                <BulletinDataItemsModal
                    dataSourceId={dataSourceId}
                    dataSource={dataSource}
                    value={section.dataItems}
                    onChange={(dataItems) => onChange({ ...section, dataItems })}
                    onClose={() => setPicking(false)}
                />
            )}
        </>
    )
}

const categoryLabel = (category: CaseCategory) =>
    ({
        case: i18n.t('Case'),
        death: i18n.t('Death'),
        publicEvent: i18n.t('Public health event'),
    })[category]

const TrackerCasesForm = ({ section, onChange, instance }: FormProps<TrackerCasesSection>) => {
    const programs = usePrograms(instance, 'WITH_REGISTRATION')
    const fields = useProgramFields(instance, section.program?.id)
    return (
        <>
            <RefSelect
                label={i18n.t('Tracker program')}
                required
                options={programs.data}
                loading={programs.isLoading}
                error={!!programs.error}
                value={section.program}
                onChange={(program) => onChange({ ...section, program, groupBy: null })}
            />
            <RefSelect
                label={i18n.t('Group by attribute')}
                required
                helpText={i18n.t('The attribute holding the disease or event type.')}
                options={fields.data?.attributes}
                loading={fields.isLoading}
                error={!!fields.error}
                value={section.groupBy}
                onChange={(groupBy) => onChange({ ...section, groupBy })}
            />
            <div>
                <p className="mb-1 mt-0 text-sm">{i18n.t('Classification rules')}</p>
                <p className="mb-2 mt-0 text-xs text-gray-600">
                    {i18n.t(
                        'Values containing the text are classified in the category. Values matching no rule are cases.'
                    )}
                </p>
                {section.rules.map((rule, index) => (
                    <div key={index} className="mb-2 flex items-end gap-2">
                        <InputField
                            dense
                            label={i18n.t('Text contained in the value')}
                            value={rule.match}
                            onChange={({ value }) =>
                                onChange({
                                    ...section,
                                    rules: section.rules.map((r, i) =>
                                        i === index ? { ...r, match: value ?? '' } : r
                                    ),
                                })
                            }
                        />
                        <div className="w-52">
                            <SingleSelectField
                                dense
                                label={i18n.t('Category')}
                                selected={rule.category}
                                onChange={({ selected }) =>
                                    onChange({
                                        ...section,
                                        rules: section.rules.map((r, i) =>
                                            i === index
                                                ? { ...r, category: selected as CaseCategory }
                                                : r
                                        ),
                                    })
                                }
                            >
                                {(['case', 'death', 'publicEvent'] as const).map((category) => (
                                    <SingleSelectOption
                                        key={category}
                                        value={category}
                                        label={categoryLabel(category)}
                                    />
                                ))}
                            </SingleSelectField>
                        </div>
                        <Button
                            small
                            secondary
                            destructive
                            onClick={() =>
                                onChange({
                                    ...section,
                                    rules: section.rules.filter((_, i) => i !== index),
                                })
                            }
                        >
                            {i18n.t('Remove')}
                        </Button>
                    </div>
                ))}
                <Button
                    small
                    onClick={() =>
                        onChange({
                            ...section,
                            rules: [...section.rules, { match: '', category: 'death' }],
                        })
                    }
                >
                    {i18n.t('Add rule')}
                </Button>
            </div>
        </>
    )
}

const EventSignalsForm = ({ section, onChange, instance }: FormProps<EventSignalsSection>) => {
    const programs = usePrograms(instance)
    const fields = useProgramFields(instance, section.program?.id)
    const elementSelect = (
        key: 'codeElement' | 'locationElement' | 'countElement',
        label: string,
        helpText: string,
        required = false
    ) => (
        <RefSelect
            label={label}
            helpText={helpText}
            required={required}
            options={fields.data?.dataElements}
            loading={fields.isLoading}
            error={!!fields.error}
            value={section[key]}
            onChange={(value) => onChange({ ...section, [key]: value })}
        />
    )
    return (
        <>
            <RefSelect
                label={i18n.t('Program')}
                required
                options={programs.data}
                loading={programs.isLoading}
                error={!!programs.error}
                value={section.program}
                onChange={(program) =>
                    onChange({
                        ...section,
                        program,
                        codeElement: null,
                        locationElement: null,
                        countElement: null,
                    })
                }
            />
            {elementSelect(
                'codeElement',
                i18n.t('Signal data element'),
                i18n.t('Events are grouped by its value.'),
                true
            )}
            {elementSelect(
                'locationElement',
                i18n.t('Location data element'),
                i18n.t('Optional: also group by this value.')
            )}
            {elementSelect(
                'countElement',
                i18n.t('Count data element'),
                i18n.t('Optional: sum this number instead of counting events.')
            )}
        </>
    )
}

const CompletenessForm = ({ section, onChange, instance }: FormProps<CompletenessSection>) => {
    const dataSets = useDataSets(instance)
    const metadata = useOrgUnitMetadata(instance)
    const levels = metadata.data?.orgUnitLevels.organisationUnitLevels ?? []
    return (
        <>
            <MultiSelectField
                dense
                filterable
                noMatchText={i18n.t('No match')}
                label={i18n.t('Data sets')}
                loading={dataSets.isLoading}
                selected={section.dataSets.map((dataSet) => dataSet.id)}
                onChange={({ selected }) =>
                    onChange({
                        ...section,
                        dataSets: selected.flatMap((id) => {
                            const found =
                                dataSets.data?.find((d) => d.id === id) ??
                                section.dataSets.find((d) => d.id === id)
                            return found ? [found] : []
                        }),
                    })
                }
            >
                {[
                    ...section.dataSets.filter((d) => !dataSets.data?.some((o) => o.id === d.id)),
                    ...(dataSets.data ?? []),
                ].map((dataSet) => (
                    <MultiSelectOption key={dataSet.id} value={dataSet.id} label={dataSet.name} />
                ))}
            </MultiSelectField>
            <SingleSelectField
                dense
                label={i18n.t('Rows: org unit level')}
                loading={metadata.isLoading}
                selected={
                    levels.some((l) => l.level === section.orgUnitLevel)
                        ? String(section.orgUnitLevel)
                        : undefined
                }
                onChange={({ selected }) =>
                    onChange({ ...section, orgUnitLevel: Number(selected) })
                }
            >
                {levels.map((level) => (
                    <SingleSelectOption
                        key={level.id}
                        value={String(level.level)}
                        label={level.displayName ?? level.name ?? String(level.level)}
                    />
                ))}
            </SingleSelectField>
            <NumberField
                label={i18n.t('Previous periods shown')}
                value={section.lookback}
                min={0}
                max={52}
                onChange={(lookback) => onChange({ ...section, lookback })}
            />
            <div className="flex gap-3">
                <NumberField
                    label={i18n.t('Good from (%)')}
                    value={section.thresholds.good}
                    min={0}
                    max={100}
                    onChange={(good) =>
                        onChange({ ...section, thresholds: { ...section.thresholds, good } })
                    }
                />
                <NumberField
                    label={i18n.t('Fair from (%)')}
                    value={section.thresholds.fair}
                    min={0}
                    max={100}
                    onChange={(fair) =>
                        onChange({ ...section, thresholds: { ...section.thresholds, fair } })
                    }
                />
            </div>
        </>
    )
}

const OutbreaksForm = ({ section, onChange, languages }: FormProps<OutbreaksSection>) => (
    <div>
        <p className="mb-1 mt-0 text-sm">{i18n.t('Columns')}</p>
        {section.columns.map((column, index) => (
            <div key={column.id} className="mb-2 flex items-end gap-2">
                <div className="flex-1">
                    <LocalizedTextField
                        label={i18n.t('Column {{number}}', { number: index + 1 })}
                        languages={languages}
                        value={column.label}
                        onChange={(label) =>
                            onChange({
                                ...section,
                                columns: section.columns.map((c) =>
                                    c.id === column.id ? { ...c, label } : c
                                ),
                            })
                        }
                    />
                </div>
                <Button
                    small
                    secondary
                    destructive
                    onClick={() =>
                        onChange({
                            ...section,
                            columns: section.columns.filter((c) => c.id !== column.id),
                        })
                    }
                >
                    {i18n.t('Remove')}
                </Button>
            </div>
        ))}
        <Button
            small
            onClick={() =>
                onChange({
                    ...section,
                    columns: [...section.columns, { id: generateUid(), label: {} }],
                })
            }
        >
            {i18n.t('Add column')}
        </Button>
    </div>
)

/** Title, description and the settings of one section. */
export const SectionEditor = (props: FormProps<BulletinSection>) => {
    const { section, onChange, languages } = props
    const common = (
        <>
            <LocalizedTextField
                label={i18n.t('Title')}
                languages={languages}
                value={section.title}
                onChange={(title) => onChange({ ...section, title })}
            />
            {section.type !== 'text' && (
                <LocalizedTextField
                    multiline
                    label={i18n.t('Introduction')}
                    languages={languages}
                    value={section.description}
                    onChange={(description) => onChange({ ...section, description })}
                />
            )}
        </>
    )
    const specific = () => {
        switch (section.type) {
            case 'cover':
                return <CoverForm {...props} section={section} onChange={onChange} />
            case 'text':
                return (
                    <LocalizedTextField
                        multiline
                        label={i18n.t('Text')}
                        languages={languages}
                        value={section.body}
                        onChange={(body) => onChange({ ...section, body })}
                    />
                )
            case 'indicatorTrends':
                return <TrendsForm {...props} section={section} onChange={onChange} />
            case 'trackerCases':
                return <TrackerCasesForm {...props} section={section} onChange={onChange} />
            case 'eventSignals':
                return <EventSignalsForm {...props} section={section} onChange={onChange} />
            case 'completeness':
                return <CompletenessForm {...props} section={section} onChange={onChange} />
            case 'outbreaks':
                return <OutbreaksForm {...props} section={section} onChange={onChange} />
            case 'notes':
                return (
                    <p className="text-sm text-gray-600">
                        {i18n.t('The notes are written for each period in the bulletin itself.')}
                    </p>
                )
        }
    }
    return (
        <div className="flex flex-col gap-4">
            {common}
            {specific()}
        </div>
    )
}
