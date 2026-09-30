import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    IconArrowDown16,
    IconArrowUp16,
    IconDelete16,
    InputField,
    MultiSelectField,
    MultiSelectOption,
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
    Tab,
    TabBar,
    TextAreaField,
} from '@dhis2/ui'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import type { SelectedDataSource } from '@/features/analytics'
import { useMe, useUserLocale } from '@/features/auth'
import { CURRENT_INSTANCE_ID, DataSourceSelect, useDataSources } from '@/features/data-sources'
import {
    FIXED_PERIOD_TYPES,
    lastCompletePeriod,
    periodRange,
    periodTypeLabel,
    useSystemCalendar,
    type PeriodType,
} from '@/features/periods'
import { useApplicationTitle } from '@/features/system'
import { ErrorState, LoadingState } from '@/shared/components'
import { useBulletinTemplate, useSaveBulletinTemplate } from '../hooks/useBulletinTemplates'
import { useUiLocales } from '../hooks/useBulletinMetadata'
import { bulletinTemplateSchema } from '../schemas/bulletinTemplateSchema'
import type {
    BulletinContext,
    BulletinSection,
    BulletinSectionType,
    BulletinTemplate,
} from '../types/bulletin.types'
import { pickText } from '../utils/localizedText'
import { move, newSection, SECTION_TYPES, sectionTypeLabel } from '../utils/newSection'
import { newTemplate } from '../utils/newTemplate'
import { BulletinSectionView } from './BulletinSectionView'
import { OrgUnitsModal } from './OrgUnitsModal'
import { SectionEditor } from './SectionEditor'

interface BulletinTemplateEditorProps {
    /** Template to edit; omitted to create a new one. */
    templateId?: string
}

const orgUnitsSummary = (template: BulletinTemplate) => {
    const { orgUnits } = template
    if (orgUnits.useCurrentUserOrgUnits) return i18n.t("The user's org units")
    return i18n.t('{{units}} org units, {{levels}} levels, {{groups}} groups', {
        units: orgUnits.orgUnitIds.length,
        levels: orgUnits.levelIds.length,
        groups: orgUnits.groupIds.length,
    })
}

