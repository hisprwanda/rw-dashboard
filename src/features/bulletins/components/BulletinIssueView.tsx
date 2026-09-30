import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
    Tag,
} from '@dhis2/ui'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { useMe, useUserLocale } from '@/features/auth'
import { useDataSourceInstance } from '@/features/data-sources'
import {
    lastCompletePeriod,
    periodRange,
    useSystemCalendar,
    type PeriodType,
} from '@/features/periods'
import { ErrorState, LoadingState } from '@/shared/components'
import { formatDateTime } from '@/shared/utils/format'
import { useBulletinIssue, useSaveBulletinIssue } from '../hooks/useBulletinIssue'
import { useBulletinTemplate } from '../hooks/useBulletinTemplates'
import type { BulletinContext, BulletinIssue, OutbreakRow } from '../types/bulletin.types'
import { withText } from '../utils/localizedText'
import { BulletinSectionView } from './BulletinSectionView'
import { IssuePeriodSelect } from './IssuePeriodSelect'

interface BulletinIssueViewProps {
    templateId: string
    /** Period from the URL; defaults to the last complete period. */
    periodId?: string
}

/** One period of a bulletin: computed sections plus the author's notes and tables. */
export const BulletinIssueView = ({ templateId, periodId }: BulletinIssueViewProps) => {
    const navigate = useNavigate()
    const calendar = useSystemCalendar()
    const locale = useUserLocale()
    const { data: me } = useMe()
    const template = useBulletinTemplate(templateId)
    const source = useDataSourceInstance(template.data?.dataSourceId)
    const period =
        periodId ??
        (template.data
            ? lastCompletePeriod(template.data.periodType as PeriodType, calendar)
            : undefined)
    const issue = useBulletinIssue(templateId, period)
    const save = useSaveBulletinIssue()

    const languages = template.data?.languages ?? []
    const base = locale.split(/[-_]/)[0] ?? locale
    const [language, setLanguage] = useState<string>()
    const contentLanguage =
        language ??
        (languages.includes(locale) ? locale : languages.includes(base) ? base : languages[0]) ??
        'en'

    // The author's edits, reset whenever another period (or its saved issue) loads.
    const [notes, setNotes] = useState<BulletinIssue['notes']>({})
    const [outbreaks, setOutbreaks] = useState<BulletinIssue['outbreaks']>({})
    const [dirty, setDirty] = useState(false)
    useEffect(() => {
        setNotes(issue.data?.notes ?? {})
        setOutbreaks(issue.data?.outbreaks ?? {})
        setDirty(false)
    }, [issue.data, period])

    const range = useMemo(
        () => (period ? periodRange(period, calendar, locale) : null),
        [period, calendar, locale]
    )

    if (template.isLoading || source.isLoading) return <LoadingState />
    if (template.error || !template.data) return <ErrorState error={template.error} />
    if (source.notFound || !source.instance) {
        return (
            <div className="p-6">
                <NoticeBox error title={i18n.t('Data source not available')}>
                    {i18n.t(
                        'The data source of this bulletin was deleted or is not shared with you.'
                    )}
                </NoticeBox>
            </div>
        )
    }
    if (!period || !range) {
        return (
            <div className="p-6">
                <NoticeBox warning title={i18n.t('Pick a period')}>
                    {i18n.t('This bulletin needs a fixed period of its period type.')}
                </NoticeBox>
            </div>
        )
    }

    const context: BulletinContext = {
        templateId,
        instance: source.instance,
        periodId: period,
        range: { startDate: range.startDate, endDate: range.endDate },
        periodName: range.displayName,
        calendar,
        language: contentLanguage,
        languages,
        orgUnits: template.data.orgUnits,
    }

    const persist = (status: BulletinIssue['status']) => {
        if (!me) return
        save.mutate(
            {
                templateId,
                periodId: period,
                status,
                notes,
                outbreaks,
                updatedBy: { id: me.id, name: me.displayName ?? me.name ?? '' },
                updatedAt: Date.now(),
                publishedAt: status === 'published' ? Date.now() : issue.data?.publishedAt,
            },
            { onSuccess: () => setDirty(false) }
        )
    }

    const status = issue.data?.status

    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="no-print flex flex-wrap items-end justify-between gap-3 rounded bg-white p-3 shadow">
                <div className="flex flex-wrap items-end gap-3">
                    <IssuePeriodSelect
                        key={period}
                        periodType={template.data.periodType}
                        value={period}
                        onChange={(next) => navigate(paths.bulletinIssue(templateId, next))}
                    />
                    {languages.length > 1 && (
                        <div className="w-40">
                            <SingleSelectField
                                dense
                                label={i18n.t('Content language')}
                                selected={contentLanguage}
                                onChange={({ selected }) => setLanguage(selected)}
                            >
                                {languages.map((code) => (
                                    <SingleSelectOption key={code} value={code} label={code} />
                                ))}
                            </SingleSelectField>
                        </div>
                    )}
                    {status && (
                        <Tag positive={status === 'published'}>
                            {status === 'published' ? i18n.t('Published') : i18n.t('Draft')}
                        </Tag>
                    )}
                    {issue.data && (
                        <span className="text-xs text-gray-500">
                            {i18n.t('Saved by {{name}} on {{date}}', {
                                name: issue.data.updatedBy.name,
                                date: formatDateTime(issue.data.updatedAt),
                            })}
                        </span>
                    )}
                </div>
                <ButtonStrip end>
                    <Button small onClick={() => navigate(paths.editBulletin(templateId))}>
                        {i18n.t('Edit bulletin')}
                    </Button>
                    <Button small onClick={() => window.print()}>
                        {i18n.t('Print / PDF')}
                    </Button>
                    <Button
                        small
                        loading={save.isPending}
                        disabled={!dirty}
                        onClick={() => persist('draft')}
                    >
                        {i18n.t('Save draft')}
                    </Button>
                    <Button
                        small
                        primary
                        loading={save.isPending}
                        onClick={() => persist('published')}
                    >
                        {i18n.t('Publish')}
                    </Button>
                </ButtonStrip>
            </div>

            <article className="bulletin mx-auto w-full max-w-4xl rounded bg-white p-6 shadow print:shadow-none">
                {issue.isLoading ? (
                    <LoadingState />
                ) : (
                    template.data.sections.map((section) => (
                        <BulletinSectionView
                            key={section.id}
                            section={section}
                            context={context}
                            editing={{
                                editable: true,
                                notes,
                                outbreaks,
                                onNotesChange: (sectionId, value) => {
                                    setNotes((all) => ({
                                        ...all,
                                        [sectionId]: withText(
                                            all[sectionId],
                                            contentLanguage,
                                            value
                                        ),
                                    }))
                                    setDirty(true)
                                },
                                onOutbreaksChange: (sectionId, rows: OutbreakRow[]) => {
                                    setOutbreaks((all) => ({ ...all, [sectionId]: rows }))
                                    setDirty(true)
                                },
                            }}
                        />
                    ))
                )}
                {!template.data.sections.length && (
                    <p className="text-center text-gray-500">
                        {i18n.t('This bulletin has no sections yet. Edit it to add some.')}
                    </p>
                )}
            </article>
        </div>
    )
}
