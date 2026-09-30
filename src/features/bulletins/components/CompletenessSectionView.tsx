import i18n from '@dhis2/d2-i18n'
import { periodLabel } from '@/features/periods'
import { formatPercent } from '@/shared/utils/format'
import { useCompleteness } from '../hooks/useSectionData'
import type { BulletinContext, CompletenessSection } from '../types/bulletin.types'
import { pickText } from '../utils/localizedText'
import { buildCompletenessMatrix, completenessLevel } from '../utils/summaries'
import { SectionFrame, SectionStatus } from './SectionFrame'

const CELL_CLASS = {
    good: 'bg-green-600 text-white',
    fair: 'bg-orange-500 text-white',
    poor: 'bg-red-600 text-white',
    none: 'bg-gray-100 text-gray-500',
} as const

/** Reporting rates (%) of the configured data sets, per org unit and period. */
export const CompletenessSectionView = ({
    section,
    context,
}: {
    section: CompletenessSection
    context: BulletinContext
}) => {
    const { query, periods } = useCompleteness(section, context)
    const rows = buildCompletenessMatrix(query.data, periods)
    return (
        <SectionFrame
            title={pickText(section.title, context.language, context.languages)}
            description={pickText(section.description, context.language, context.languages)}
        >
            <SectionStatus
                configured={section.dataSets.length > 0}
                loading={query.isLoading}
                error={query.error}
            />
            {query.data && (
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse text-center text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-3 py-2 text-left">
                                    {i18n.t('Organisation unit')}
                                </th>
                                {periods.map((period) => (
                                    <th key={period} className="border px-2 py-1">
                                        {periodLabel(period, context.calendar, context.language)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id}>
                                    <td className="border px-3 py-1 text-left">{row.label}</td>
                                    {row.values.map((value, index) => (
                                        <td
                                            key={index}
                                            className={`border px-2 py-1 ${CELL_CLASS[completenessLevel(value, section.thresholds)]}`}
                                        >
                                            {value === null ? '–' : formatPercent(value)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {!rows.length && (
                                <tr>
                                    <td colSpan={periods.length + 1} className="p-4 text-gray-500">
                                        {i18n.t('No reporting data for these periods.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </SectionFrame>
    )
}