/** Design a bulletin: settings, ordered sections and their data, with a live preview. */
export const BulletinTemplateEditor = ({ templateId }: BulletinTemplateEditorProps) => {
    const navigate = useNavigate()
    const { data: me } = useMe()
    const locale = useUserLocale()
    const calendar = useSystemCalendar()
    const applicationTitle = useApplicationTitle()
    const saved = useBulletinTemplate(templateId)
    const dataSources = useDataSources()
    const uiLocales = useUiLocales()
    const save = useSaveBulletinTemplate()
    const [draft, setDraft] = useState<BulletinTemplate | null>(null)
    const [selectedId, setSelectedId] = useState<string>()
    const [tab, setTab] = useState<'design' | 'preview'>('design')
    const [newType, setNewType] = useState<BulletinSectionType>('text')
    const [editingOrgUnits, setEditingOrgUnits] = useState(false)
    const [errors, setErrors] = useState<string[]>([])

    // Load the saved template, or start a new one, once.
    useEffect(() => {
        if (draft) return
        if (templateId && saved.data) setDraft(saved.data)
        if (!templateId && me) {
            setDraft(
                newTemplate(
                    '',
                    locale.split(/[-_]/)[0] ?? 'en',
                    {
                        id: me.id,
                        name: me.displayName ?? me.name ?? '',
                    },
                    Date.now()
                )
            )
        }
    }, [draft, templateId, saved.data, me, locale])

    if (saved.error) return <ErrorState error={saved.error} />
    if (!draft) return <LoadingState />

    const update = (patch: Partial<BulletinTemplate>) => setDraft({ ...draft, ...patch })
    const setSections = (sections: BulletinSection[]) => update({ sections })
    const isCurrent = draft.dataSourceId === CURRENT_INSTANCE_ID
    const external = dataSources.data?.find((entry) => entry.key === draft.dataSourceId)?.value
    const dataSource: SelectedDataSource | undefined = isCurrent
        ? { isCurrentInstance: true, instanceName: applicationTitle }
        : external
    const selected =
        draft.sections.find((section) => section.id === selectedId) ?? draft.sections[0]
    const language = draft.languages[0] ?? 'en'

    const onSave = () => {
        const result = bulletinTemplateSchema.safeParse(draft)
        if (!result.success) {
            setErrors(
                result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            )
            return
        }
        setErrors([])
        const author = me ? { id: me.id, name: me.displayName ?? me.name ?? '' } : draft.updatedBy
        save.mutate(
            {
                key: templateId,
                template: {
                    ...draft,
                    name: draft.name.trim(),
                    updatedBy: author,
                    updatedAt: Date.now(),
                },
            },
            {
                onSuccess: ({ key }) => {
                    if (!templateId) navigate(paths.editBulletin(key), { replace: true })
                },
            }
        )
    }

    const previewPeriod = lastCompletePeriod(draft.periodType as PeriodType, calendar)
    const previewRange = previewPeriod ? periodRange(previewPeriod, calendar, locale) : null
    const previewContext: BulletinContext | null =
        dataSource && previewPeriod && previewRange
            ? {
                  templateId: draft.id,
                  instance: dataSource,
                  periodId: previewPeriod,
                  range: { startDate: previewRange.startDate, endDate: previewRange.endDate },
                  periodName: previewRange.displayName,
                  calendar,
                  language: draft.languages.includes(locale) ? locale : language,
                  languages: draft.languages,
                  orgUnits: draft.orgUnits,
              }
            : null

    const languageOptions = uiLocales.data ?? [
        { locale: 'en', name: 'English' },
        { locale: 'fr', name: 'French' },
    ]

    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="m-0 text-xl font-semibold">
                    {templateId ? i18n.t('Edit bulletin') : i18n.t('New bulletin')}
                </h1>
                <ButtonStrip end>
                    <Button onClick={() => navigate(paths.bulletins)}>
                        {i18n.t('Back to list')}
                    </Button>
                    {templateId && (
                        <Button onClick={() => navigate(paths.bulletinIssue(templateId))}>
                            {i18n.t('Open bulletin')}
                        </Button>
                    )}
                    <Button primary loading={save.isPending} onClick={onSave}>
                        {i18n.t('Save')}
                    </Button>
                </ButtonStrip>
            </div>
            {errors.length > 0 && (
                <NoticeBox error title={i18n.t('The bulletin cannot be saved yet')}>
                    <ul className="m-0 pl-4">
                        {errors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                </NoticeBox>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
                <aside className="flex flex-col gap-4">
                    <section className="flex flex-col gap-3 rounded bg-white p-4 shadow">
                        <InputField
                            dense
                            required
                            label={i18n.t('Name')}
                            value={draft.name}
                            onChange={({ value }) => update({ name: value ?? '' })}
                        />
                        <TextAreaField
                            dense
                            rows={2}
                            label={i18n.t('Description')}
                            value={draft.description}
                            onChange={({ value }) => update({ description: value ?? '' })}
                        />
                        <DataSourceSelect
                            value={draft.dataSourceId}
                            onChange={(id) => update({ dataSourceId: id })}
                        />
                        <SingleSelectField
                            dense
                            label={i18n.t('Period type')}
                            selected={draft.periodType}
                            onChange={({ selected: periodType }) => update({ periodType })}
                        >
                            {FIXED_PERIOD_TYPES.map((type) => (
                                <SingleSelectOption
                                    key={type}
                                    value={type}
                                    label={periodTypeLabel(type)}
                                />
                            ))}
                        </SingleSelectField>
                        <MultiSelectField
                            dense
                            filterable
                            noMatchText={i18n.t('No match')}
                            label={i18n.t('Content languages')}
                            helpText={i18n.t(
                                'Texts are written in each language; the first is the fallback.'
                            )}
                            loading={uiLocales.isLoading}
                            selected={draft.languages}
                            onChange={({ selected: languages }) =>
                                languages.length && update({ languages })
                            }
                        >
                            {[
                                ...draft.languages
                                    .filter(
                                        (code) => !languageOptions.some((l) => l.locale === code)
                                    )
                                    .map((code) => ({ locale: code, name: code })),
                                ...languageOptions,
                            ].map((option) => (
                                <MultiSelectOption
                                    key={option.locale}
                                    value={option.locale}
                                    label={option.name}
                                />
                            ))}
                        </MultiSelectField>
                        <div>
                            <p className="mb-1 mt-0 text-sm">{i18n.t('Organisation units')}</p>
                            <p className="mb-2 mt-0 text-sm text-gray-600">
                                {orgUnitsSummary(draft)}
                            </p>
                            <Button
                                small
                                disabled={!dataSource}
                                onClick={() => setEditingOrgUnits(true)}
                            >
                                {i18n.t('Choose org units')}
                            </Button>
                        </div>
                    </section>

                    <section className="flex flex-col gap-2 rounded bg-white p-4 shadow">
                        <h2 className="m-0 text-base font-semibold">{i18n.t('Sections')}</h2>
                        <ol className="m-0 flex list-none flex-col gap-1 p-0">
                            {draft.sections.map((section, index) => (
                                <li
                                    key={section.id}
                                    className={`flex items-center gap-1 rounded border px-2 py-1 ${
                                        section.id === selected?.id
                                            ? 'border-blue-400 bg-blue-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        className="flex-1 truncate border-0 bg-transparent p-1 text-left text-sm"
                                        onClick={() => {
                                            setSelectedId(section.id)
                                            setTab('design')
                                        }}
                                    >
                                        <span className="block font-medium">
                                            {pickText(section.title, locale, draft.languages) ||
                                                sectionTypeLabel(section.type)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {sectionTypeLabel(section.type)}
                                        </span>
                                    </button>
                                    <Button
                                        small
                                        secondary
                                        icon={<IconArrowUp16 />}
                                        aria-label={i18n.t('Move up')}
                                        disabled={index === 0}
                                        onClick={() => setSections(move(draft.sections, index, -1))}
                                    />
                                    <Button
                                        small
                                        secondary
                                        icon={<IconArrowDown16 />}
                                        aria-label={i18n.t('Move down')}
                                        disabled={index === draft.sections.length - 1}
                                        onClick={() => setSections(move(draft.sections, index, 1))}
                                    />
                                    <Button
                                        small
                                        secondary
                                        destructive
                                        icon={<IconDelete16 />}
                                        aria-label={i18n.t('Remove section')}
                                        onClick={() =>
                                            setSections(
                                                draft.sections.filter((s) => s.id !== section.id)
                                            )
                                        }
                                    />
                                </li>
                            ))}
                        </ol>
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <SingleSelectField
                                    dense
                                    label={i18n.t('New section')}
                                    selected={newType}
                                    onChange={({ selected: type }) =>
                                        setNewType(type as BulletinSectionType)
                                    }
                                >
                                    {SECTION_TYPES.map((type) => (
                                        <SingleSelectOption
                                            key={type}
                                            value={type}
                                            label={sectionTypeLabel(type)}
                                        />
                                    ))}
                                </SingleSelectField>
                            </div>
                            <Button
                                small
                                onClick={() => {
                                    const section = newSection(newType)
                                    setSections([...draft.sections, section])
                                    setSelectedId(section.id)
                                    setTab('design')
                                }}
                            >
                                {i18n.t('Add')}
                            </Button>
                        </div>
                    </section>
                </aside>

                <main className="min-w-0 rounded bg-white p-4 shadow">
                    <TabBar>
                        <Tab selected={tab === 'design'} onClick={() => setTab('design')}>
                            {i18n.t('Section settings')}
                        </Tab>
                        <Tab selected={tab === 'preview'} onClick={() => setTab('preview')}>
                            {i18n.t('Preview')}
                        </Tab>
                    </TabBar>
                    <div className="pt-4">
                        {!dataSource && (
                            <NoticeBox warning title={i18n.t('Data source not available')}>
                                {i18n.t(
                                    'Pick a data source to configure and preview the sections.'
                                )}
                            </NoticeBox>
                        )}
                        {tab === 'design' &&
                            dataSource &&
                            (selected ? (
                                <SectionEditor
                                    key={selected.id}
                                    section={selected}
                                    onChange={(next) =>
                                        setSections(
                                            draft.sections.map((s) => (s.id === next.id ? next : s))
                                        )
                                    }
                                    languages={draft.languages}
                                    instance={dataSource}
                                    dataSourceId={draft.dataSourceId}
                                    dataSource={dataSource}
                                />
                            ) : (
                                <p className="text-gray-600">{i18n.t('Add a section to start.')}</p>
                            ))}
                        {tab === 'preview' && previewContext && (
                            <article className="bulletin mx-auto max-w-4xl">
                                <p className="mt-0 text-sm text-gray-500">
                                    {i18n.t('Preview for {{period}} (not saved).', {
                                        period: previewContext.periodName,
                                    })}
                                </p>
                                {draft.sections.map((section) => (
                                    <BulletinSectionView
                                        key={section.id}
                                        section={section}
                                        context={previewContext}
                                        editing={{
                                            editable: false,
                                            notes: {},
                                            outbreaks: {},
                                            onNotesChange: () => undefined,
                                            onOutbreaksChange: () => undefined,
                                        }}
                                    />
                                ))}
                            </article>
                        )}
                    </div>
                </main>
            </div>
            {editingOrgUnits && dataSource && (
                <OrgUnitsModal
                    instance={dataSource}
                    value={draft.orgUnits}
                    onChange={(orgUnits) => update({ orgUnits })}
                    onClose={() => setEditingOrgUnits(false)}
                />
            )}
        </div>
    )
}
