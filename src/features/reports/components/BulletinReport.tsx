import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import { DEFAULT_COLOR_PALETTE } from '@/features/charts'
import { periodRange, useSystemCalendar } from '@/features/periods'
import { ErrorState, LoadingState } from '@/shared/components'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import minisanteLogo from '../assets/minisante_logo.png'
import rbcLogo from '../assets/rbc_logo.png'
import { BULLETIN_DISEASES } from '../constants/bulletin'
import { useBulletinTemplate } from '../hooks/useBulletinTemplate'
import { useBulletinTracker } from '../hooks/useBulletinTracker'
import type { BulletinAlert } from '../types/bulletin.types'
import { diseaseSeries } from '../utils/diseaseSeries'
import { BulletinSection, MessageList } from './BulletinSection'
import { DeathsByFacilityTreemap, DeathsByTypePie } from './DeathsCharts'
import { DiseaseAreaChart } from './DiseaseAreaChart'
import { NotesField } from './NotesField'
import { CompletenessSampleTable, OutbreakSampleTable } from './SampleSections'

const isAlertList = (item: string | BulletinAlert[]): item is BulletinAlert[] => Array.isArray(item)

/** The weekly epidemiological bulletin for the first selected week. */
export const BulletinReport = ({ analytics }: { analytics: AnalyticsResponse }) => {
    const calendar = useSystemCalendar()
    const weekId = analytics.metaData?.dimensions?.pe?.[0] ?? ''
    const range = periodRange(weekId, calendar)
    const week = range?.displayName.match(/Week \d+/)?.[0] ?? range?.displayName ?? weekId
    const template = useBulletinTemplate()
    const tracker = useBulletinTracker(range)
    const t = template.data
    const s = tracker.data
    const noCases = i18n.t('No cases found.')

    if (template.isLoading || tracker.isLoading) return <LoadingState />
    if (template.error)
        return <ErrorState title={i18n.t('Bulletin template not found')} error={template.error} />
    if (!range) {
        return (
            <ErrorState
                title={i18n.t('Pick a week')}
                error={i18n.t('The bulletin needs a weekly period.')}
            />
        )
    }

    const colors = DEFAULT_COLOR_PALETTE.itemsBackgroundColors

    return (
        <article
            id="content-to-download"
            className="mx-auto mt-5 max-w-4xl rounded bg-white p-5 shadow"
        >
            {tracker.error && (
                <NoticeBox warning title={i18n.t('Tracker data could not be loaded')}>
                    {i18n.t(
                        'Alerts, immediate reportable diseases and deaths are missing from this bulletin.'
                    )}
                </NoticeBox>
            )}
            <h1 className="my-6 text-center text-3xl font-bold uppercase tracking-wide">
                {i18n.t('Epidemiological bulletin')}
            </h1>
            <header className="mb-5 flex justify-between">
                <img
                    className="w-72"
                    src={minisanteLogo}
                    alt={i18n.t('Republic of Rwanda Ministry of Health')}
                />
                <img className="w-72" src={rbcLogo} alt={i18n.t('Rwanda Biomedical Centre')} />
            </header>

            <div className="mb-5 mt-10 rounded p-5 text-center">
                <h2 className="text-5xl font-bold uppercase tracking-wide">
                    {t?.page1?.titles?.[0]}
                </h2>
                <h3>{week}</h3>
                <h3>
                    {range.startDate} - {range.endDate}
                </h3>
            </div>
            <div className="mb-5 rounded p-4 text-center">
                <h4 className="mb-2 text-xl font-bold">{t?.page1?.titles?.[1]}</h4>
                <p className="m-0 text-xl leading-relaxed">{t?.page1?.body_content?.[0]}</p>
                <p className="mb-8 mt-4 text-xl leading-relaxed">{t?.page1?.body_content?.[1]}</p>
                <p>
                    <strong>{t?.page1?.titles?.[2]}:</strong> {t?.page1?.body_content?.[2]}
                </p>
            </div>

            <BulletinSection title={t?.page2?.main_titles?.[0]}>
                <h3 className="mb-2 text-base font-bold">{t?.page2?.main_titles?.[1]}:</h3>
                <ul className="list-disc pl-4">
                    {!!s?.totalCommunityEvents && (
                        <li>
                            <strong>{t?.page2?.sub_titles?.[0]}:</strong> {s.totalCommunityEvents}{' '}
                            {i18n.t('alerts')}:{' '}
                            {s.communityAlerts.length ? s.communityAlerts.join(', ') : noCases}
                        </li>
                    )}
                    <li>
                        <strong>{t?.page2?.sub_titles?.[1]}:</strong>{' '}
                        {t?.page2?.body_content?.Alert_from_EIOS?.[0]}
                        <ul className="list-disc pl-6">
                            <li>{t?.page2?.body_content?.Alert_from_EIOS?.[1]}</li>
                            <li>{t?.page2?.body_content?.Alert_from_EIOS?.[2]}</li>
                        </ul>
                    </li>
                    {!!s?.totalEnrollments && (
                        <li>
                            <strong>{t?.page2?.sub_titles?.[2]}</strong>
                            <MessageList items={s.highlights} empty={noCases} />
                        </li>
                    )}
                    <li>
                        <strong>{t?.page2?.sub_titles?.[3]}</strong>
                        <MessageList
                            items={t?.page2?.body_content?.outbreaks_updates ?? []}
                            empty=""
                        />
                    </li>
                    <li>
                        <strong>{t?.page2?.sub_titles?.[4]}</strong>
                        <MessageList
                            items={t?.page2?.body_content?.completness?.slice(0, 1) ?? []}
                            empty=""
                        />
                    </li>
                </ul>
            </BulletinSection>

            <BulletinSection title={`${t?.page3?.main_titles?.[0] ?? ''} ${week}`}>
                <div className="mb-4">
                    <strong>{t?.page3?.main_titles?.[1]}:</strong>
                    {t?.page3?.body_content?.description?.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
                <h3 className="mb-4 font-bold">{t?.page3?.main_titles?.[2]}</h3>
                <ul className="list-disc pl-4">
                    {!!s?.totalCommunityEvents && (
                        <li>
                            <strong>{t?.page3?.sub_titles?.[0]}:</strong> {s.totalCommunityEvents}{' '}
                            {i18n.t('alerts')}
                            <MessageList items={s.communityMessages} empty={noCases} />
                        </li>
                    )}
                    <li>
                        <strong>{t?.page3?.sub_titles?.[1]}:</strong>{' '}
                        {typeof t?.page3?.body_content?.Alert_from_EIOS?.[0] === 'string'
                            ? t.page3.body_content.Alert_from_EIOS[0]
                            : null}
                        <ul className="list-disc pl-6">
                            {t?.page3?.body_content?.Alert_from_EIOS?.filter(isAlertList)
                                .flat()
                                .map((alert, index) => (
                                    <li key={index} className="text-gray-800">
                                        <h4 className="m-0 font-semibold">{alert.title}</h4>
                                        <p className="m-0">{alert.content}</p>
                                    </li>
                                ))}
                        </ul>
                    </li>
                </ul>
            </BulletinSection>

            {!!s?.totalEnrollments && (
                <BulletinSection title={t?.page4?.main_titles?.[0]}>
                    <p>
                        <strong>{t?.page4?.sub_titles?.[0]}: </strong>
                        {t?.page4?.body_content?.description}
                    </p>
                    <h3 className="my-4 text-center font-bold">
                        {i18n.t('IMMEDIATE REPORTABLE DISEASES – EPI {{week}}', { week })}
                    </h3>
                    <p>
                        {i18n.t(
                            'During this Epi week, {{count}} cases of immediate reportable diseases were notified:',
                            { count: s.totalEnrollments }
                        )}
                    </p>
                    <MessageList items={s.diseaseMessages} empty={noCases} />
                    <h3 className="my-4 font-bold">{t?.page4?.sub_titles?.[1]}:</h3>
                    <NotesField label={i18n.t('Immediate reportable diseases notes')} />
                </BulletinSection>
            )}

            <BulletinSection>
                <h3 className="my-4 text-center font-bold">
                    {i18n.t('WEEKLY REPORTABLE DISEASES – EPI {{week}}', { week })}
                </h3>
                <p>
                    <strong>{t?.pages?.sub_titles?.[0]}</strong>:{' '}
                    {t?.pages?.reportable_description?.[0]}
                </p>
                <p>{t?.pages?.reportable_description?.[1]}</p>
                <h3 className="mt-4 font-bold">{t?.pages?.sub_titles?.[1]}</h3>
                {BULLETIN_DISEASES.map((disease, index) => {
                    const points = diseaseSeries(analytics, disease.id)
                    const name = analytics.metaData?.items?.[disease.id]?.name ?? disease.name
                    return points.length ? (
                        <DiseaseAreaChart
                            key={disease.id}
                            title={name}
                            points={points}
                            color={colors[index % colors.length] ?? '#3b82f6'}
                        />
                    ) : (
                        <p
                            key={disease.id}
                            className="rounded bg-gray-100 p-8 text-center text-gray-500"
                        >
                            {i18n.t('No data found for {{name}}', { name })}
                        </p>
                    )
                })}
            </BulletinSection>

            {!!s?.totalDeaths && (
                <BulletinSection>
                    <h3 className="my-4 text-center font-bold">
                        {i18n.t(
                            'DISTRIBUTION OF REPORTED DEATHS IN eIDSR – EPIDEMIOLOGICAL {{week}}',
                            {
                                week,
                            }
                        )}
                    </h3>
                    <p>{s.pieDescription}</p>
                    <DeathsByTypePie data={s.deathsByType} />
                    <p>{s.deathsDescription}</p>
                    <MessageList items={s.deathMessages} empty={noCases} />
                    <h3 className="font-bold">{t?.pages?.sub_titles?.[2]}</h3>
                    <DeathsByFacilityTreemap data={s.deathsByFacility} />
                </BulletinSection>
            )}

            <BulletinSection title={t?.pages?.main_titles?.[2]}>
                <h3 className="mt-4 font-bold">{t?.pages?.sub_titles?.[3]}</h3>
                <OutbreakSampleTable />
                <h3 className="mt-4 font-bold">{t?.pages?.sub_titles?.[0]}</h3>
                <NotesField label={i18n.t('Description')} />
                <h3 className="mt-4 font-bold">{t?.pages?.sub_titles?.[4]}</h3>
                <NotesField label={i18n.t('Notes')} />
            </BulletinSection>

            <BulletinSection title={t?.pages?.main_titles?.[3]}>
                <p>{t?.pages?.body_content?.completness_description?.[0]}</p>
                <MessageList items={t?.pages?.body_content?.timeless_completness ?? []} empty="" />
                <NotesField label={i18n.t('Notes')} />
                <h3 className="mt-4 font-bold">{t?.pages?.sub_titles?.[5]}:</h3>
                <NotesField label={i18n.t('Notes')} />
            </BulletinSection>

            <CompletenessSampleTable />
        </article>
    )
}
