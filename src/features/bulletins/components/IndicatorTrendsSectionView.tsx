import i18n from '@dhis2/d2-i18n'
import { ChartRenderer } from '@/features/charts'
import { initialVisualizer } from '@/features/visualizers'
import { useIndicatorTrends } from '../hooks/useSectionData'
import type { BulletinContext, IndicatorTrendsSection } from '../types/bulletin.types'
import { pickText } from '../utils/localizedText'
import { splitByDataItem } from '../utils/splitByDataItem'
import { SectionFrame, SectionStatus } from './SectionFrame'

const LAYOUT = { Columns: ['Data'], Rows: ['Period'], Filter: ['Organisation unit'] }

/** One chart per data item over the issue period and the ones before it. */
export const IndicatorTrendsSectionView = ({
    section,
    context,
}: {
    section: IndicatorTrendsSection
    context: BulletinContext
}) => {
    const { data, isLoading, error } = useIndicatorTrends(section, context)
    const charts = splitByDataItem(
        data,
        section.dataItems.map((item) => item.id)
    )
    return (
        <SectionFrame
            title={pickText(section.title, context.language, context.languages)}
            description={pickText(section.description, context.language, context.languages)}
        >
            <SectionStatus
                configured={section.dataItems.length > 0}
                loading={isLoading}
                error={error}
            />
            {charts.map(({ id, response }) => {
                const name =
                    response.metaData?.items?.[id]?.name ??
                    section.dataItems.find((item) => item.id === id)?.label ??
                    id
                return (
                    <figure key={id} className="m-0 mb-6 break-inside-avoid-page">
                        {response.rows.length ? (
                            <div className="h-72">
                                <ChartRenderer
                                    type={section.chartType}
                                    data={response}
                                    visualSettings={initialVisualizer.settings}
                                    visualTitleAndSubTitle={{
                                        ...initialVisualizer.titles,
                                        visualTitle: name,
                                    }}
                                    analyticsPayloadDeterminer={LAYOUT}
                                />
                            </div>
                        ) : (
                            <p className="rounded bg-gray-100 p-6 text-center text-gray-500">
                                {i18n.t('No data found for {{name}}', { name })}
                            </p>
                        )}
                    </figure>
                )
            })}
        </SectionFrame>
    )
}
