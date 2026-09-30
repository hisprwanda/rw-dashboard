import i18n from '@dhis2/d2-i18n'
import { formatNumber } from '@/shared/utils/format'
import { useTrackerCases } from '../hooks/useSectionData'
import type { BulletinContext, TrackerCasesSection } from '../types/bulletin.types'
import { pickText } from '../utils/localizedText'
import type { GroupCount } from '../utils/summaries'
import { DistributionPie, DistributionTreemap } from './DistributionCharts'
import { ItemList, SectionFrame, SectionStatus } from './SectionFrame'

const sentence = (group: GroupCount) =>
    i18n.t('{{count}} cases of {{name}} reported by {{facilities}} facilities', {
        count: group.count,
        name: group.name,
        facilities: group.orgUnits,
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
                        {i18n.t('{{count}} records were notified by {{facilities}} facilities.', {
                            count: data.totalEnrollments,
                            facilities: data.facilities,
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
                                    {i18n.t(
                                        '{{count}} deaths were reported by {{facilities}} facilities.',
                                        {
                                            count: data.totalDeaths,
                                            facilities: data.deathsByFacility.length,
                                        }
                                    )}{' '}
                                    {data.deathsByType
                                        .map((d) =>
                                            i18n.t('{{name}}: {{count}} ({{percent}})', {
                                                name: d.name,
                                                count: d.value,
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
                                        i18n.t('{{facility}}: {{count}} deaths', {
                                            facility: f.name,
                                            count: f.value,
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
