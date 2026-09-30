import i18n from '@dhis2/d2-i18n'
import { formatNumber } from '@/shared/utils/format'
import { useTrackerCases } from '../hooks/useSectionData'
import type { BulletinContext, TrackerCasesSection } from '../types/bulletin.types'
import { facilityCount } from '../utils/counts'
import { pickText } from '../utils/localizedText'
import type { GroupCount } from '../utils/summaries'
import { DistributionPie, DistributionTreemap } from './DistributionCharts'
import { ItemList, SectionFrame, SectionStatus } from './SectionFrame'

const sentence = (group: GroupCount) =>
    i18n.t('{{count}} case of {{name}} reported by {{facilities}}', {
        count: group.count,
        name: group.name,
        facilities: facilityCount(group.orgUnits),
        defaultValue: '{{count}} case of {{name}} reported by {{facilities}}',
        defaultValue_plural: '{{count}} cases of {{name}} reported by {{facilities}}',
    })

/** Cases, deaths and public health events of a tracker program for the period. */
export const TrackerCasesSectionView = ({
    section,
    context,
}: {
    section: TrackerCasesSection
    context: BulletinContext
}) => {
    const { data, isLoading, error } = useTrackerCases(section, context)
    const noCases = i18n.t('None reported.')
    return (
        <SectionFrame
            title={pickText(section.title, context.language, context.languages)}
            description={pickText(section.description, context.language, context.languages)}
        >
            <SectionStatus
                configured={!!section.program && !!section.groupBy}
                loading={isLoading}
                error={error}
            />
            {data && (
                <div className="flex flex-col gap-4">
                    <p>
                        {i18n.t('{{count}} record notified by {{facilities}}.', {
                            count: data.totalEnrollments,
                            facilities: facilityCount(data.facilities),
                            defaultValue: '{{count}} record notified by {{facilities}}.',
                            defaultValue_plural: '{{count}} records notified by {{facilities}}.',
                        })}
                    </p>
                    <div>
                        <h3 className="m-0 mb-1 text-base font-semibold">{i18n.t('Cases')}</h3>
                        <ItemList items={data.cases.map(sentence)} empty={noCases} />
                    </div>
                    {data.publicEvents.length > 0 && (
                        <div>
                            <h3 className="m-0 mb-1 text-base font-semibold">
                                {i18n.t('Public health events')}
                            </h3>
                            <ItemList items={data.publicEvents.map(sentence)} empty={noCases} />
                        </div>
                    )}
                    <div>
                        <h3 className="m-0 mb-1 text-base font-semibold">{i18n.t('Deaths')}</h3>
                        {data.totalDeaths > 0 ? (
                            <>
                                <p>
                                    {i18n.t('{{count}} death reported by {{facilities}}.', {
                                        count: data.totalDeaths,
                                        facilities: facilityCount(data.deathsByFacility.length),
                                        defaultValue: '{{count}} death reported by {{facilities}}.',
                                        defaultValue_plural:
                                            '{{count}} deaths reported by {{facilities}}.',
                                    })}{' '}
                                    {data.deathsByType
                                        .map((d) =>
                                            i18n.t('{{name}} {{value}} ({{percent}})', {
                                                name: d.name,
                                                value: formatNumber(d.value),
                                                percent: formatNumber(d.value / data.totalDeaths, {
                                                    style: 'percent',
                                                    maximumFractionDigits: 1,
                                                }),
                                            })
                                        )
                                        .join(', ')}
                                </p>
                                <DistributionPie data={data.deathsByType} />
                                <ItemList
                                    items={data.deathsByFacility.map((f) =>
                                        i18n.t('{{count}} death in {{facility}}', {
                                            count: f.value,
                                            facility: f.name,
                                            defaultValue: '{{count}} death in {{facility}}',
                                            defaultValue_plural: '{{count}} deaths in {{facility}}',
                                        })
                                    )}
                                    empty={noCases}
                                />
                                <DistributionTreemap data={data.deathsByFacility} />
                            </>
                        ) : (
                            <p className="text-gray-600">{noCases}</p>
                        )}
                    </div>
                </div>
            )}
        </SectionFrame>
    )
}
